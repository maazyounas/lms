import { useMemo, useState } from "react";
import type { Student } from "@/data/mockData";
import type { AuditLogEntry } from "@/components/admin/types";
import { toast } from "sonner";

interface Props {
  students: Student[];
  onAuditLog: (entry: Omit<AuditLogEntry, "id" | "createdAt">) => void;
  currentAdmin: string;
}

type Channel = "sms" | "whatsapp" | "email";
type ReminderType = "fees" | "attendance" | "results";
type TargetGroup = "all" | "pending-fee" | "low-attendance" | "class";

const buildMessage = (type: ReminderType, student: Student) => {
  if (type === "fees") {
    return `Dear Parent, ${student.name} has pending fee of Rs. ${student.fees.pending.toLocaleString()}. Please submit as soon as possible.`;
  }
  if (type === "attendance") {
    const pct =
      student.attendance.total > 0
        ? Math.round((student.attendance.present / student.attendance.total) * 100)
        : 0;
    return `Dear Parent, attendance of ${student.name} is ${pct}%. Please ensure regular attendance.`;
  }
  const gpa = student.progress.at(-1)?.gpa?.toFixed(2) || "N/A";
  return `Dear Parent, latest GPA for ${student.name} is ${gpa}. Please review student performance in portal.`;
};

const toDigits = (phone: string) => phone.replace(/[^0-9]/g, "");

const AdminParentCommunication = ({ students, onAuditLog, currentAdmin }: Props) => {
  const [channel, setChannel] = useState<Channel>("whatsapp");
  const [type, setType] = useState<ReminderType>("fees");
  const [target, setTarget] = useState<TargetGroup>("pending-fee");
  const [selectedClass, setSelectedClass] = useState("");

  const classes = useMemo(
    () => Array.from(new Set(students.map((s) => s.grade))).sort(),
    [students]
  );

  const recipients = useMemo(() => {
    if (target === "all") return students;
    if (target === "pending-fee") return students.filter((s) => s.fees.pending > 0);
    if (target === "low-attendance") {
      return students.filter((s) => {
        if (s.attendance.total === 0) return false;
        return (s.attendance.present / s.attendance.total) * 100 < 75;
      });
    }
    return students.filter((s) => s.grade === selectedClass);
  }, [selectedClass, students, target]);

  const sendReminder = () => {
    if (recipients.length === 0) {
      toast.error("No recipients found for selected criteria.");
      return;
    }

    const first = recipients[0];
    const msg = encodeURIComponent(buildMessage(type, first));
    if (channel === "email" && first.email) {
      window.open(`mailto:${first.email}?subject=School Reminder&body=${msg}`, "_blank");
    } else if (channel === "sms" && first.guardianPhone) {
      window.open(`sms:${toDigits(first.guardianPhone)}?body=${msg}`, "_blank");
    } else if (channel === "whatsapp" && first.guardianPhone) {
      window.open(`https://wa.me/${toDigits(first.guardianPhone)}?text=${msg}`, "_blank");
    }

    onAuditLog({
      actor: currentAdmin,
      module: "Student",
      action: "Sent Parent Reminder",
      details: `Channel: ${channel}, type: ${type}, recipients: ${recipients.length}, target: ${target}.`,
    });
    toast.success(`Reminder triggered for ${recipients.length} parents.`);
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-foreground">Parent Communication</h1>

      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as Channel)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="sms">SMS</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Email</option>
          </select>

          <select
            value={type}
            onChange={(e) => setType(e.target.value as ReminderType)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="fees">Fee Reminder</option>
            <option value="attendance">Attendance Reminder</option>
            <option value="results">Result Reminder</option>
          </select>

          <select
            value={target}
            onChange={(e) => setTarget(e.target.value as TargetGroup)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Parents</option>
            <option value="pending-fee">Pending Fee Parents</option>
            <option value="low-attendance">Low Attendance Parents</option>
            <option value="class">By Class</option>
          </select>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            disabled={target !== "class"}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">Select Class</option>
            {classes.map((className) => (
              <option key={className} value={className}>
                {className}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={sendReminder}
          className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Send One-Click Reminder
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm font-medium text-foreground mb-2">
          Recipients ({recipients.length})
        </p>
        <div className="max-h-72 overflow-auto space-y-2">
          {recipients.slice(0, 100).map((student) => (
            <div
              key={student.id}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <p className="font-medium">{student.name}</p>
              <p className="text-xs text-muted-foreground">
                {student.grade} | Guardian: {student.guardian || "N/A"} | {student.guardianPhone || "N/A"}
              </p>
            </div>
          ))}
          {recipients.length === 0 && (
            <p className="text-sm text-muted-foreground">No recipients for this selection.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminParentCommunication;
