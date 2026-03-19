import { useState } from "react";
import { toast } from "sonner";

type LeaveStatus = "Pending" | "Approved" | "Rejected";

type LeaveRequest = {
  id: number;
  personType: "Student" | "Teacher";
  personName: string;
  leaveType: string;
  from: string;
  to: string;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
};

const badge = (status: LeaveStatus) =>
  ({
    Approved: "bg-success/15 text-success",
    Pending: "bg-warning/15 text-warning",
    Rejected: "bg-destructive/15 text-destructive",
  }[status]);

const leavesSeed: LeaveRequest[] = [
  {
    id: 1,
    personType: "Student",
    personName: "Ayesha Khan",
    leaveType: "Sick Leave",
    from: "2026-03-02",
    to: "2026-03-03",
    reason: "Medical rest",
    status: "Pending",
    appliedOn: "2026-02-28",
  },
  {
    id: 2,
    personType: "Student",
    personName: "Ahmed Raza",
    leaveType: "Personal",
    from: "2026-03-05",
    to: "2026-03-05",
    reason: "Family event",
    status: "Pending",
    appliedOn: "2026-02-27",
  },
  {
    id: 3,
    personType: "Teacher",
    personName: "Mr. Imran Ali",
    leaveType: "Casual Leave",
    from: "2026-03-04",
    to: "2026-03-04",
    reason: "Personal work",
    status: "Pending",
    appliedOn: "2026-02-28",
  },
];

interface Props {
  onPendingCountChange?: (count: number) => void;
}

const AdminLeaveRequests = ({ onPendingCountChange }: Props) => {
  const [leaveRequests, setLeaveRequests] = useState(leavesSeed);
  const [activeType, setActiveType] = useState<"All" | "Student" | "Teacher">("All");

  const updateStatus = (id: number, status: LeaveStatus) => {
    setLeaveRequests((prev) => {
      const next = prev.map((x) => (x.id === id ? { ...x, status } : x));
      onPendingCountChange?.(next.filter((x) => x.status === "Pending").length);
      return next;
    });
    toast.success(`Leave ${status.toLowerCase()}.`);
  };

  const filteredLeaves =
    activeType === "All"
      ? leaveRequests
      : leaveRequests.filter((l) => l.personType === activeType);

  const pendingCounts = leaveRequests.reduce(
    (acc, leave) => {
      if (leave.status !== "Pending") return acc;
      if (leave.personType === "Student") acc.students += 1;
      if (leave.personType === "Teacher") acc.teachers += 1;
      return acc;
    },
    { students: 0, teachers: 0 }
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-5">Leave Requests</h1>
      <div className="flex flex-wrap gap-2 mb-4">
        {(["All", "Student", "Teacher"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              activeType === type
                ? "border-primary/60 bg-primary/10 text-primary"
                : "border-border bg-background text-foreground"
            }`}
          >
            {type}
            {type === "Student" && pendingCounts.students > 0
              ? ` (${pendingCounts.students})`
              : ""}
            {type === "Teacher" && pendingCounts.teachers > 0
              ? ` (${pendingCounts.teachers})`
              : ""}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["Person", "Type", "Duration", "Reason", "Status", "Actions"].map((h) => (
                <th key={h} className="px-4 py-2 text-left text-xs text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredLeaves.map((l) => (
              <tr key={l.id} className="border-b border-border last:border-0">
                <td className="px-4 py-2 text-sm">
                  {l.personName}
                  <p className="text-xs text-muted-foreground">{l.personType}</p>
                </td>
                <td className="px-4 py-2 text-sm">{l.leaveType}</td>
                <td className="px-4 py-2 text-sm text-muted-foreground">
                  {l.from} to {l.to}
                </td>
                <td className="px-4 py-2 text-sm">{l.reason}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${badge(l.status)}`}>
                    {l.status}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(l.id, "Approved")}
                      className="px-2 py-1 rounded bg-success text-success-foreground text-xs"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => updateStatus(l.id, "Rejected")}
                      className="px-2 py-1 rounded bg-destructive text-destructive-foreground text-xs"
                    >
                      Deny
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminLeaveRequests;
