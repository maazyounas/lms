import type { Teacher } from "@/data/mockData";

export type AdminTeacherRecord = Teacher & {
  classSubjects?: Record<string, string[]>;
};

export type ClassSubjectForm = {
  courses: string[];
  classes: string[];
  classSubjects: Record<string, string[]>;
};
