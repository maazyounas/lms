import { useState } from "react";
import { Plus, ArrowLeft, FileText, CheckCircle, Clock, XCircle, Save, Eye } from "lucide-react";
import { TEACHER_ASSIGNMENTS, type Teacher, type TeacherAssignment } from "@/data/mockData";
import { toast } from "sonner";

interface Props {
  teacher: Teacher;
}

const statusColor = (s: string) => {
  const map: Record<string, string> = {
    Submitted: "bg-success/15 text-success",
    Late: "bg-warning/15 text-warning",
    Missing: "bg-destructive/15 text-destructive",
    Pending: "bg-muted text-muted-foreground",
  };
  return map[s] || "bg-muted text-muted-foreground";
};

const statusIcon = (s: string) => {
  if (s === "Submitted") return <CheckCircle className="h-3.5 w-3.5" />;
  if (s === "Late") return <Clock className="h-3.5 w-3.5" />;
  if (s === "Missing") return <XCircle className="h-3.5 w-3.5" />;
  return <Clock className="h-3.5 w-3.5" />;
};

const TeacherAssignments = ({ teacher }: Props) => {
  const [assignments, setAssignments] = useState(TEACHER_ASSIGNMENTS.filter((a) => a.subject === teacher.subject));
  const [view, setView] = useState<"list" | "detail" | "create" | "grading">("list");
  const [selectedAssignment, setSelectedAssignment] = useState<TeacherAssignment | null>(null);
  const [gradingStudent, setGradingStudent] = useState<number | null>(null);
  const [gradingMarks, setGradingMarks] = useState("");
  const [gradingFeedback, setGradingFeedback] = useState("");
  const [filterClass, setFilterClass] = useState<string>("all");
  const [newAssignment, setNewAssignment] = useState({
    title: "", classGrade: teacher.classes[0] || "10-A", dueDate: "", totalMarks: 20, description: "",
  });

  const filteredAssignments = filterClass === "all" ? assignments : assignments.filter((a) => a.classGrade === filterClass);

  const handleCreateAssignment = () => {
    if (!newAssignment.title || !newAssignment.dueDate || !newAssignment.description) {
      toast.error("Please fill all required fields!");
      return;
    }
    const newA: TeacherAssignment = {
      id: assignments.length + 100,
      title: newAssignment.title,
      subject: teacher.subject,
      classGrade: newAssignment.classGrade,
      dueDate: newAssignment.dueDate,
      totalMarks: newAssignment.totalMarks,
      description: newAssignment.description,
      createdDate: new Date().toISOString().split("T")[0],
      submissions: [],
    };
    setAssignments([newA, ...assignments]);
    setNewAssignment({ title: "", classGrade: teacher.classes[0] || "10-A", dueDate: "", totalMarks: 20, description: "" });
    setView("list");
    toast.success("Assignment created successfully!");
  };

  const handleGradeSubmission = () => {
    if (!selectedAssignment || gradingStudent === null) return;
    const marks = Number(gradingMarks);
    if (isNaN(marks) || marks < 0 || marks > selectedAssignment.totalMarks) {
      toast.error(`Marks must be between 0 and ${selectedAssignment.totalMarks}`);
      return;
    }
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === selectedAssignment.id
          ? {
              ...a,
              submissions: a.submissions.map((s) =>
                s.studentId === gradingStudent ? { ...s, marks, feedback: gradingFeedback } : s
              ),
            }
          : a
      )
    );
    setSelectedAssignment((prev) =>
      prev
        ? {
            ...prev,
            submissions: prev.submissions.map((s) =>
              s.studentId === gradingStudent ? { ...s, marks, feedback: gradingFeedback } : s
            ),
          }
        : null
    );
    setGradingStudent(null);
    setGradingMarks("");
    setGradingFeedback("");
    toast.success("Marks saved successfully!");
  };

  // Create assignment view
  if (view === "create") {
    return (
      <div>
        <button onClick={() => setView("list")} className="flex items-center gap-2 text-primary text-sm hover:underline mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Assignments
        </button>
        <h1 className="text-2xl font-bold text-foreground mb-6">Create New Assignment</h1>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Title *</label>
              <input value={newAssignment.title} onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })} placeholder="Assignment title" className="w-full text-sm bg-muted/50 border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:border-primary placeholder:text-muted-foreground" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Class *</label>
              <select value={newAssignment.classGrade} onChange={(e) => setNewAssignment({ ...newAssignment, classGrade: e.target.value })} className="w-full text-sm bg-muted/50 border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:border-primary">
                {teacher.classes.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Due Date *</label>
              <input type="date" value={newAssignment.dueDate} onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })} className="w-full text-sm bg-muted/50 border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Total Marks</label>
              <input type="number" value={newAssignment.totalMarks} onChange={(e) => setNewAssignment({ ...newAssignment, totalMarks: Number(e.target.value) })} className="w-full text-sm bg-muted/50 border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:border-primary" />
            </div>
          </div>
          <div className="mb-4">
            <label className="text-xs text-muted-foreground mb-1 block">Description *</label>
            <textarea value={newAssignment.description} onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })} rows={4} placeholder="Assignment instructions and details..." className="w-full text-sm bg-muted/50 border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:border-primary placeholder:text-muted-foreground resize-none" />
          </div>
          <button onClick={handleCreateAssignment} className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" /> Create Assignment
          </button>
        </div>
      </div>
    );
  }

  // Assignment detail view - show submissions
  if (view === "detail" && selectedAssignment) {
    const submitted = selectedAssignment.submissions.filter((s) => s.status === "Submitted" || s.status === "Late");
    const graded = selectedAssignment.submissions.filter((s) => s.marks !== undefined);

    return (
      <div>
        <button onClick={() => { setView("list"); setSelectedAssignment(null); setGradingStudent(null); }} className="flex items-center gap-2 text-primary text-sm hover:underline mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Assignments
        </button>

        {/* Assignment Header */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h1 className="text-xl font-bold text-foreground">{selectedAssignment.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{selectedAssignment.subject} · Class {selectedAssignment.classGrade}</p>
          <p className="text-sm text-muted-foreground mt-2">{selectedAssignment.description}</p>
          <div className="flex flex-wrap gap-3 mt-4">
            <span className="text-xs px-2.5 py-1 rounded-full bg-info/15 text-info">Due: {selectedAssignment.dueDate}</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-primary/15 text-primary">Total: {selectedAssignment.totalMarks} marks</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-success/15 text-success">{submitted.length}/{selectedAssignment.submissions.length} submitted</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-warning/15 text-warning">{graded.length} graded</span>
          </div>
        </div>

        {/* Student Submissions */}
        <h2 className="text-lg font-semibold text-foreground mb-4">Student Submissions</h2>
        <div className="space-y-3">
          {selectedAssignment.submissions.map((sub) => (
            <div key={sub.studentId} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">{sub.studentAvatar}</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{sub.studentName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(sub.status)}`}>
                        {statusIcon(sub.status)} {sub.status}
                      </span>
                      {sub.submittedDate && <span className="text-xs text-muted-foreground">Submitted: {sub.submittedDate}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {sub.fileName && (
                    <button className="flex items-center gap-1 text-xs text-info hover:underline">
                      <Eye className="h-3.5 w-3.5" /> {sub.fileName}
                    </button>
                  )}
                  {sub.marks !== undefined ? (
                    <span className="text-sm font-bold text-success">{sub.marks}/{selectedAssignment.totalMarks}</span>
                  ) : (sub.status === "Submitted" || sub.status === "Late") ? (
                    <button
                      onClick={() => { setGradingStudent(sub.studentId); setGradingMarks(sub.marks !== undefined ? String(sub.marks) : ""); setGradingFeedback(sub.feedback || ""); }}
                      className="px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                      Grade
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Grading Form */}
              {gradingStudent === sub.studentId && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Marks (out of {selectedAssignment.totalMarks})</label>
                      <input type="number" value={gradingMarks} onChange={(e) => setGradingMarks(e.target.value)} min={0} max={selectedAssignment.totalMarks} className="w-full text-sm bg-muted/50 border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:border-primary" />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="text-xs text-muted-foreground mb-1 block">Feedback</label>
                    <textarea value={gradingFeedback} onChange={(e) => setGradingFeedback(e.target.value)} rows={2} placeholder="Feedback for the student..." className="w-full text-sm bg-muted/50 border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:border-primary placeholder:text-muted-foreground resize-none" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleGradeSubmission} className="flex items-center gap-1.5 px-4 py-1.5 bg-success text-success-foreground text-xs rounded-lg font-medium hover:bg-success/90 transition-colors">
                      <Save className="h-3.5 w-3.5" /> Save Marks
                    </button>
                    <button onClick={() => setGradingStudent(null)} className="px-4 py-1.5 bg-muted text-muted-foreground text-xs rounded-lg font-medium hover:bg-muted/80 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Show feedback if graded */}
              {sub.marks !== undefined && sub.feedback && gradingStudent !== sub.studentId && (
                <p className="mt-2 text-xs text-muted-foreground italic">Feedback: {sub.feedback}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Assignment list
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Assignments</h1>
        <button onClick={() => setView("create")} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> New Assignment
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setFilterClass("all")} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterClass === "all" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}>
          All Classes
        </button>
        {teacher.classes.map((c) => (
          <button key={c} onClick={() => setFilterClass(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterClass === c ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Assignment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAssignments.map((a) => {
          const submitted = a.submissions.filter((s) => s.status === "Submitted" || s.status === "Late").length;
          const graded = a.submissions.filter((s) => s.marks !== undefined).length;
          const missing = a.submissions.filter((s) => s.status === "Missing").length;
          const isOverdue = new Date(a.dueDate) < new Date();

          return (
            <button
              key={a.id}
              onClick={() => { setSelectedAssignment(a); setView("detail"); }}
              className="text-left bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">{a.title}</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-info/15 text-info">{a.classGrade}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{a.description}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <span>Due: {a.dueDate}</span>
                <span>Total: {a.totalMarks} marks</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-success/15 text-success">{submitted} submitted</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-info/15 text-info">{graded} graded</span>
                {missing > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/15 text-destructive">{missing} missing</span>}
                {isOverdue && <span className="text-xs px-2 py-0.5 rounded-full bg-warning/15 text-warning">Overdue</span>}
              </div>
            </button>
          );
        })}
      </div>

      {filteredAssignments.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No assignments found for this class.</p>
        </div>
      )}
    </div>
  );
};

export default TeacherAssignments;
