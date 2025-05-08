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

    const { simId } = params;

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

    return NextResponse.json({ insuranceSimulation });
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
    const { name, parameters, calculateResult } = body;

    // Get the insurance simulation
    const insuranceSimulation = await prisma.insuranceSimulation.findUnique({
      where: { id: simId },
      include: {
        client: true,
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

    // Calculate result if requested
    let calculationResult = insuranceSimulation.calculationResult;
    if (calculateResult) {
      if (insuranceSimulation.type === 'LIFE') {
        // For life insurance
        const { 
          coveragePercentage, 
          paymentType, 
          basedOnRemainingCapital,
          loanAmount,
          termYears 
        } = parameters;

        // Get client data for calculation
        const lifeResult = calculateLifeInsurance({
          client: {
            age: insuranceSimulation.client.age as number,
            smoker: insuranceSimulation.client.smoker || false,
            height: insuranceSimulation.client.height || undefined,
            weight: insuranceSimulation.client.weight || undefined
          },
          loanAmount,
          termYears,
          coveragePercentage,
          paymentType,
          basedOnRemainingCapital
        });
        
        calculationResult = lifeResult;
      } 
      else if (insuranceSimulation.type === 'HOME') {
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

    // Update the insurance simulation
    const updatedInsuranceSimulation = await prisma.insuranceSimulation.update({
      where: { id: simId },
      data: {
        name: name || insuranceSimulation.name,
        parameters: parameters || insuranceSimulation.parameters,
        calculationResult,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ insuranceSimulation: updatedInsuranceSimulation });
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

    // Delete the insurance simulation
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
