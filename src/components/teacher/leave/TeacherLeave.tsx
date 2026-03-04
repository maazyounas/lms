import { useState } from "react";
import { CalendarOff, Send, Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface LeaveRequest {
  id: number;
  type: string;
  from: string;
  to: string;
  reason: string;
  status: string;
  appliedDate: string;
}

const TeacherLeave = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([
    { id: 1, type: "Sick Leave", from: "2026-01-15", to: "2026-01-16", reason: "Medical appointment and recovery", status: "Approved", appliedDate: "2026-01-13" },
    { id: 2, type: "Personal Leave", from: "2026-02-10", to: "2026-02-10", reason: "Family event", status: "Approved", appliedDate: "2026-02-05" },
    { id: 3, type: "Casual Leave", from: "2026-03-05", to: "2026-03-06", reason: "Personal work", status: "Pending", appliedDate: "2026-02-28" },
  ]);

  const [form, setForm] = useState({ type: "Sick Leave", from: "", to: "", reason: "" });

  const handleSubmit = () => {
    if (!form.from || !form.to || !form.reason) {
      toast.error("Please fill all fields!");
      return;
    }
    setLeaves([
      ...leaves,
      { id: leaves.length + 1, ...form, status: "Pending", appliedDate: new Date().toISOString().split("T")[0] },
    ]);
    setForm({ type: "Sick Leave", from: "", to: "", reason: "" });
    toast.success("Leave application submitted!");
  };

  const statusIcon = (s: string) => {
    if (s === "Approved") return <CheckCircle className="h-4 w-4 text-success" />;
    if (s === "Rejected") return <XCircle className="h-4 w-4 text-destructive" />;
    return <Clock className="h-4 w-4 text-warning" />;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Apply for Leave</h1>

      {/* Form */}
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
            <input type="date" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} className="w-full text-sm bg-muted/50 border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">To Date</label>
            <input type="date" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} className="w-full text-sm bg-muted/50 border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:border-primary" />
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
        <button onClick={handleSubmit} className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Send className="h-4 w-4" /> Submit Application
        </button>
      </div>

      {/* History */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-4">Leave History</h3>
        <div className="space-y-3">
          {leaves.map((l) => (
            <div key={l.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border">
              {statusIcon(l.status)}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{l.type}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${l.status === "Approved" ? "bg-success/15 text-success" : l.status === "Rejected" ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning"}`}>
                    {l.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{l.from} → {l.to}</p>
                <p className="text-xs text-muted-foreground mt-1">{l.reason}</p>
                <p className="text-xs text-muted-foreground mt-1">Applied: {l.appliedDate}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherLeave;
