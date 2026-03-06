import { useEffect, useMemo, useState } from "react";
import { Search, UserPlus, KeyRound } from "lucide-react";
import { TIMETABLE, type Student } from "@/data/mockData";
import type { AuditLogEntry } from "@/components/admin/types";
import { toast } from "sonner";

interface Props {
  students: Student[];
  onStudentsChange: (next: Student[]) => void;
  onOpenFeeManagement: () => void;
  onAuditLog?: (entry: Omit<AuditLogEntry, "id" | "createdAt">) => void;
  currentAdmin?: string;
}

type Section = "enroll" | "search" | "reset";

const DEFAULT_CLASSES = ["9-A", "9-B", "10-A", "10-B", "11-A"];
const DEFAULT_SUBJECTS = [
  "Mathematics",
  "English",
  "Physics",
  "Chemistry",
  "Urdu",
  "Computer Science",
  "Biology",
];

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "ST";

const studentCode = (id: number) => `STU-${String(id).padStart(4, "0")}`;

const AdminStudent = ({
  students,
  onStudentsChange,
  onOpenFeeManagement,
  onAuditLog,
  currentAdmin = "Admin User",
}: Props) => {
  const [activeSection, setActiveSection] = useState<Section>("enroll");

  const [enrollForm, setEnrollForm] = useState({
    name: "",
    id: "",
    className: "",
    subjects: [] as string[],
  });

  const [query, setQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [editableStudent, setEditableStudent] = useState<Student | null>(null);

  const [resetId, setResetId] = useState("");

  const classes = useMemo(() => {
    const fromData = students.map((s) => s.grade);
    return Array.from(new Set([...DEFAULT_CLASSES, ...fromData])).sort();
  }, [students]);

  const subjectOptions = useMemo(() => {
    const fromData = students.flatMap((s) => s.tests.map((t) => t.subject));
    return Array.from(new Set([...DEFAULT_SUBJECTS, ...fromData])).sort();
  }, [students]);

  const pendingFeeCount = students.filter((s) => s.fees.pending > 0).length;

  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        String(s.id).includes(q) ||
        studentCode(s.id).toLowerCase().includes(q)
    );
  }, [query, students]);

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === selectedStudentId) || null,
    [selectedStudentId, students]
  );

  useEffect(() => {
    if (!selectedStudent) {
      setEditableStudent(null);
      return;
    }
    setEditableStudent({ ...selectedStudent });
  }, [selectedStudent]);

  const toggleEnrollSubject = (subject: string) => {
    setEnrollForm((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((x) => x !== subject)
        : [...prev.subjects, subject],
    }));
  };

  const enrollStudent = () => {
    const name = enrollForm.name.trim();
    const className = enrollForm.className.trim();
    const numericId = Number(enrollForm.id);

    if (!name || !className || !Number.isInteger(numericId) || numericId <= 0) {
      toast.error("Enter valid name, ID and class");
      return;
    }

    if (students.some((s) => s.id === numericId)) {
      toast.error("Student ID must be unique");
      return;
    }

    const selectedSubjects =
      enrollForm.subjects.length > 0 ? enrollForm.subjects : ["Mathematics", "English"];

    const newStudent: Student = {
      id: numericId,
      name,
      email: `${name.toLowerCase().replace(/\s+/g, ".")}@school.edu`,
      grade: className,
      avatar: getInitials(name),
      gender: "Not Set",
      dob: "2010-01-01",
      phone: "",
      guardian: "",
      guardianPhone: "",
      address: "",
      enrollDate: new Date().toISOString().slice(0, 10),
      status: "Active",
      attendance: { present: 0, absent: 0, late: 0, total: 0 },
      tests: selectedSubjects.map((subject) => ({
        subject,
        test: "Initial Enrollment",
        marks: 0,
        total: 100,
        date: new Date().toISOString().slice(0, 10),
        grade: "N/A",
      })),
      progress: [],
      assignments: [],
      behavior: [],
      fees: { total: 45000, paid: 0, pending: 45000, status: "Pending" },
    };

    onStudentsChange([...students, newStudent]);
    onAuditLog?.({
      actor: currentAdmin,
      module: "Student",
      action: "Enrolled Student",
      details: `${newStudent.name} (${studentCode(newStudent.id)}) enrolled in ${newStudent.grade}.`,
    });
    setEnrollForm({ name: "", id: "", className: "", subjects: [] });
    toast.success(`Student enrolled. Default password: ${numericId}`);
  };

  const resetPassword = () => {
    const trimmed = resetId.trim();
    if (!trimmed) {
      toast.error("Enter student ID");
      return;
    }

    const numeric = Number(trimmed.replace(/[^0-9]/g, ""));
    const target = students.find((s) => s.id === numeric);

    if (!target) {
      toast.error("Student not found");
      return;
    }

    onAuditLog?.({
      actor: currentAdmin,
      module: "Security",
      action: "Reset Student Password",
      details: `Password reset for ${target.name} (${studentCode(target.id)}).`,
    });
    toast.success(`Password reset. Default password is ${target.id}`);
    setResetId("");
  };

  const toggleEditableSubject = (subject: string) => {
    if (!editableStudent) return;

    const hasSubject = editableStudent.tests.some((t) => t.subject === subject);
    const nextTests = hasSubject
      ? editableStudent.tests.filter((t) => t.subject !== subject)
      : [
          ...editableStudent.tests,
          {
            subject,
            test: "Enrollment Subject",
            marks: 0,
            total: 100,
            date: new Date().toISOString().slice(0, 10),
            grade: "N/A",
          },
        ];

    setEditableStudent({ ...editableStudent, tests: nextTests });
  };

  const saveStudentUpdates = () => {
    if (!editableStudent) return;

    const next = students.map((s) => (s.id === editableStudent.id ? editableStudent : s));
    onStudentsChange(next);
    onAuditLog?.({
      actor: currentAdmin,
      module: "Student",
      action: "Updated Student Profile",
      details: `${editableStudent.name} (${studentCode(editableStudent.id)}) information updated.`,
    });
    toast.success("Student information updated");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Student Administration</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Student Strength</p>
          <p className="text-2xl font-bold text-foreground">{students.length}</p>
        </div>

        <button
          onClick={onOpenFeeManagement}
          className="rounded-xl border border-border bg-card p-4 text-left hover:border-primary/40"
        >
          <p className="text-xs text-muted-foreground">Students With Pending Fee</p>
          <p className="text-2xl font-bold text-destructive">{pendingFeeCount}</p>
          <p className="text-xs text-primary mt-1">Open fee management</p>
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setActiveSection("enroll")}
          className={`px-4 py-2 rounded-lg text-sm border ${
            activeSection === "enroll"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card border-border"
          }`}
        >
          Enroll Student
        </button>
        <button
          onClick={() => setActiveSection("search")}
          className={`px-4 py-2 rounded-lg text-sm border ${
            activeSection === "search"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card border-border"
          }`}
        >
          Search Student
        </button>
        <button
          onClick={() => setActiveSection("reset")}
          className={`px-4 py-2 rounded-lg text-sm border ${
            activeSection === "reset"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card border-border"
          }`}
        >
          Reset Password
        </button>
      </div>

      {activeSection === "enroll" && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Enroll Student</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              value={enrollForm.name}
              onChange={(e) => setEnrollForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Student Name"
              className="rounded-lg border border-border bg-background px-3 py-2"
            />
            <input
              value={enrollForm.id}
              onChange={(e) => setEnrollForm((prev) => ({ ...prev, id: e.target.value }))}
              placeholder="Unique Student ID"
              className="rounded-lg border border-border bg-background px-3 py-2"
            />

            <select
              value={enrollForm.className}
              onChange={(e) =>
                setEnrollForm((prev) => ({ ...prev, className: e.target.value }))
              }
              className="rounded-lg border border-border bg-background px-3 py-2"
            >
              <option value="">Select Class</option>
              {classes.map((className) => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground mb-2">Select Subjects</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {subjectOptions.map((subject) => (
                <label
                  key={subject}
                  className="flex items-center gap-2 rounded-lg border border-border p-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={enrollForm.subjects.includes(subject)}
                    onChange={() => toggleEnrollSubject(subject)}
                  />
                  {subject}
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={enrollStudent}
            className="rounded-lg bg-primary px-4 py-2 text-primary-foreground"
          >
            Enroll Student
          </button>
        </div>
      )}

      {activeSection === "search" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-1 rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or ID"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>

            <div className="max-h-[500px] overflow-auto space-y-2">
              {filteredStudents.map((student) => (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudentId(student.id)}
                  className={`w-full rounded-lg border p-3 text-left ${
                    selectedStudentId === student.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <p className="font-medium text-foreground">{student.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {studentCode(student.id)} | {student.grade}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="xl:col-span-2 rounded-xl border border-border bg-card p-4">
            {!editableStudent ? (
              <p className="text-sm text-muted-foreground">Select a student to view full details.</p>
            ) : (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{editableStudent.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {studentCode(editableStudent.id)} | {editableStudent.grade} | {editableStudent.email}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <input
                    value={editableStudent.name}
                    onChange={(e) =>
                      setEditableStudent({ ...editableStudent, name: e.target.value })
                    }
                    className="rounded-lg border border-border bg-background px-3 py-2"
                    placeholder="Name"
                  />
                  <input
                    value={editableStudent.email}
                    onChange={(e) =>
                      setEditableStudent({ ...editableStudent, email: e.target.value })
                    }
                    className="rounded-lg border border-border bg-background px-3 py-2"
                    placeholder="Email"
                  />
                  <input
                    value={editableStudent.grade}
                    onChange={(e) =>
                      setEditableStudent({ ...editableStudent, grade: e.target.value })
                    }
                    className="rounded-lg border border-border bg-background px-3 py-2"
                    placeholder="Class"
                  />
                  <input
                    value={editableStudent.phone}
                    onChange={(e) =>
                      setEditableStudent({ ...editableStudent, phone: e.target.value })
                    }
                    className="rounded-lg border border-border bg-background px-3 py-2"
                    placeholder="Phone"
                  />
                  <input
                    value={editableStudent.guardian}
                    onChange={(e) =>
                      setEditableStudent({ ...editableStudent, guardian: e.target.value })
                    }
                    className="rounded-lg border border-border bg-background px-3 py-2"
                    placeholder="Guardian"
                  />
                  <input
                    value={editableStudent.guardianPhone}
                    onChange={(e) =>
                      setEditableStudent({ ...editableStudent, guardianPhone: e.target.value })
                    }
                    className="rounded-lg border border-border bg-background px-3 py-2"
                    placeholder="Guardian Phone"
                  />
                  <input
                    value={editableStudent.address}
                    onChange={(e) =>
                      setEditableStudent({ ...editableStudent, address: e.target.value })
                    }
                    className="rounded-lg border border-border bg-background px-3 py-2 md:col-span-2"
                    placeholder="Address"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Subjects</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {subjectOptions.map((subject) => (
                      <label
                        key={subject}
                        className="flex items-center gap-2 rounded-lg border border-border p-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={editableStudent.tests.some((t) => t.subject === subject)}
                          onChange={() => toggleEditableSubject(subject)}
                        />
                        {subject}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs text-muted-foreground">Attendance</p>
                    <p className="font-semibold">
                      {editableStudent.attendance.total > 0
                        ? `${Math.round(
                            (editableStudent.attendance.present /
                              editableStudent.attendance.total) *
                              100
                          )}%`
                        : "N/A"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs text-muted-foreground">Current GPA</p>
                    <p className="font-semibold">
                      {editableStudent.progress.at(-1)?.gpa?.toFixed(2) || "N/A"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs text-muted-foreground">Fee Status</p>
                    <p className="font-semibold">{editableStudent.fees.status}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="p-3 border-b border-border text-sm font-medium">Grades</div>
                  <div className="max-h-48 overflow-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border text-xs text-muted-foreground">
                          <th className="px-3 py-2 text-left">Subject</th>
                          <th className="px-3 py-2 text-left">Test</th>
                          <th className="px-3 py-2 text-left">Marks</th>
                          <th className="px-3 py-2 text-left">Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {editableStudent.tests.map((test, idx) => (
                          <tr key={`${test.subject}-${idx}`} className="border-b border-border last:border-0">
                            <td className="px-3 py-2 text-sm">{test.subject}</td>
                            <td className="px-3 py-2 text-sm">{test.test}</td>
                            <td className="px-3 py-2 text-sm">{test.marks}/{test.total}</td>
                            <td className="px-3 py-2 text-sm">{test.grade}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="p-3 border-b border-border text-sm font-medium">Class Timetable</div>
                  <div className="max-h-56 overflow-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-xs text-muted-foreground">
                          <th className="px-2 py-2 text-left">Time</th>
                          <th className="px-2 py-2 text-left">Mon</th>
                          <th className="px-2 py-2 text-left">Tue</th>
                          <th className="px-2 py-2 text-left">Wed</th>
                          <th className="px-2 py-2 text-left">Thu</th>
                          <th className="px-2 py-2 text-left">Fri</th>
                        </tr>
                      </thead>
                      <tbody>
                        {TIMETABLE.map((slot) => (
                          <tr key={slot.time} className="border-b border-border last:border-0">
                            <td className="px-2 py-2">{slot.time}</td>
                            <td className="px-2 py-2">{slot.mon || "-"}</td>
                            <td className="px-2 py-2">{slot.tue || "-"}</td>
                            <td className="px-2 py-2">{slot.wed || "-"}</td>
                            <td className="px-2 py-2">{slot.thu || "-"}</td>
                            <td className="px-2 py-2">{slot.fri || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <button
                  onClick={saveStudentUpdates}
                  className="rounded-lg bg-primary px-4 py-2 text-primary-foreground"
                >
                  Update Student Information
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSection === "reset" && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-warning" />
            <h2 className="text-lg font-semibold">Reset Password</h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={resetId}
              onChange={(e) => setResetId(e.target.value)}
              placeholder="Enter Student ID"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2"
            />
            <button
              onClick={resetPassword}
              className="rounded-lg bg-warning px-4 py-2 text-white"
            >
              Reset Password
            </button>
          </div>

          <p className="text-sm text-muted-foreground">
            Default password after reset is the student ID.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminStudent;
