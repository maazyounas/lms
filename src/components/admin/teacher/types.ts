import type { Teacher } from "@/data/mockData";

export type AdminTeacherRecord = Teacher & {
  classSubjects?: Record<string, string[]>;
};

export type ClassSubjectForm = {
  classes: string[];
  classSubjects: Record<string, string[]>;
};
