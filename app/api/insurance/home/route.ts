import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { calculateHomeInsurance } from "@/app/lib/insurance";
import { prisma } from "@/app/lib/prisma";

// POST /api/insurance/home - Calculate home insurance premium
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
      clientId,
      loanId,
      propertyType,
      constructionYear,
      squareMeters,
      deductible = 500,
      coveragePercentage = 1.0,
      storeResult
    } = body;

    // Validate input
    if (!clientId || !loanId || !propertyType) {
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

    // Calculate home insurance
    const propertyValue = loan.purchasePrice || loan.principal;
    const result = calculateHomeInsurance({
      propertyValue,
      propertyType,
      constructionYear,
      squareMeters,
      deductible,
      coveragePercentage
    });

    // Store the result if requested
    if (storeResult) {
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
            initialPremium: result.monthlyPremium
          }
        });
      } else {
        // Create new insurance
        await prisma.insurance.create({
          data: {
            type: 'HOME',
            coveragePercentage: coveragePercentage as number,
            initialPremium: result.monthlyPremium,
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

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Error calculating home insurance:", error);
    return NextResponse.json(
      { message: "An error occurred while calculating home insurance" },
      { status: 500 }
    );
  }
}
