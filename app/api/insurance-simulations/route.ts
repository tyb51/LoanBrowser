import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";
import { calculateLifeInsurance, calculateHomeInsurance } from "@/app/lib/insurance";

// GET /api/insurance-simulations?caseId={caseId} - Get all insurance simulations for a case
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
      select: { userId: true }
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

    // Get all insurance simulations for the case with different includes based on type
    const insuranceSimulations = await prisma.insuranceSimulation.findMany({
      where: { caseId },
      include: {
        client: {
          select: {
            name: true,
            type: true
          }
        },
        homeInsuranceClients: {
          include: {
            client: {
              select: {
                name: true,
                type: true
              }
            }
          }
        }
      }
    });

    // Return the insurance simulations
    return NextResponse.json({ insuranceSimulations });
  } catch (error) {
    console.error("Error fetching insurance simulations:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching insurance simulations" },
      { status: 500 }
    );
  }
}

// POST /api/insurance-simulations - Create a new insurance simulation
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
      name, 
      type, 
      parameters, 
      clientIds, 
      caseId, 
      selectedLoanId, 
      simulatedInterestRate, 
      calculateResult 
    } = body;

    // Validate input
    if (!name || !type || !parameters || !clientIds || !caseId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if case exists and belongs to the authenticated user
    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
      select: { userId: true }
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

    // Validate clients exist and belong to the case
    const clients = await prisma.client.findMany({
      where: {
        id: { in: clientIds },
        caseId
      }
    });

    if (clients.length !== clientIds.length) {
      return NextResponse.json(
        { message: "One or more clients not found for this case" },
        { status: 404 }
      );
    }

    // For life insurance, validate selectedLoanId
    let selectedLoan = null;
    if (type === 'LIFE' && selectedLoanId) {
      selectedLoan = await prisma.loanSimulation.findUnique({
        where: {
          id: selectedLoanId,
          caseId
        }
      });

      if (!selectedLoan) {
        return NextResponse.json(
          { message: "Selected loan not found for this case" },
          { status: 404 }
        );
      }
    }

    // Calculate result if requested
    let calculationResult = null;
    if (calculateResult) {
      if (type === 'LIFE' && selectedLoan) {
        // For life insurance
        const { 
          coveragePercentage, 
          paymentType, 
          basedOnRemainingCapital 
        } = parameters;

        // Get client data for calculation
        const client = clients[0]; // Life insurance is linked to a single client
        
        const lifeResult = calculateLifeInsurance({
          client: {
            age: client.age as number,
            smoker: client.smoker || false,
            height: client.height || undefined,
            weight: client.weight || undefined
          },
          loanAmount: selectedLoan.principal,
          termYears: selectedLoan.termYears,
          coveragePercentage,
          paymentType,
          basedOnRemainingCapital
        });
        
        calculationResult = lifeResult;
      } 
      else if (type === 'HOME') {
        // For home insurance
        const {
          propertyValue,
          propertyType,
          constructionYear,
          squareMeters,
          deductible,
          coveragePercentage
        } = parameters;
        
        const homeResult = calculateHomeInsurance({
          propertyValue,
          propertyType,
          constructionYear,
          squareMeters,
          deductible,
          coveragePercentage
        });
        
        calculationResult = homeResult;
      }
    }

    // Create the insurance simulation in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create the base insurance simulation
      const insuranceSimulation = await prisma.insuranceSimulation.create({
        data: {
          name,
          type,
          parameters,
          calculationResult,
          // clientId only for LIFE insurance
          clientId: type === 'LIFE' ? clientIds[0] : undefined,
          caseId,
          simulatedInterestRate: simulatedInterestRate > 0 ? simulatedInterestRate : undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      });

      // For HOME insurance, create the client associations
      if (type === 'HOME' && parameters.clientShares) {
        const clientShareEntries = clientIds.map(clientId => ({
          insuranceSimulationId: insuranceSimulation.id,
          clientId,
          sharePercentage: parameters.clientShares?.[clientId] || (100 / clientIds.length)
        }));

        await prisma.homeInsuranceClient.createMany({
          data: clientShareEntries
        });
      }

      // Fetch the complete insurance simulation with associations
      return await prisma.insuranceSimulation.findUnique({
        where: { id: insuranceSimulation.id },
        include: {
          client: {
            select: {
              name: true,
              type: true
            }
          },
          homeInsuranceClients: {
            include: {
              client: {
                select: {
                  name: true,
                  type: true
                }
              }
            }
          }
        }
      });
    });

    return NextResponse.json(
      { 
        message: "Insurance simulation created successfully", 
        insuranceSimulation: result
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating insurance simulation:", error);
    return NextResponse.json(
      { message: "An error occurred while creating the insurance simulation" },
      { status: 500 }
    );
  }
}