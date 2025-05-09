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

    const {id} = await params

    // Get the case with all related data
    const caseData = await prisma.case.findUnique({
      where: { id },
      include: {
        clients: true,
        loanSimulations: {
          include: {
            modularSchedule: true,
            clients: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          },
        },
        investmentSimulation: {
          include: {
            referenceLoan: true,
            alternativeLoan: true,
          },
        },
        insuranceSimulations: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                type: true
              }
            },
            homeInsuranceClients: {
              include: {
                client: {
                  select: {
                    id: true,
                    name: true,
                    type: true
                  }
                }
              }
            }
          }
        },
        // Include linked cases
        linkedToCases: {
          include: {
            toCase: {
              select: {
                id: true,
                title: true,
                description: true,
                projectName: true,
                createdAt: true,
                updatedAt: true
              }
            }
          }
        },
        linkedFromCases: {
          include: {
            fromCase: {
              select: {
                id: true,
                title: true,
                description: true,
                projectName: true,
                createdAt: true,
                updatedAt: true
              }
            }
          }
        }
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
    const { 
      title, 
      description, 
      projectName, 
      purchasePrice, 
      purchaseDate,
      linkedCaseIds // New: array of case IDs to link to this case
    } = body;

    // Validate input
    if (!title) {
      return NextResponse.json(
        { message: "Title is required" },
        { status: 400 }
      );
    }

    // Handle linked cases if provided
    if (linkedCaseIds && Array.isArray(linkedCaseIds)) {
      // Verify all linked cases exist and belong to the user
      const linkedCases = await prisma.case.findMany({
        where: {
          id: { in: linkedCaseIds },
          userId: session.user.id
        },
        select: { id: true }
      });

      if (linkedCases.length !== linkedCaseIds.length) {
        return NextResponse.json(
          { message: "One or more linked cases not found or not authorized" },
          { status: 400 }
        );
      }

      // Get existing links to avoid duplicates
      const existingLinks = await prisma.caseLink.findMany({
        where: {
          fromCaseId: id
        },
        select: { toCaseId: true }
      });
      
      const existingLinkedIds = existingLinks.map(link => link.toCaseId);
      
      // Find IDs to add and remove
      const idsToAdd = linkedCaseIds.filter(caseId => !existingLinkedIds.includes(caseId));
      const idsToRemove = existingLinkedIds.filter(caseId => !linkedCaseIds.includes(caseId));
      
      // Create new links in a transaction
      await prisma.$transaction([
        // Remove links that are no longer needed
        prisma.caseLink.deleteMany({
          where: {
            fromCaseId: id,
            toCaseId: { in: idsToRemove }
          }
        }),
        
        // Add new links
        ...idsToAdd.map(toCaseId => 
          prisma.caseLink.create({
            data: {
              fromCaseId: id,
              toCaseId
            }
          })
        )
      ]);
    }

    // Update the case
    const updatedCase = await prisma.case.update({
      where: { id },
      data: {
        title,
        description,
        projectName: projectName || null,
        purchasePrice: purchasePrice || null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
      },
      include: {
        linkedToCases: {
          include: {
            toCase: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      }
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
