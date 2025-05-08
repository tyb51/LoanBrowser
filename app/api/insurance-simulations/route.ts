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

    // Get all insurance simulations for the case
    const insuranceSimulations = await prisma.insuranceSimulation.findMany({
      where: { caseId },
      include: {
        client: {
          select: {
            name: true,
            type: true
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
    const { name, type, parameters, clientId, caseId, calculateResult } = body;

    // Validate input
    if (!name || !type || !parameters || !clientId || !caseId) {
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

    // Check if client exists and belongs to the case
    const client = await prisma.client.findUnique({
      where: { 
        id: clientId,
        caseId
      }
    });

    if (!client) {
      return NextResponse.json(
        { message: "Client not found for this case" },
        { status: 404 }
      );
    }

    // Calculate result if requested
    let calculationResult = null;
    if (calculateResult) {
      if (type === 'LIFE') {
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
            age: client.age as number,
            smoker: client.smoker || false,
            height: client.height || undefined,
            weight: client.weight || undefined
          },
          loanAmount,
          termYears,
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

    // Create the insurance simulation
    const insuranceSimulation = await prisma.insuranceSimulation.create({
      data: {
        name,
        type,
        parameters,
        calculationResult,
        clientId,
        caseId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json(
      { 
        message: "Insurance simulation created successfully", 
        insuranceSimulation 
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
