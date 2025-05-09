import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";
import { calculateLifeInsurance } from "@/app/lib/insurance";

interface Params {
  params: {
    simId: string;
  };
}

// POST /api/insurance-simulations/[simId]/calculate - Calculate insurance for a specific loan
export async function POST(request: Request, { params }: Params) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);

    // Return 401 if not authenticated
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { simId } = params;
    const url = new URL(request.url);
    const loanId = url.searchParams.get('loanId');

    if (!loanId) {
      return NextResponse.json(
        { message: "Loan ID is required" },
        { status: 400 }
      );
    }

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

    // Only life insurance can be calculated with different loans
    if (insuranceSimulation.type !== 'LIFE') {
      return NextResponse.json(
        { message: "Only life insurance can be calculated for specific loans" },
        { status: 400 }
      );
    }

    // Get the loan
    const loan = await prisma.loanSimulation.findUnique({
      where: {
        id: loanId,
        caseId: insuranceSimulation.caseId
      }
    });

    if (!loan) {
      return NextResponse.json(
        { message: "Loan not found for this case" },
        { status: 404 }
      );
    }

    // Calculate life insurance premium based on loan
    if (!insuranceSimulation.client) {
      return NextResponse.json(
        { message: "Client data required for calculation" },
        { status: 400 }
      );
    }

    const { coveragePercentage, paymentType, basedOnRemainingCapital } = insuranceSimulation.parameters as any;

    const calculationResult = calculateLifeInsurance({
      client: {
        age: insuranceSimulation.client.age as number,
        smoker: insuranceSimulation.client.smoker || false,
        height: insuranceSimulation.client.height || undefined,
        weight: insuranceSimulation.client.weight || undefined
      },
      loanAmount: loan.principal,
      termYears: loan.termYears,
      coveragePercentage,
      paymentType,
      basedOnRemainingCapital
    });

    // Update the insurance simulation with the new calculation result
    // Note: We don't permanently store this calculation since it's for a specific loan
    // and may be different from the default loan associated with the insurance

    return NextResponse.json({
      calculationResult,
      loanInfo: {
        id: loan.id,
        name: loan.name,
        principal: loan.principal,
        termYears: loan.termYears
      }
    });
  } catch (error) {
    console.error("Error calculating insurance:", error);
    return NextResponse.json(
      { message: "An error occurred while calculating insurance" },
      { status: 500 }
    );
  }
}