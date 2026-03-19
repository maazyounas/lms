import type { Student } from "@/data/mockData";
import type { AuditLogEntry, FeeTransaction } from "@/components/admin/types";

export type FeeManagementProps = {
  students: Student[];
  transactions?: FeeTransaction[];
  onStudentsChange: (next: Student[]) => void;
  onRecordTransaction?: (transaction: FeeTransaction) => void;
  onTransactionsChange?: (next: FeeTransaction[]) => void;
  onAuditLog?: (entry: Omit<AuditLogEntry, "id" | "createdAt">) => void;
  currentAdmin?: string;
  showPendingOnly?: boolean;
};
