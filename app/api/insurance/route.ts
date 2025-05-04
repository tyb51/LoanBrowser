import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { calculateLifeInsurance, calculateHomeInsurance } from "@/app/lib/insurance";
import { prisma } from "@/app/lib/prisma";

// GET /api/insurance?caseId={caseId} - Get all insurance for a case
export async function GET(request: Request) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);

    // Return 401 if not authenticated
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get case ID from query parameters
    const url = new URL(request.url);
    const caseId = url.searchParams.get('caseId');

    if (!caseId) {
      return NextResponse.json(
        { message: "Case ID is required" },
        { status: 400 }
      );
    }

    // Check if case exists and belongs to the authenticated user
    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        clients: {
          include: {
            insurances: {
              include: {
                lifeInsurance: true,
                homeInsurance: true
              }
            }
          }
        }
      }
    });

    if (!caseData) {
      return NextResponse.json(
        { message: "Case not found" },
        { status: 404 }
      );
    }

    // Check if the case belongs to the authenticated user
    if (caseData.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Return all insurances for all clients in the case
    return NextResponse.json({
      insurances: caseData.clients.flatMap(client => 
        client.insurances.map(insurance => ({
          ...insurance,
          clientName: client.name,
          clientType: client.type
        }))
      )
    });
  } catch (error) {
    console.error("Error fetching insurances:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching insurances" },
      { status: 500 }
    );
  }
}

// POST /api/insurance - Calculate both life and home insurance
export async function POST(request: Request) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);

    // Return 401 if not authenticated
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get the request body
    const body = await request.json();
    const {
      caseId,
      clientIds,
      loanId,
      lifeInsurance,
      homeInsurance,
      storeResult
    } = body;

    // Validate input
    if (!caseId || !clientIds || !loanId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if case exists and belongs to the authenticated user
    const caseData = await prisma.case.findUnique({
      where: { id: caseId }
    });

    if (!caseData) {
      return NextResponse.json(
        { message: "Case not found" },
        { status: 404 }
      );
    }

    // Check if the case belongs to the authenticated user
    if (caseData.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get loan data
    const loan = await prisma.loanSimulation.findUnique({
      where: { id: loanId, caseId }
    });

    if (!loan) {
      return NextResponse.json(
        { message: "Loan not found for this case" },
        { status: 404 }
      );
    }

    // Get client data
    const clients = await prisma.client.findMany({
      where: {
        id: { in: clientIds },
        caseId
      }
    });

    if (clients.length === 0) {
      return NextResponse.json(
        { message: "No valid clients found for this case" },
        { status: 404 }
      );
    }

    const results = {
      lifeInsuranceResults: [],
      homeInsuranceResults: [],
      totalMonthlyPremium: 0
    };

    // Calculate life insurance for each eligible client
    if (lifeInsurance) {
      const { coveragePercentage, paymentType, basedOnRemainingCapital } = lifeInsurance;
      
      // Only calculate for individual clients
      const individualClients = clients.filter(client => 
        client.type === 'INDIVIDUAL' && client.age !== null
      );
      
      for (const client of individualClients) {
        const lifeResult = calculateLifeInsurance({
          client: {
            age: client.age as number,
            smoker: client.smoker || false,
            height: client.height || undefined,
            weight: client.weight || undefined
          },
          loanAmount: loan.principal,
          termYears: loan.termYears,
          coveragePercentage,
          paymentType,
          basedOnRemainingCapital
        });
        
        results.lifeInsuranceResults.push({
          clientId: client.id,
          clientName: client.name,
          ...lifeResult
        });
        
        results.totalMonthlyPremium += lifeResult.monthlyPremium;
        
        // Store the result if requested
        if (storeResult) {
          await storeLifeInsurance(
            client.id,
            coveragePercentage,
            paymentType,
            basedOnRemainingCapital,
            lifeResult.monthlyPremium
          );
        }
      }
    }
    
    // Calculate home insurance if requested
    if (homeInsurance) {
      const {
        propertyType,
        constructionYear,
        squareMeters,
        deductible = 500,
        coveragePercentage = 1.0
      } = homeInsurance;
      
      // Home insurance is usually associated with the primary client
      const primaryClient = clients[0];
      
      const propertyValue = loan.purchasePrice || loan.principal;
      const homeResult = calculateHomeInsurance({
        propertyValue,
        propertyType,
        constructionYear,
        squareMeters,
        deductible,
        coveragePercentage
      });
      
      results.homeInsuranceResults.push({
        clientId: primaryClient.id,
        clientName: primaryClient.name,
        ...homeResult
      });
      
      results.totalMonthlyPremium += homeResult.monthlyPremium;
      
      // Store the result if requested
      if (storeResult) {
        await storeHomeInsurance(
          primaryClient.id,
          propertyType,
          propertyValue,
          coveragePercentage,
          homeResult.monthlyPremium
        );
      }
    }
    
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error calculating insurance:", error);
    return NextResponse.json(
      { message: "An error occurred while calculating insurance" },
      { status: 500 }
    );
  }
}

// Helper function to store life insurance
async function storeLifeInsurance(
  clientId: string,
  coveragePercentage: number,
  paymentType: 'LUMP_SUM' | 'DISTRIBUTED',
  basedOnRemainingCapital: boolean,
  monthlyPremium: number
) {
  // Check if insurance already exists for this client
  const existingInsurance = await prisma.insurance.findFirst({
    where: {
      clientId,
      type: 'LIFE'
    },
    include: {
      lifeInsurance: true
    }
  });

  if (existingInsurance) {
    // Update existing insurance
    await prisma.lifeInsurance.update({
      where: { 
        id: existingInsurance.lifeInsurance?.id
      },
      data: {
        paymentType,
        basedOnRemainingCapital
      }
    });

    await prisma.insurance.update({
      where: { id: existingInsurance.id },
      data: {
        coveragePercentage,
        initialPremium: monthlyPremium
      }
    });
  } else {
    // Create new insurance
    await prisma.insurance.create({
      data: {
        type: 'LIFE',
        coveragePercentage,
        initialPremium: monthlyPremium,
        clientId,
        lifeInsurance: {
          create: {
            paymentType,
            basedOnRemainingCapital
          }
        }
      }
    });
  }
}

// Helper function to store home insurance
async function storeHomeInsurance(
  clientId: string,
  propertyType: string,
  propertyValue: number,
  coveragePercentage: number,
  monthlyPremium: number
) {
  // Check if insurance already exists for this client
  const existingInsurance = await prisma.insurance.findFirst({
    where: {
      clientId,
      type: 'HOME'
    },
    include: {
      homeInsurance: true
    }
  });

  if (existingInsurance) {
    // Update existing insurance
    await prisma.homeInsurance.update({
      where: { 
        id: existingInsurance.homeInsurance?.id
      },
      data: {
        propertyValue,
        propertyType
      }
    });

    await prisma.insurance.update({
      where: { id: existingInsurance.id },
      data: {
        coveragePercentage,
        initialPremium: monthlyPremium
      }
    });
  } else {
    // Create new insurance
    await prisma.insurance.create({
      data: {
        type: 'HOME',
        coveragePercentage,
        initialPremium: monthlyPremium,
        clientId,
        homeInsurance: {
          create: {
            propertyValue,
            propertyType
          }
        }
      }
    });
  }
}