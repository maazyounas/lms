import { useMemo, useState } from "react";
import type { Student } from "@/data/mockData";
import type { AuditLogEntry } from "@/components/admin/types";
import { toast } from "sonner";

interface Props {
  students: Student[];
  onAuditLog: (entry: Omit<AuditLogEntry, "id" | "createdAt">) => void;
  currentAdmin: string;
}

type ReminderType = "fees" | "absent" | "holiday" | "custom";
type ClassTarget = "all" | "specific";
type StudentTarget = "all" | "specific" | "one";

const buildMessage = (
  type: ReminderType,
  student: Student,
  customTitle: string,
  customBody: string
) => {
  if (type === "fees") {
    return {
      title: "Fee Reminder",
      body: `Dear Parent, ${student.name} has pending fee of Rs. ${student.fees.pending.toLocaleString()}. Please submit as soon as possible.`,
    };
  }
  if (type === "absent") {
    return {
      title: "Absent Today",
      body: `Dear Parent, ${student.name} was absent today. Please ensure regular attendance.`,
    };
  }
  if (type === "holiday") {
    return {
      title: "Easter Holidays",
      body: `Dear Parent, school will remain closed for Easter holidays. Please check the calendar for exact dates.`,
    };
  }
  return {
    title: customTitle.trim() || "Message",
    body: customBody.trim() || "Hello! This is a message from the school.",
  };
};

const toDigits = (phone: string) => phone.replace(/[^0-9]/g, "");

const AdminParentCommunication = ({ students, onAuditLog, currentAdmin }: Props) => {
  const [type, setType] = useState<ReminderType>("fees");
  const [classTarget, setClassTarget] = useState<ClassTarget>("all");
  const [studentTarget, setStudentTarget] = useState<StudentTarget>("all");
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [customTitle, setCustomTitle] = useState("");
  const [customBody, setCustomBody] = useState("");

  const classes = useMemo(
    () => Array.from(new Set(students.map((s) => s.grade))).sort(),
    [students]
  );

  const classFilteredStudents = useMemo(() => {
    if (classTarget === "all") return students;
    if (selectedClasses.length === 0) return [];
    return students.filter((s) => selectedClasses.includes(s.grade));
  }, [classTarget, selectedClasses, students]);

  const recipients = useMemo(() => {
    if (studentTarget === "all") return classFilteredStudents;
    if (studentTarget === "one") {
      return classFilteredStudents.filter((s) => s.id === selectedStudentId);
    }
    return classFilteredStudents.filter((s) => selectedStudents.includes(s.id));
  }, [classFilteredStudents, selectedStudentId, selectedStudents, studentTarget]);

  const sendReminder = () => {
    if (recipients.length === 0) {
      toast.error("No recipients found for selected criteria.");
      return;
    }

    const eligible = recipients.filter((r) => r.guardianPhone);
    if (eligible.length === 0) {
      toast.error("No guardian phone numbers found for selected students.");
      return;
    }

    eligible.forEach((student) => {
      const { title, body } = buildMessage(type, student, customTitle, customBody);
      const msg = encodeURIComponent(`${title}\n\n${body}`);
      window.open(`https://wa.me/${toDigits(student.guardianPhone ?? "")}?text=${msg}`, "_blank");
    });

    onAuditLog({
      actor: currentAdmin,
      module: "Student",
      action: "Sent Parent WhatsApp",
      details: `Type: ${type}, recipients: ${eligible.length}, classTarget: ${classTarget}, studentTarget: ${studentTarget}.`,
    });
    toast.success(`WhatsApp messages opened for ${eligible.length} parents.`);
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-foreground">Parent Communication</h1>

      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">Channel</p>
            <p className="text-xs text-muted-foreground">WhatsApp only</p>
          </div>
          <span className="rounded-full bg-emerald-500/10 text-emerald-600 px-3 py-1 text-xs font-semibold">
            WhatsApp
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ReminderType)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="fees">Fee Reminder</option>
            <option value="absent">Your Child Absent Today</option>
            <option value="holiday">Easter Holidays</option>
            <option value="custom">Custom Message</option>
          </select>

          <select
            value={classTarget}
            onChange={(e) => {
              const next = e.target.value as ClassTarget;
              setClassTarget(next);
              if (next === "all") setSelectedClasses([]);
            }}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Classes</option>
            <option value="specific">Specific Classes</option>
          </select>

          <select
            value={studentTarget}
            onChange={(e) => {
              const next = e.target.value as StudentTarget;
              setStudentTarget(next);
              if (next !== "specific") setSelectedStudents([]);
              if (next !== "one") setSelectedStudentId(null);
            }}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Students</option>
            <option value="specific">Specific Students</option>
            <option value="one">One Student</option>
          </select>
        </div>

        {classTarget === "specific" && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Select Classes</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {classes.map((className) => (
                <label key={className} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedClasses.includes(className)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedClasses((prev) => [...prev, className]);
                      } else {
                        setSelectedClasses((prev) => prev.filter((c) => c !== className));
                      }
                    }}
                  />
                  {className}
                </label>
              ))}
            </div>
          </div>
        )}

        {studentTarget === "specific" && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Select Students</p>
            <div className="max-h-48 overflow-auto rounded-lg border border-border p-2 space-y-2">
              {classFilteredStudents.map((student) => (
                <label key={student.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStudents((prev) => [...prev, student.id]);
                      } else {
                        setSelectedStudents((prev) => prev.filter((id) => id !== student.id));
                      }
                    }}
                  />
                  {student.name} ({student.grade})
                </label>
              ))}
              {classFilteredStudents.length === 0 && (
                <p className="text-xs text-muted-foreground">No students for selected classes.</p>
              )}
            </div>
          </div>
        )}

        {studentTarget === "one" && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Select Student</p>
            <select
              value={selectedStudentId ?? ""}
              onChange={(e) => setSelectedStudentId(Number(e.target.value) || null)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">Select student</option>
              {classFilteredStudents.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.grade})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder="Custom title (optional)"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <input
            type="text"
            value={customBody}
            onChange={(e) => setCustomBody(e.target.value)}
            placeholder="Custom message description (optional)"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>

        <button
          onClick={sendReminder}
          className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Send WhatsApp Message
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
