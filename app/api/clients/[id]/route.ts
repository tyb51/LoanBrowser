import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";

interface Params {
  params: {
    id: string;
  };
}

// GET /api/clients/[id] - Get a specific client
export async function GET(request: Request, { params }: Params) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);

    // Return 401 if not authenticated
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const clientId = params.id;

    // Get client with its associated case
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

    // Remove case details from the response
    const { case: _, ...clientData } = client;

    return NextResponse.json({ client: clientData });
  } catch (error) {
    console.error("Error fetching client:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching the client" },
      { status: 500 }
    );
  }
}

// PUT /api/clients/[id] - Update a client
export async function PUT(request: Request, { params }: Params) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);

    // Return 401 if not authenticated
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const clientId = params.id;

    // Check if client exists and belongs to the authenticated user
    const existingClient = await prisma.client.findUnique({
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
    if (!existingClient) {
      return NextResponse.json(
        { message: "Client not found" },
        { status: 404 }
      );
    }

    // Check if the client's case belongs to the authenticated user
    if (existingClient.case.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
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
      monthlyIncome 
    } = body;

    // Validate input
    if (!name || !type) {
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

    // Update the client
    const updatedClient = await prisma.client.update({
      where: { id: clientId },
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
      },
    });

    return NextResponse.json({ 
      message: "Client updated successfully", 
      client: updatedClient 
    });
  } catch (error) {
    console.error("Error updating client:", error);
    return NextResponse.json(
      { message: "An error occurred while updating the client" },
      { status: 500 }
    );
  }
}

// DELETE /api/clients/[id] - Delete a client
export async function DELETE(request: Request, { params }: Params) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);

    // Return 401 if not authenticated
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const clientId = params.id;

    // Check if client exists and belongs to the authenticated user
    const existingClient = await prisma.client.findUnique({
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
    if (!existingClient) {
      return NextResponse.json(
        { message: "Client not found" },
        { status: 404 }
      );
    }

    // Check if the client's case belongs to the authenticated user
    if (existingClient.case.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Delete related records first to avoid foreign key constraints
    // Delete insurances associated with the client
    await prisma.insurance.deleteMany({
      where: { clientId },
    });

    // Delete loans associated with the client
    await prisma.loan.deleteMany({
      where: { clientId },
    });

    // Delete the client
    await prisma.client.delete({
      where: { id: clientId },
    });

    return NextResponse.json({ 
      message: "Client and all associated records deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting client:", error);
    return NextResponse.json(
      { message: "An error occurred while deleting the client" },
      { status: 500 }
    );
  }
}
