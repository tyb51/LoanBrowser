import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";

// GET /api/cases/[id] - Get a specific case by ID
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

    // Get the case with all related data
    const caseData = await prisma.case.findUnique({
      where: { id },
      include: {
        clients: true,
        loanSimulations: {
          include: {
            modularSchedule: true,
          },
        },
        investmentSimulation: {
          include: {
            referenceLoan: true,
            alternativeLoan: true,
          },
        },
      },
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

    return NextResponse.json({ case: caseData });
  } catch (error) {
    console.error("Error fetching case:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching the case" },
      { status: 500 }
    );
  }
}

// PUT /api/cases/[id] - Update a case
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

    // Get the case
    const existingCase = await prisma.case.findUnique({
      where: { id },
    });

    // Return 404 if case not found
    if (!existingCase) {
      return NextResponse.json(
        { message: "Case not found" },
        { status: 404 }
      );
    }

    // Check if the case belongs to the authenticated user
    if (existingCase.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get the request body
    const body = await request.json();
    const { title, description } = body;

    // Validate input
    if (!title) {
      return NextResponse.json(
        { message: "Title is required" },
        { status: 400 }
      );
    }

    // Update the case
    const updatedCase = await prisma.case.update({
      where: { id },
      data: {
        title,
        description,
      },
    });

    return NextResponse.json({
      message: "Case updated successfully",
      case: updatedCase,
    });
  } catch (error) {
    console.error("Error updating case:", error);
    return NextResponse.json(
      { message: "An error occurred while updating the case" },
      { status: 500 }
    );
  }
}

// DELETE /api/cases/[id] - Delete a case
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

    // Get the case
    const existingCase = await prisma.case.findUnique({
      where: { id },
    });

    // Return 404 if case not found
    if (!existingCase) {
      return NextResponse.json(
        { message: "Case not found" },
        { status: 404 }
      );
    }

    // Check if the case belongs to the authenticated user
    if (existingCase.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Delete the case
    await prisma.case.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Case deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting case:", error);
    return NextResponse.json(
      { message: "An error occurred while deleting the case" },
      { status: 500 }
    );
  }
}
