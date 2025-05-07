import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";
import { LoanType } from "@/prisma/generated/prisma/client";

// GET /api/loans/[id] - Get a specific loan by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);

    // Return 401 if not authenticated
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;

    // Get the loan with related data
    const loan = await prisma.loanSimulation.findUnique({
      where: { id },
      include: {
        case: {
          select: {
            userId: true,
            title: true,
            description: true,
            projectName: true,
            purchasePrice: true,
            purchaseDate: true,
          },
        },
        clients: true,
        modularSchedule: true,
      },
    });

    // Return 404 if loan not found
    if (!loan) {
      return NextResponse.json(
        { message: "Loan simulation not found" },
        { status: 404 }
      );
    }

    // Check if the loan belongs to the authenticated user
    if (loan.case.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json({ loan });
  } catch (error) {
    console.error("Error fetching loan:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching the loan" },
      { status: 500 }
    );
  }
}

// PUT /api/loans/[id] - Update a loan
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);

    // Return 401 if not authenticated
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;

    // Get the loan
    const existingLoan = await prisma.loanSimulation.findUnique({
      where: { id },
      include: {
        case: {
          select: {
            userId: true,
          },
        },
      },
    });

    // Return 404 if loan not found
    if (!existingLoan) {
      return NextResponse.json(
        { message: "Loan simulation not found" },
        { status: 404 }
      );
    }

    // Check if the loan belongs to the authenticated user
    if (existingLoan.case.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get the request body
    const body = await request.json();
    const { 
      name, 
      params: loanParams, 
      clientIds, 
      calculationResult 
    } = body;

    // Validate input
    if (!name || !loanParams) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if clients belong to the same case
    if (clientIds && clientIds.length > 0) {
      const clientCount = await prisma.client.count({
        where: {
          id: { in: clientIds },
          caseId: existingLoan.caseId,
        },
      });

      if (clientCount !== clientIds.length) {
        return NextResponse.json(
          { message: "One or more clients don't belong to the specified case" },
          { status: 400 }
        );
      }
    }

    // Transform params to database format
    const {
      loanType,
      principal,
      interestRate,
      termYears,
      ownContribution,
      purchasePrice,
      delayMonths,
      startYear,
      insuranceCoveragePct,
    } = loanParams;
    console.log("Loan parameters:", loanParams);
    // Update calculation statistics if available
    let monthlyPayment = existingLoan.monthlyPayment;
    let totalInterest = existingLoan.totalInterest;
    let totalPayment = existingLoan.totalPayment;
    let calculationResultStr = existingLoan.calculationResult;

    if (calculationResult) {
      monthlyPayment = calculationResult.statistics?.medianMonthlyPayment || monthlyPayment;
      totalInterest = calculationResult.statistics?.totalInterestPaid || totalInterest;
      totalPayment = (calculationResult.statistics?.totalPrincipalPaid || 0) + 
                    (calculationResult.statistics?.totalInterestPaid || 0);
      calculationResultStr = JSON.stringify(calculationResult);
    }
    // Cast loanType string to Prisma LoanType enum
    const loanTypeEnum: LoanType = (typeof loanType === "string" && loanType in LoanType)
      ? LoanType[loanType.toUpperCase() as keyof typeof LoanType]
      : LoanType.ANNUITY;
    // Update the loan
    const updatedData: any = {
      name,
      loanType:loanTypeEnum,
      principal,
      interestRate,
      termYears,
      ownContribution,
      purchasePrice,
      delayMonths: delayMonths || 0,
      startYear: startYear || new Date().getFullYear(),
      insuranceCoveragePct: insuranceCoveragePct || 1.0,
      monthlyPayment,
      totalInterest,
      totalPayment,
    };

    // Only update calculation result if provided
    if (calculationResultStr) {
      updatedData.calculationResult = calculationResultStr;
    }

    // Prepare client update operation
    let clientsOperation: any = {};
    if (clientIds && clientIds.length > 0) {
      // Get current client IDs
      const currentClientIds = (await prisma.loanSimulation.findUnique({
        where: { id },
        include: {
          clients: {
            select: { id: true },
          },
        },
      }))?.clients.map(client => client.id) || [];

      // First disconnect all existing clients
      clientsOperation = {
        disconnect: currentClientIds.map(id => ({ id })),
        connect: clientIds.map(id => ({ id })),
      };
    }

    // Update the loan
    const updatedLoan = await prisma.loanSimulation.update({
      where: { id },
      data: {
        ...updatedData,
        clients: clientsOperation,
      },
      include: {
        case: {
          select: {
            userId: true,
            title: true,
          },
        },
        clients: true,
      },
    });

    return NextResponse.json({
      message: "Loan simulation updated successfully",
      loan: updatedLoan,
    });
  } catch (error) {
    console.error("Error updating loan:", error);
    return NextResponse.json(
      { message: "An error occurred while updating the loan" },
      { status: 500 }
    );
  }
}

// DELETE /api/loans/[id] - Delete a loan
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);

    // Return 401 if not authenticated
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;

    // Get the loan
    const existingLoan = await prisma.loanSimulation.findUnique({
      where: { id },
      include: {
        case: {
          select: {
            userId: true,
          },
        },
      },
    });

    // Return 404 if loan not found
    if (!existingLoan) {
      return NextResponse.json(
        { message: "Loan simulation not found" },
        { status: 404 }
      );
    }

    // Check if the loan belongs to the authenticated user
    if (existingLoan.case.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Delete the loan
    await prisma.loanSimulation.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Loan simulation deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting loan:", error);
    return NextResponse.json(
      { message: "An error occurred while deleting the loan" },
      { status: 500 }
    );
  }
}
