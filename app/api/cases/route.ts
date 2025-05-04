import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";

// GET /api/cases - Get all cases for the authenticated user
export async function GET() {
  try {
    // Get the session
    const session = await getServerSession(authOptions);

    // Return 401 if not authenticated
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get all cases for the authenticated user
    const cases = await prisma.case.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ cases });
  } catch (error) {
    console.error("Error fetching cases:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching cases" },
      { status: 500 }
    );
  }
}

// POST /api/cases - Create a new case
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
    const { title, description } = body;

    // Validate input
    if (!title) {
      return NextResponse.json(
        { message: "Title is required" },
        { status: 400 }
      );
    }

    // Create the case
    const newCase = await prisma.case.create({
      data: {
        title,
        description,
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      { 
        message: "Case created successfully", 
        case: newCase 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating case:", error);
    return NextResponse.json(
      { message: "An error occurred while creating the case" },
      { status: 500 }
    );
  }
}
