import { useState } from "react";
import { CalendarOff, Send, CheckCircle, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";

interface LeaveRequest {
  id: number;
  type: string;
  from: string;
  to: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  appliedOn: string;
}

const mockLeaves: LeaveRequest[] = [
  { id: 1, type: "Sick Leave", from: "2026-02-10", to: "2026-02-11", reason: "Fever and flu", status: "Approved", appliedOn: "2026-02-09" },
  { id: 2, type: "Family Emergency", from: "2026-01-20", to: "2026-01-22", reason: "Family event in Lahore", status: "Approved", appliedOn: "2026-01-18" },
  { id: 3, type: "Personal", from: "2026-03-05", to: "2026-03-05", reason: "Dentist appointment", status: "Pending", appliedOn: "2026-02-27" },
];

const statusConfig = {
  Pending: { icon: Clock, color: "text-warning", bg: "bg-warning/15" },
  Approved: { icon: CheckCircle, color: "text-success", bg: "bg-success/15" },
  Rejected: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/15" },
};

const StudentLeave = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>(mockLeaves);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: "Sick Leave", from: "", to: "", reason: "" });

  const handleSubmit = () => {
    if (!form.from || !form.to || !form.reason) {
      toast.error("Please fill all fields!");
      return;
    }
    const newLeave: LeaveRequest = {
      id: leaves.length + 1,
      ...form,
      status: "Pending",
      appliedOn: new Date().toISOString().split("T")[0],
    };
    setLeaves([newLeave, ...leaves]);
    setForm({ type: "Sick Leave", from: "", to: "", reason: "" });
    setShowForm(false);
    toast.success("Leave application submitted!");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Apply for Leave</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <CalendarOff className="h-4 w-4" />
          {showForm ? "Cancel" : "New Application"}
        </button>
      </div>

      {/* Application Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-foreground mb-4">Leave Application Form</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Leave Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full text-sm bg-muted/50 border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:border-primary"
              >
                {["Sick Leave", "Family Emergency", "Personal", "Medical Appointment", "Other"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div />
            <div>
              <label className="text-xs text-muted-foreground block mb-1">From Date</label>
              <input
                type="date"
                value={form.from}
                onChange={(e) => setForm({ ...form, from: e.target.value })}
                className="w-full text-sm bg-muted/50 border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">To Date</label>
              <input
                type="date"
                value={form.to}
                onChange={(e) => setForm({ ...form, to: e.target.value })}
                className="w-full text-sm bg-muted/50 border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="text-xs text-muted-foreground block mb-1">Reason</label>
            <textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              rows={3}
              className="w-full text-sm bg-muted/50 border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:border-primary resize-none"
              placeholder="Describe your reason for leave..."
            />
          </div>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-success text-success-foreground text-sm font-medium hover:bg-success/90 transition-colors"
          >
            <Send className="h-4 w-4" /> Submit Application
          </button>
        </div>
      )}

      {/* Leave History */}
      <div className="space-y-3">
        {leaves.map((l) => {
          const cfg = statusConfig[l.status];
          return (
            <div key={l.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{l.type}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Applied: {l.appliedOn}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color} flex items-center gap-1`}>
                  <cfg.icon className="h-3 w-3" /> {l.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{l.reason}</p>
              <p className="text-xs text-muted-foreground">
                {l.from} → {l.to}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentLeave;
