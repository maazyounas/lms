import { File, FileText, Link, Video } from "lucide-react";
import type { StudyMaterial } from "@/data/mockData";
import { cambridgeGradeColor } from "@/lib/grades";

export const gradeColor = (g: string) => cambridgeGradeColor(g);

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
