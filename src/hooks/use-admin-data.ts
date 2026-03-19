import { usePersistentState } from "@/hooks/use-persistent-state";
import {
  ANNOUNCEMENTS,
  STUDENTS,
  TEACHERS,
  type Announcement,
  type Student,
} from "@/data/mockData";
import type { AdminTeacherRecord } from "@/components/admin/teacher/types";
import type {
  AuditLogEntry,
  FeeTransaction,
  PlannerAllocation,
} from "@/components/admin/types";

export const useAdminData = () => {
  const [announcements, setAnnouncements] = usePersistentState<Announcement[]>({
    key: "announcements",
    defaultValue: ANNOUNCEMENTS,
  });
  const [students, setStudents] = usePersistentState<Student[]>({
    key: "students",
    defaultValue: STUDENTS,
  });
  const [teachers, setTeachers] = usePersistentState<AdminTeacherRecord[]>({
    key: "teachers",
    defaultValue: TEACHERS as AdminTeacherRecord[],
  });
  const [feeTransactions, setFeeTransactions] = usePersistentState<FeeTransaction[]>({
    key: "fee-transactions",
    defaultValue: [],
  });
  const [auditLogs, setAuditLogs] = usePersistentState<AuditLogEntry[]>({
    key: "audit-logs",
    defaultValue: [],
  });
  const [plannerAllocations, setPlannerAllocations] = usePersistentState<PlannerAllocation[]>({
    key: "planner-allocations",
    defaultValue: [],
  });
  const [customClasses, setCustomClasses] = usePersistentState<string[]>({
    key: "custom-classes",
    defaultValue: [],
  });
  const [classSubjects, setClassSubjects] = usePersistentState<Record<string, string[]>>({
    key: "class-subjects",
    defaultValue: {},
  });

  const addAuditLog = (entry: Omit<AuditLogEntry, "id" | "createdAt">) => {
    const nextEntry: AuditLogEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
    };
    setAuditLogs((prev) => [nextEntry, ...prev]);
  };

  return {
    announcements,
    setAnnouncements,
    students,
    setStudents,
    teachers,
    setTeachers,
    feeTransactions,
    setFeeTransactions,
    auditLogs,
    setAuditLogs,
    plannerAllocations,
    setPlannerAllocations,
    customClasses,
    setCustomClasses,
    classSubjects,
    setClassSubjects,
    addAuditLog,
  } as const;
};
