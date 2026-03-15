import { useState } from "react";
import { CalendarOff, Send, Clock, CheckCircle, XCircle, Users } from "lucide-react";
import { toast } from "sonner";
import { STUDENTS } from "@/data/mockData";
import type { Teacher } from "@/data/mockData";

interface LeaveRequest {
  id: number;
  type: string;
  from: string;
  to: string;
  reason: string;
  status: string;
  appliedDate: string;
}

interface StudentLeaveRequest extends LeaveRequest {
  studentId: number;
  studentName: string;
  studentClass: string;
}

interface Props {
  teacher: Teacher;
}

const TeacherLeave = ({ teacher }: Props) => {
  // Teacher's own leaves
  const [myLeaves, setMyLeaves] = useState<LeaveRequest[]>([
    { id: 1, type: "Sick Leave", from: "2026-01-15", to: "2026-01-16", reason: "Medical appointment and recovery", status: "Approved", appliedDate: "2026-01-13" },
    { id: 2, type: "Personal Leave", from: "2026-02-10", to: "2026-02-10", reason: "Family event", status: "Approved", appliedDate: "2026-02-05" },
    { id: 3, type: "Casual Leave", from: "2026-03-05", to: "2026-03-06", reason: "Personal work", status: "Pending", appliedDate: "2026-02-28" },
  ]);

  // Form for new leave
  const [form, setForm] = useState({ type: "Sick Leave", from: "", to: "", reason: "" });

  // Student leave requests (flattened from STUDENTS)
  const [studentLeaves, setStudentLeaves] = useState<StudentLeaveRequest[]>(() => {
    // Filter students belonging to teacher's classes
    const teacherClasses = teacher.classes || [];
    const relevantStudents = STUDENTS.filter((s) => teacherClasses.includes(s.grade));
    
    // Build a flat list of leave requests with student info
    const leaves: StudentLeaveRequest[] = [];
    relevantStudents.forEach(student => {
      // If student doesn't have leaveRequests, create some dummy data for demonstration
      const studentRequests: LeaveRequest[] = (student as { leaveRequests?: LeaveRequest[] })
        .leaveRequests || [
        { id: 101, type: "Sick Leave", from: "2026-03-10", to: "2026-03-12", reason: "Fever", status: "Pending", appliedDate: "2026-03-08" },
        { id: 102, type: "Personal Leave", from: "2026-03-15", to: "2026-03-15", reason: "Family function", status: "Approved", appliedDate: "2026-03-12" },
      ];
      studentRequests.forEach((req) => {
        leaves.push({
          ...req,
          studentId: student.id,
          studentName: student.name,
          studentClass: student.grade,
        });
      });
    });
    return leaves;
  });

  const [activeTab, setActiveTab] = useState<"my" | "students">("my");

  const handleMyLeaveSubmit = () => {
    if (!form.from || !form.to || !form.reason) {
      toast.error("Please fill all fields!");
      return;
    }
    setMyLeaves([
      ...myLeaves,
      { id: myLeaves.length + 1, ...form, status: "Pending", appliedDate: new Date().toISOString().split("T")[0] },
    ]);
    setForm({ type: "Sick Leave", from: "", to: "", reason: "" });
    toast.success("Leave application submitted!");
  };

  const updateStudentLeaveStatus = (leaveId: number, newStatus: "Approved" | "Rejected") => {
    setStudentLeaves(prev =>
      prev.map(l =>
        l.id === leaveId ? { ...l, status: newStatus } : l
      )
    );
    toast.success(`Student leave ${newStatus.toLowerCase()}.`);
    // Optionally, update the original student data if needed
  };

  const statusIcon = (s: string) => {
    if (s === "Approved") return <CheckCircle className="h-4 w-4 text-success" />;
    if (s === "Rejected") return <XCircle className="h-4 w-4 text-destructive" />;
    return <Clock className="h-4 w-4 text-warning" />;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Leave Management</h1>

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab("my")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "my"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          My Leave Applications
        </button>
        <button
          onClick={() => setActiveTab("students")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "students"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Student Leave Requests
        </button>
      </div>

      {activeTab === "my" && (
        <>
          {/* Teacher's own leave form */}
          <div className="bg-card border border-border rounded-xl p-5 mb-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <CalendarOff className="h-4 w-4 text-primary" /> New Leave Application
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Leave Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full text-sm bg-muted/50 border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:border-primary"
                >
                  {["Sick Leave", "Casual Leave", "Personal Leave", "Emergency Leave"].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div />
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">From Date</label>
                <input
                  type="date"
                  value={form.from}
                  onChange={(e) => setForm({ ...form, from: e.target.value })}
                  className="w-full text-sm bg-muted/50 border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">To Date</label>
                <input
                  type="date"
                  value={form.to}
                  onChange={(e) => setForm({ ...form, to: e.target.value })}
                  className="w-full text-sm bg-muted/50 border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="text-xs text-muted-foreground mb-1 block">Reason</label>
              <textarea
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                rows={3}
                placeholder="Describe the reason for your leave..."
                className="w-full text-sm bg-muted/50 border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:border-primary placeholder:text-muted-foreground resize-none"
              />
            </div>
            <button
              onClick={handleMyLeaveSubmit}
              className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Send className="h-4 w-4" /> Submit Application
            </button>
          </div>

          {/* Teacher's leave history */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-4">My Leave History</h3>
            <div className="space-y-3">
              {myLeaves.map((l) => (
                <div key={l.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border">
                  {statusIcon(l.status)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">{l.type}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        l.status === "Approved" ? "bg-success/15 text-success" :
                        l.status === "Rejected" ? "bg-destructive/15 text-destructive" :
                        "bg-warning/15 text-warning"
                      }`}>
                        {l.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {l.from} -&gt; {l.to}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{l.reason}</p>
                    <p className="text-xs text-muted-foreground mt-1">Applied: {l.appliedDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === "students" && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> Student Leave Requests
          </h3>
          {studentLeaves.length === 0 ? (
            <p className="text-sm text-muted-foreground">No student leave requests found.</p>
          ) : (
            <div className="space-y-4">
              {studentLeaves.map((req) => (
                <div key={req.id} className="p-4 rounded-lg border border-border bg-muted/10">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {statusIcon(req.status)}
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {req.studentName} <span className="text-xs text-muted-foreground">({req.studentClass})</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {req.type} · {req.from} -&gt; {req.to}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{req.reason}</p>
                        <p className="text-xs text-muted-foreground mt-1">Applied: {req.appliedDate}</p>
                      </div>
                    </div>
                    {req.status === "Pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateStudentLeaveStatus(req.id, "Approved")}
                          className="px-3 py-1 text-xs bg-success/20 text-success rounded-md hover:bg-success/30 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStudentLeaveStatus(req.id, "Rejected")}
                          className="px-3 py-1 text-xs bg-destructive/20 text-destructive rounded-md hover:bg-destructive/30 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {req.status !== "Pending" && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        req.status === "Approved" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
                      }`}>
                        {req.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherLeave;
