import { File, FileText, Link, Video } from "lucide-react";
import type { StudyMaterial } from "@/data/mockData";

export const gradeColor = (g: string) => {
  if (g.startsWith("A")) return "text-success";
  if (g.startsWith("B")) return "text-info";
  if (g.startsWith("C")) return "text-warning";
  return "text-destructive";
};

export const materialIcon = (type: StudyMaterial["type"]) => {
  switch (type) {
    case "pdf":
      return FileText;
    case "doc":
      return FileText;
    case "ppt":
      return File;
    case "link":
      return Link;
    case "video":
      return Video;
    case "note":
      return File;
    default:
      return File;
  }
};
