import { useState, useRef } from "react";
import { ClipboardList, Upload, ArrowLeft, FileText, Calendar, BookOpen } from "lucide-react";
import type { Student } from "@/data/mockData";
import { toast } from "sonner";

interface Props {
  student: Student;
}

const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    Submitted: "bg-success/15 text-success",
    Pending: "bg-warning/15 text-warning",
    Late: "bg-warning/15 text-warning",
    Missing: "bg-destructive/15 text-destructive",
  };
  return map[s] || "bg-muted text-muted-foreground";
};

const StudentAssignments = ({ student }: Props) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Record<number, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const selected = selectedIdx !== null ? student.assignments[selectedIdx] : null;

  const handleFileUpload = (idx: number) => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed!");
      return;
    }
    setUploadedFiles({ ...uploadedFiles, [idx]: file.name });
    toast.success(`"${file.name}" uploaded successfully!`);
    if (fileRef.current) fileRef.current.value = "";
  };

  if (selected !== null && selectedIdx !== null) {
    return (
      <div>
        <button onClick={() => setSelectedIdx(null)} className="flex items-center gap-1 text-sm text-primary hover:underline mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Assignments
        </button>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">{selected.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{selected.subject}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge(selected.status)}`}>
              {selected.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              { label: "Due Date", value: selected.due, icon: Calendar },
              { label: "Subject", value: selected.subject, icon: BookOpen },
              { label: "Score", value: selected.score, icon: FileText },
            ].map((item) => (
              <div key={item.label} className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
                <p className="text-sm font-medium text-foreground">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Upload Section */}
          {(selected.status === "Pending" || selected.status === "Missing") && (
            <div className="border-t border-border pt-5">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Upload className="h-4 w-4 text-primary" /> Submit Assignment (PDF)
              </h3>
              <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={() => handleFileUpload(selectedIdx)} />
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
              >
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Click to upload PDF file</p>
              </button>
              {uploadedFiles[selectedIdx] && (
                <div className="mt-3 flex items-center gap-2 text-sm text-success bg-success/10 rounded-lg p-3">
                  <FileText className="h-4 w-4" />
                  <span>Uploaded: {uploadedFiles[selectedIdx]}</span>
                </div>
              )}
            </div>
          )}

          {uploadedFiles[selectedIdx] && selected.status !== "Pending" && selected.status !== "Missing" && (
            <div className="mt-4 flex items-center gap-2 text-sm text-success bg-success/10 rounded-lg p-3">
              <FileText className="h-4 w-4" />
              <span>Uploaded: {uploadedFiles[selectedIdx]}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Assignments</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {student.assignments.map((a, i) => (
          <button
            key={i}
            onClick={() => setSelectedIdx(i)}
            className="bg-card border border-border rounded-xl p-5 text-left hover:border-primary/30 hover:bg-muted/20 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-primary" />
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge(a.status)}`}>
                {a.status}
              </span>
            </div>
            <h3 className="font-semibold text-foreground text-sm mb-1">{a.title}</h3>
            <p className="text-xs text-muted-foreground mb-3">{a.subject}</p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Due: {a.due}</span>
              <span className="font-medium text-foreground">{a.score}</span>
            </div>
            {uploadedFiles[i] && (
              <div className="mt-2 text-xs text-success flex items-center gap-1">
                <FileText className="h-3 w-3" /> {uploadedFiles[i]}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StudentAssignments;
