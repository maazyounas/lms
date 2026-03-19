import { useState, useRef } from "react";
import {
  ClipboardList,
  Upload,
  ArrowLeft,
  FileText,
  Calendar,
  BookOpen,
  AlertCircle,
} from "lucide-react";
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

// Helper to check if due date is past
const isOverdue = (dueDateStr: string): boolean => {
  const due = new Date(dueDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
};

const StudentAssignments = ({ student }: Props) => {
  // Local copy of assignments to allow status updates
  const [assignments, setAssignments] = useState(student.assignments);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Record<number, string>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [visibleCount, setVisibleCount] = useState(9);

  const selected = selectedIdx !== null ? assignments[selectedIdx] : null;

  const handleFileSelect = () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed!");
      return;
    }
    setSelectedFile(file);
    toast.info(`File "${file.name}" selected. Click submit to upload.`);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = (idx: number) => {
    if (!selectedFile) {
      toast.error("Please select a file first.");
      return;
    }

    const isLate = isOverdue(selected!.due);
    const newStatus = isLate ? "Late" : "Submitted";

    // Update local assignments
    const updated = [...assignments];
    updated[idx] = { ...updated[idx], status: newStatus };
    setAssignments(updated);

    // Record uploaded file
    setUploadedFiles({ ...uploadedFiles, [idx]: selectedFile.name });

    toast.success(
      isLate
        ? "Assignment submitted late. Your teacher has been notified."
        : "Assignment submitted successfully!"
    );

    setSelectedFile(null); // Clear selected file after submit
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  if (selected !== null && selectedIdx !== null) {
    const isLateSubmission = isOverdue(selected.due);
    const hasUploaded = uploadedFiles[selectedIdx];

    return (
      <div>
        <button
          onClick={() => {
            setSelectedIdx(null);
            setSelectedFile(null);
          }}
          className="flex items-center gap-1 text-sm text-primary hover:underline mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Assignments
        </button>

        <div className="bg-card border border-border rounded-xl p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">{selected.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{selected.subject}</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge(
                selected.status
              )}`}
            >
              {selected.status}
            </span>
          </div>

          {/* Metadata Cards */}
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

          {/* Assignment Details */}
          <div className="border-t border-border pt-6 mt-6">
            <h3 className="font-semibold text-foreground mb-4">Assignment Details</h3>
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">Chapter</p>
                <p className="text-sm font-medium text-foreground">
                  Chapter {selected.chapterNumber}: {selected.chapterName}
                </p>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">Question</p>
                <p className="text-sm text-foreground">{selected.question}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">Total Marks</p>
                <p className="text-sm font-medium text-foreground">
                  {selected.totalMarks} Marks
                </p>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">Submission Type</p>
                <p className="text-sm font-medium text-foreground">
                  {selected.submissionType}
                </p>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">Instructions</p>
                <p className="text-sm text-foreground">{selected.instructions}</p>
              </div>
            </div>
          </div>

          {/* Upload & Submit Section */}
          {selected.status !== "Submitted" && selected.status !== "Late" ? (
            <div className="border-t border-border pt-5 mt-6">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Upload className="h-4 w-4 text-primary" /> Submit Assignment (PDF)
              </h3>

              {/* File input (hidden) */}
              <input
                ref={fileRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileSelect}
              />

              {/* File selection area */}
              {!selectedFile ? (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
                >
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Click to select PDF file</p>
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="text-sm text-foreground">{selectedFile.name}</span>
                    </div>
                    <button
                      onClick={clearSelectedFile}
                      className="text-xs text-muted-foreground hover:text-destructive"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Submit button with late warning */}
                  <button
                    onClick={() => handleSubmit(selectedIdx)}
                    className={`w-full py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                      isLateSubmission
                        ? "bg-warning text-warning-foreground hover:bg-warning/90"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {isLateSubmission ? (
                      <>
                        <AlertCircle className="h-4 w-4" />
                        Submit Late Assignment
                      </>
                    ) : (
                      "Submit Assignment"
                    )}
                  </button>
                </div>
              )}

              {/* Late notice */}
              {isLateSubmission && !selectedFile && (
                <p className="text-xs text-warning mt-2 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  This assignment is overdue. Submissions will be marked as late.
                </p>
              )}
            </div>
          ) : (
            // Already submitted or late – show uploaded file info
            hasUploaded && (
              <div className="border-t border-border pt-5 mt-6">
                <div className="flex items-center gap-2 text-sm text-success bg-success/10 rounded-lg p-3">
                  <FileText className="h-4 w-4" />
                  <span>Submitted file: {hasUploaded}</span>
                </div>
                {selected.status === "Late" && (
                  <p className="text-xs text-warning mt-2 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    This assignment was submitted late.
                  </p>
                )}
              </div>
            )
          )}
        </div>
      </div>
    );
  }

  // Main list view
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Assignments</h1>
      {assignments.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground text-center">
          No assignments yet. When your teachers post work, it will appear here.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assignments.slice(0, visibleCount).map((a, i) => (
          <button
            key={i}
            onClick={() => setSelectedIdx(i)}
            className="bg-card border border-border rounded-xl p-5 text-left hover:border-primary/30 hover:bg-muted/20 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-primary" />
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge(
                  a.status
                )}`}
              >
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
      {assignments.length > visibleCount && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setVisibleCount((prev) => prev + 9)}
            className="text-sm text-primary hover:underline"
          >
            Show more assignments
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentAssignments;
