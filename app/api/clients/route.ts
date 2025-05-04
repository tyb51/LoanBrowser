import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";

// GET /api/clients - Get all clients for the authenticated user
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
    const query: any = {};
    
    if (caseId) {
      // Get clients for a specific case
      const caseData = await prisma.case.findUnique({
        where: { id: caseId },
      });

      // Return 404 if case not found
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

      // Add case ID to query
      query.where = { caseId };
    } else {
      // Get all clients for the authenticated user
      query.where = {
        case: {
          userId: session.user.id,
        },
      };
    }

    // Get clients
    const clients = await prisma.client.findMany(query);

    return NextResponse.json({ clients });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching clients" },
      { status: 500 }
    );
  }
}

// POST /api/clients - Create a new client
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
      age, 
      height, 
      weight, 
      smoker, 
      currentCapital, 
      currentDebt, 
      monthlyIncome, 
      caseId 
    } = body;

    // Validate input
    if (!name || !type || !caseId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // For individual clients, require age
    if (type === 'INDIVIDUAL' && (age === null || age === undefined)) {
      return NextResponse.json(
        { message: "Age is required for individual clients" },
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

    // Check if the case belongs to the authenticated user
    if (caseData.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Create the client
    const client = await prisma.client.create({
      data: {
        name,
        type,
        age: type === 'INDIVIDUAL' ? age : null,
        height: type === 'INDIVIDUAL' ? height : null,
        weight: type === 'INDIVIDUAL' ? weight : null,
        smoker: type === 'INDIVIDUAL' ? smoker : null,
        currentCapital: currentCapital || 0,
        currentDebt: currentDebt || 0,
        monthlyIncome: monthlyIncome || 0,
        caseId,
      },
    });

    return NextResponse.json(
      { 
        message: "Client created successfully", 
        client 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { message: "An error occurred while creating the client" },
      { status: 500 }
    );
  }
}
