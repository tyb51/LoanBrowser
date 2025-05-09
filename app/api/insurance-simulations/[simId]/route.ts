import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";
import { calculateLifeInsurance, calculateHomeInsurance } from "@/app/lib/insurance";

interface Params {
  params: {
    simId: string;
  };
}

// GET /api/insurance-simulations/[simId] - Get a specific insurance simulation
export async function GET(request: Request, { params }: Params) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);

    // Return 401 if not authenticated
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { simId } = await params;
    const url = new URL(request.url);
    const loanId = url.searchParams.get('loanId');

    // Get the insurance simulation
    const insuranceSimulation = await prisma.insuranceSimulation.findUnique({
      where: { id: simId },
      include: {
        client: {
          select: {
            name: true,
            type: true,
            age: true,
            smoker: true,
            height: true,
            weight: true
          }
        },
        homeInsuranceClients: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          }
        },
        case: {
          select: {
            userId: true
          }
        }
      }
    });

    if (!insuranceSimulation) {
      return NextResponse.json(
        { message: "Insurance simulation not found" },
        { status: 404 }
      );
    }

    // Check if the insurance simulation belongs to the authenticated user
    if (insuranceSimulation.case.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    // If this is a life insurance and a loan ID is provided, include the loan data
    let currentLoan = null;
    if (insuranceSimulation.type === 'LIFE' && loanId) {
      currentLoan = await prisma.loanSimulation.findUnique({
        where: {
          id: loanId,
          caseId: insuranceSimulation.caseId
        },
        select: {
          id: true,
          name: true,
          principal: true,
          termYears: true
        }
      });

      if (!currentLoan) {
        return NextResponse.json(
          { message: "Selected loan not found for this case" },
          { status: 404 }
        );
      }

      // Recalculate the insurance premium based on the selected loan
      if (insuranceSimulation.client) {
        const { coveragePercentage, paymentType, basedOnRemainingCapital } = insuranceSimulation.parameters as any;

        const lifeResult = calculateLifeInsurance({
          client: {
            age: insuranceSimulation.client.age as number,
            smoker: insuranceSimulation.client.smoker || false,
            height: insuranceSimulation.client.height || undefined,
            weight: insuranceSimulation.client.weight || undefined
          },
          loanAmount: currentLoan.principal,
          termYears: currentLoan.termYears,
          coveragePercentage,
          paymentType,
          basedOnRemainingCapital
        });

        insuranceSimulation.calculationResult = lifeResult;
      }
    }

    // Add the current loan to the response
    const result = {
      ...insuranceSimulation,
      currentLoan
    };

    return NextResponse.json({ insuranceSimulation: result });
  } catch (error) {
    console.error("Error fetching insurance simulation:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching the insurance simulation" },
      { status: 500 }
    );
  }
}

// PUT /api/insurance-simulations/[simId] - Update an insurance simulation
export async function PUT(request: Request, { params }: Params) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);

    // Return 401 if not authenticated
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { simId } = params;

    // Get the request body
    const body = await request.json();
    const { 
      name, 
      parameters, 
      clientIds, 
      selectedLoanId, 
      simulatedInterestRate, 
      calculateResult 
    } = body;

    // Get the insurance simulation
    const insuranceSimulation = await prisma.insuranceSimulation.findUnique({
      where: { id: simId },
      include: {
        client: true,
        homeInsuranceClients: true,
        case: {
          select: {
            userId: true,
            id: true
          }
        }
      }
    });

    if (!insuranceSimulation) {
      return NextResponse.json(
        { message: "Insurance simulation not found" },
        { status: 404 }
      );
    }

    // Check if the insurance simulation belongs to the authenticated user
    if (insuranceSimulation.case.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Validate clients if new clientIds are provided
    let clients = [];
    if (clientIds && clientIds.length > 0) {
      clients = await prisma.client.findMany({
        where: {
          id: { in: clientIds },
          caseId: insuranceSimulation.case.id
        }
      });

      if (clients.length !== clientIds.length) {
        return NextResponse.json(
          { message: "One or more clients not found for this case" },
          { status: 404 }
        );
      }
    }

    // Validate selected loan if provided
    let selectedLoan = null;
    if (selectedLoanId) {
      selectedLoan = await prisma.loanSimulation.findUnique({
        where: {
          id: selectedLoanId,
          caseId: insuranceSimulation.case.id
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
    let calculationResult = insuranceSimulation.calculationResult;
    if (calculateResult) {
      const paramsToUse = parameters || insuranceSimulation.parameters;
      
      if (insuranceSimulation.type === 'LIFE') {
        // Get client data for calculation
        const clientToUse = clients.length > 0 ? clients[0] : insuranceSimulation.client;
        const loanToUse = selectedLoan || await prisma.loanSimulation.findFirst({
          where: { caseId: insuranceSimulation.case.id }
        });
        
        if (clientToUse && loanToUse) {
          const { 
            coveragePercentage, 
            paymentType, 
            basedOnRemainingCapital 
          } = paramsToUse as any;

          const lifeResult = calculateLifeInsurance({
            client: {
              age: clientToUse.age as number,
              smoker: clientToUse.smoker || false,
              height: clientToUse.height || undefined,
              weight: clientToUse.weight || undefined
            },
            loanAmount: loanToUse.principal,
            termYears: loanToUse.termYears,
            coveragePercentage,
            paymentType,
            basedOnRemainingCapital
          });
          
          calculationResult = lifeResult;
        }
      } 
      else if (insuranceSimulation.type === 'HOME') {
        const {
          propertyValue,
          propertyType,
          constructionYear,
          squareMeters,
          deductible,
          coveragePercentage
        } = paramsToUse as any;
        
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

    // Update the insurance simulation in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Update base insurance simulation
      const updatedSimulation = await prisma.insuranceSimulation.update({
        where: { id: simId },
        data: {
          name: name || insuranceSimulation.name,
          parameters: parameters || insuranceSimulation.parameters,
          calculationResult,
          simulatedInterestRate: simulatedInterestRate !== undefined ? 
            (simulatedInterestRate > 0 ? simulatedInterestRate : null) : 
            insuranceSimulation.simulatedInterestRate,
          // For life insurance, update clientId if provided
          clientId: insuranceSimulation.type === 'LIFE' && clientIds && clientIds.length > 0 ? 
            clientIds[0] : insuranceSimulation.clientId,
          updatedAt: new Date()
        }
      });

      // For HOME insurance, update client associations if clientIds are provided
      if (insuranceSimulation.type === 'HOME' && clientIds && clientIds.length > 0) {
        // Delete existing associations
        await prisma.homeInsuranceClient.deleteMany({
          where: { insuranceSimulationId: simId }
        });

        // Create new associations
        const params = parameters as any;
        const clientShareEntries = clientIds.map(clientId => ({
          insuranceSimulationId: simId,
          clientId,
          sharePercentage: params?.clientShares?.[clientId] || (100 / clientIds.length)
        }));

        await prisma.homeInsuranceClient.createMany({
          data: clientShareEntries
        });
      }

      // Fetch updated insurance simulation with associations
      return await prisma.insuranceSimulation.findUnique({
        where: { id: simId },
        include: {
          client: {
            select: {
              name: true,
              type: true,
              age: true,
              smoker: true,
              height: true,
              weight: true
            }
          },
          homeInsuranceClients: {
            include: {
              client: {
                select: {
                  id: true,
                  name: true,
                  type: true
                }
              }
            }
          }
        }
      });
    });

    return NextResponse.json({ insuranceSimulation: result });
  } catch (error) {
    console.error("Error updating insurance simulation:", error);
    return NextResponse.json(
      { message: "An error occurred while updating the insurance simulation" },
      { status: 500 }
    );
  }
}

// DELETE /api/insurance-simulations/[simId] - Delete an insurance simulation
export async function DELETE(request: Request, { params }: Params) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);

    // Return 401 if not authenticated
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { simId } = params;

    // Get the insurance simulation
    const insuranceSimulation = await prisma.insuranceSimulation.findUnique({
      where: { id: simId },
      include: {
        case: {
          select: {
            userId: true
          }
        }
      }
    });

    if (!insuranceSimulation) {
      return NextResponse.json(
        { message: "Insurance simulation not found" },
        { status: 404 }
      );
    }

    // Check if the insurance simulation belongs to the authenticated user
    if (insuranceSimulation.case.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Delete the insurance simulation (cascade will handle related records)
    await prisma.insuranceSimulation.delete({
      where: { id: simId }
    });

    return NextResponse.json({ message: "Insurance simulation deleted successfully" });
  } catch (error) {
    console.error("Error deleting insurance simulation:", error);
    return NextResponse.json(
      { message: "An error occurred while deleting the insurance simulation" },
      { status: 500 }
    );
  }
}