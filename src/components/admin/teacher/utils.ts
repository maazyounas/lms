export const DEFAULT_CLASSES = ["9-A", "9-B", "10-A", "10-B", "11-A"];
export const DEFAULT_SUBJECTS = [
  "Mathematics",
  "English",
  "Physics",
  "Chemistry",
  "Urdu",
  "Computer Science",
  "Biology",
];
export const GENDER_OPTIONS = ["Male", "Female", "Other"];

export const teacherCode = (id: number) => `TCH-${String(id).padStart(4, "0")}`;

export const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "TR";
