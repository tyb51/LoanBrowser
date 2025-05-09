'use server';

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

interface CaseData {
  id: string;
  title: string;
  description: string | null;
  projectName: string | null;
  purchasePrice: number | null;
  purchaseDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

interface CaseLoan {
  id: string;
  name: string;
  loanType: string;
  principal: number;
  interestRate: number;
  termYears: number;
}

interface CaseClient {
  id: string;
  name: string;
  type: string;
}

interface InsuranceSimulation {
  id: string;
  name: string;
  type: string;
  parameters: any;
  clientId?: string;
  client?: {
    name: string;
    type: string;
  };
  homeInsuranceClients?: {
    clientId: string;
    sharePercentage: number;
    client: {
      name: string;
      type: string;
    };
  }[];
}

interface LinkedCase {
  id: string;
  title: string;
  description: string | null;
  projectName: string | null;
}

// Get case basic info
export async function getCaseInfo(caseId: string): Promise<CaseData | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("Authentication required");
    }

    const caseData = await prisma.case.findUnique({
      where: {
        id: caseId,
        userId: session.user.id
      },
      select: {
        id: true,
        title: true,
        description: true,
        projectName: true,
        purchasePrice: true,
        purchaseDate: true,
        createdAt: true,
        updatedAt: true,
        userId: true
      }
    });

    return caseData;
  } catch (error) {
    console.error("Error getting case info:", error);
    return null;
  }
}

// Get loans for a case
export async function getCaseLoans(caseId: string): Promise<CaseLoan[]> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("Authentication required");
    }

    // Verify case belongs to user
    const caseCheck = await prisma.case.findUnique({
      where: {
        id: caseId,
        userId: session.user.id
      },
      select: { id: true }
    });

    if (!caseCheck) {
      throw new Error("Case not found or unauthorized");
    }

    const loans = await prisma.loanSimulation.findMany({
      where: { caseId },
      select: {
        id: true,
        name: true,
        loanType: true,
        principal: true,
        interestRate: true,
        termYears: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return loans;
  } catch (error) {
    console.error("Error getting case loans:", error);
    return [];
  }
}

// Get clients for a case
export async function getCaseClients(caseId: string): Promise<CaseClient[]> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("Authentication required");
    }

    // Verify case belongs to user
    const caseCheck = await prisma.case.findUnique({
      where: {
        id: caseId,
        userId: session.user.id
      },
      select: { id: true }
    });

    if (!caseCheck) {
      throw new Error("Case not found or unauthorized");
    }

    const clients = await prisma.client.findMany({
      where: { caseId },
      select: {
        id: true,
        name: true,
        type: true
      },
      orderBy: { name: 'asc' }
    });

    return clients;
  } catch (error) {
    console.error("Error getting case clients:", error);
    return [];
  }
}

// Get insurance simulations for a case
export async function getCaseInsuranceSimulations(caseId: string): Promise<InsuranceSimulation[]> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("Authentication required");
    }

    // Verify case belongs to user
    const caseCheck = await prisma.case.findUnique({
      where: {
        id: caseId,
        userId: session.user.id
      },
      select: { id: true }
    });

    if (!caseCheck) {
      throw new Error("Case not found or unauthorized");
    }

    const insuranceSimulations = await prisma.insuranceSimulation.findMany({
      where: { caseId },
      include: {
        client: {
          select: {
            name: true,
            type: true
          }
        },
        homeInsuranceClients: {
          include: {
            client: {
              select: {
                name: true,
                type: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return insuranceSimulations;
  } catch (error) {
    console.error("Error getting insurance simulations:", error);
    return [];
  }
}

// Get linked cases
export async function getLinkedCases(caseId: string): Promise<LinkedCase[]> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("Authentication required");
    }

    // Verify case belongs to user
    const caseCheck = await prisma.case.findUnique({
      where: {
        id: caseId,
        userId: session.user.id
      },
      select: { id: true }
    });

    if (!caseCheck) {
      throw new Error("Case not found or unauthorized");
    }

    const caseLinks = await prisma.caseLink.findMany({
      where: { fromCaseId: caseId },
      include: {
        toCase: {
          select: {
            id: true,
            title: true,
            description: true,
            projectName: true
          }
        }
      }
    });

    return caseLinks.map(link => link.toCase);
  } catch (error) {
    console.error("Error getting linked cases:", error);
    return [];
  }
}

// Create a new case link
export async function linkCases(fromCaseId: string, toCaseId: string): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("Authentication required");
    }

    // Verify both cases belong to user
    const cases = await prisma.case.findMany({
      where: {
        id: { in: [fromCaseId, toCaseId] },
        userId: session.user.id
      },
      select: { id: true }
    });

    if (cases.length !== 2) {
      throw new Error("One or both cases not found or unauthorized");
    }

    // Check if link already exists
    const existingLink = await prisma.caseLink.findFirst({
      where: {
        fromCaseId,
        toCaseId
      }
    });

    if (existingLink) {
      return true; // Link already exists
    }

    // Create the link
    await prisma.caseLink.create({
      data: {
        fromCaseId,
        toCaseId
      }
    });

    revalidatePath(`/cases/${fromCaseId}`);
    return true;
  } catch (error) {
    console.error("Error linking cases:", error);
    return false;
  }
}

// Remove a case link
export async function unlinkCases(fromCaseId: string, toCaseId: string): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("Authentication required");
    }

    // Verify source case belongs to user
    const caseCheck = await prisma.case.findUnique({
      where: {
        id: fromCaseId,
        userId: session.user.id
      },
      select: { id: true }
    });

    if (!caseCheck) {
      throw new Error("Case not found or unauthorized");
    }

    // Delete the link
    await prisma.caseLink.deleteMany({
      where: {
        fromCaseId,
        toCaseId
      }
    });

    revalidatePath(`/cases/${fromCaseId}`);
    return true;
  } catch (error) {
    console.error("Error unlinking cases:", error);
    return false;
  }
}