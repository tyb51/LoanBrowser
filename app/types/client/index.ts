import { ClientType } from './enums';

export * from './enums';

export interface Client {
  id: string;
  name: string;
  type: ClientType;
  age?: number | null;
  height?: number | null;
  weight?: number | null;
  smoker?: boolean | null;
  currentCapital: number;
  currentDebt: number;
  monthlyIncome: number;
  caseId: string;
}

export interface ClientSummary {
  totalCurrentCapital: number;
  totalCurrentDebt: number;
  totalMonthlyIncome: number;
  netWorth: number;
  clientCount: number;
  individualCount: number;
  companyCount: number;
}

export interface ClientSelection {
  selectedClientIds: string[];
  clients: Client[];
  clientSummary: ClientSummary;
}
