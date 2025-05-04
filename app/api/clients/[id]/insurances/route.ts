import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";

interface Params {
  params: {
    id: string;
  };
}

// GET /api/clients/[id]/insurances - Get all insurances for a specific client
export async function GET(request: Request, { params }: Params) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);

    // Return 401 if not authenticated
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const clientId = params.id;

    // Check if client exists and belongs to the authenticated user
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        case: {
          select: {
            userId: true,
          },
        },
      },
    });

    // Return 404 if client not found
    if (!client) {
      return NextResponse.json(
        { message: "Client not found" },
        { status: 404 }
      );
    }

    // Check if the client's case belongs to the authenticated user
    if (client.case.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get all insurances for the client
    const insurances = await prisma.insurance.findMany({
      where: { clientId },
      include: {
        lifeInsurance: true,
        homeInsurance: true,
      },
    });

    return NextResponse.json({ insurances });
  } catch (error) {
    console.error("Error fetching insurances:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching insurances" },
      { status: 500 }
    );
  }
}

// POST /api/clients/[id]/insurances - Create a new insurance for a specific client
export async function POST(request: Request, { params }: Params) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);

    // Return 401 if not authenticated
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const clientId = params.id;

    // Check if client exists and belongs to the authenticated user
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        case: {
          select: {
            userId: true,
          },
        },
      },
    });

    // Return 404 if client not found
    if (!client) {
      return NextResponse.json(
        { message: "Client not found" },
        { status: 404 }
      );
    }

    // Check if the client's case belongs to the authenticated user
    if (client.case.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get the request body
    const body = await request.json();
    const { 
      type, 
      coveragePercentage, 
      initialPremium, 
      // Life insurance specific fields
      paymentType,
      basedOnRemainingCapital,
      // Home insurance specific fields
      propertyValue,
      propertyType
    } = body;

    // Validate input
    if (!type || coveragePercentage === undefined || initialPremium === undefined) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate insurance type
    if (type !== 'LIFE' && type !== 'HOME') {
      return NextResponse.json(
        { message: "Invalid insurance type" },
        { status: 400 }
      );
    }

    // Validate type-specific fields
    if (type === 'LIFE' && (!paymentType || basedOnRemainingCapital === undefined)) {
      return NextResponse.json(
        { message: "Missing required fields for life insurance" },
        { status: 400 }
      );
    }

    if (type === 'HOME' && (!propertyValue || !propertyType)) {
      return NextResponse.json(
        { message: "Missing required fields for home insurance" },
        { status: 400 }
      );
    }

    // Create the insurance with its type-specific data
    const insurance = await prisma.insurance.create({
      data: {
        type,
        coveragePercentage,
        initialPremium,
        clientId,
        // Create the related type-specific record
        ...(type === 'LIFE' && {
          lifeInsurance: {
            create: {
              paymentType,
              basedOnRemainingCapital,
            },
          },
        }),
        ...(type === 'HOME' && {
          homeInsurance: {
            create: {
              propertyValue,
              propertyType,
            },
          },
        }),
      },
      include: {
        lifeInsurance: true,
        homeInsurance: true,
      },
    });

    return NextResponse.json(
      { 
        message: "Insurance created successfully", 
        insurance 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating insurance:", error);
    return NextResponse.json(
      { message: "An error occurred while creating the insurance" },
      { status: 500 }
    );
  }
}
