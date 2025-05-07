import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";
import { LoanType } from "@/prisma/generated/prisma/client";

// GET /api/loans - Get all loans for the authenticated user or a specific case
export async function GET(request: Request) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);

    // Return 401 if not authenticated
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get case ID from query parameters if provided
    const url = new URL(request.url);
    const caseId = url.searchParams.get('caseId');

    // Build query
    const query: any = {
      where: caseId ? { caseId } : { case: { userId: session.user.id } },
      include: {
        case: {
          select: {
            title: true,
            userId: true,
          },
        },
        clients: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    };

    // Check if the case belongs to the authenticated user if caseId is provided
    if (caseId) {
      const caseData = await prisma.case.findUnique({
        where: { id: caseId },
      });

      if (!caseData) {
        return NextResponse.json({ message: "Case not found" }, { status: 404 });
      }

      if (caseData.userId !== session.user.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
      }
    }

    // Get loans
    const loans = await prisma.loanSimulation.findMany(query);

    return NextResponse.json({ loans });
  } catch (error) {
    console.error("Error fetching loans:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching loans" },
      { status: 500 }
    );
  }
}

// POST /api/loans - Create a new loan simulation
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
      params, 
      clientIds, 
      caseId, 
      calculationResult 
    } = body;

    // Validate required fields
    if (!name || !params || !caseId || !clientIds || clientIds.length === 0) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if case exists and belongs to the authenticated user
    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
    });

    if (!caseData) {
      return NextResponse.json(
        { message: "Case not found" },
        { status: 404 }
      );
    }

    if (caseData.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Check if all clients belong to the case
    const clientCount = await prisma.client.count({
      where: {
        id: { in: clientIds },
        caseId: caseId,
      },
    });

    if (clientCount !== clientIds.length) {
      return NextResponse.json(
        { message: "One or more clients don't belong to the specified case" },
        { status: 400 }
      );
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
    } = params;

    // Cast loanType string to Prisma LoanType enum
    const loanTypeEnum: LoanType = (typeof loanType === "string" && loanType in LoanType)
      ? LoanType[loanType.toUpperCase() as keyof typeof LoanType]
      : LoanType.ANNUITY;

    // Create the loan simulation
    const loan = await prisma.loanSimulation.create({
      data: {
        name,
        loanType: loanTypeEnum,
        principal,
        interestRate,
        termYears,
        ownContribution,
        purchasePrice,
        delayMonths: delayMonths || 0,
        startYear: startYear || new Date().getFullYear(),
        insuranceCoveragePct: insuranceCoveragePct || 1.0,
        monthlyPayment: calculationResult?.statistics?.medianMonthlyPayment || 0,
        totalInterest: calculationResult?.statistics?.totalInterestPaid || 0,
        totalPayment: (calculationResult?.statistics?.totalPrincipalPaid || 0) + 
                      (calculationResult?.statistics?.totalInterestPaid || 0),
        calculationResult: JSON.stringify(calculationResult),
        caseId,
        clients: {
          connect: clientIds.map(id => ({ id })),
        },
      },
    });

    return NextResponse.json(
      { message: "Loan simulation created successfully", loan },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating loan simulation:", error);
    return NextResponse.json(
      { message: "An error occurred while creating the loan simulation" },
      { status: 500 }
    );
  }
}
