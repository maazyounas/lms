import type { Student } from "@/data/mockData";

export type EnrollStudentForm = {
  name: string;
  id: string;
  gender: string;
  guardian: string;
  guardianPhone: string;
  className: string;
  subjects: string[];
};

export type EditableStudent = Student | null;
