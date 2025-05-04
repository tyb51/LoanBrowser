import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { calculateLifeInsurance } from "@/app/lib/insurance";
import { prisma } from "@/app/lib/prisma";

// POST /api/insurance/life - Calculate life insurance premium
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
    const { clientId, loanId, coveragePercentage, paymentType, basedOnRemainingCapital, storeResult } = body;

    // Validate input
    if (!clientId || !loanId || coveragePercentage === undefined) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get client data
    const client = await prisma.client.findUnique({
      where: { id: clientId }
    });

    if (!client) {
      return NextResponse.json(
        { message: "Client not found" },
        { status: 404 }
      );
    }

    // Get loan data
    const loan = await prisma.loanSimulation.findUnique({
      where: { id: loanId }
    });

    if (!loan) {
      return NextResponse.json(
        { message: "Loan not found" },
        { status: 404 }
      );
    }

    // Validate client type (must be individual)
    if (client.type !== 'INDIVIDUAL') {
      return NextResponse.json(
        { message: "Life insurance can only be calculated for individual clients" },
        { status: 400 }
      );
    }

    // Validate client data
    if (client.age === null) {
      return NextResponse.json(
        { message: "Client age is required for life insurance calculation" },
        { status: 400 }
      );
    }

    // Calculate life insurance
    const result = calculateLifeInsurance({
      client: {
        age: client.age as number,
        smoker: client.smoker || false,
        height: client.height || undefined,
        weight: client.weight || undefined
      },
      loanAmount: loan.principal,
      termYears: loan.termYears,
      coveragePercentage,
      paymentType: paymentType || 'DISTRIBUTED',
      basedOnRemainingCapital: basedOnRemainingCapital || false
    });

    // Store the result if requested
    if (storeResult) {
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
            initialPremium: result.monthlyPremium
          }
        });
      } else {
        // Create new insurance
        await prisma.insurance.create({
          data: {
            type: 'LIFE',
            coveragePercentage,
            initialPremium: result.monthlyPremium,
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

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Error calculating life insurance:", error);
    return NextResponse.json(
      { message: "An error occurred while calculating life insurance" },
      { status: 500 }
    );
  }
}
