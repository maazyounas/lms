import { useMemo, useState } from "react";
import { ChevronLeft, Search } from "lucide-react";
import {
  STUDENTS,
  TEACHERS,
  TEACHER_ASSIGNMENTS,
  type Student,
  type Teacher,
} from "@/data/mockData";

const studentCode = (id: number) => `STU-${String(id).padStart(4, "0")}`;

const badge = (status: string) =>
  ({
    Paid: "bg-success/15 text-success",
    Submitted: "bg-success/15 text-success",
    Partial: "bg-warning/15 text-warning",
    Pending: "bg-warning/15 text-warning",
    Late: "bg-warning/15 text-warning",
    Missing: "bg-destructive/15 text-destructive",
  }[status] || "bg-muted text-muted-foreground");

const AdminUsers = () => {
  const [tab, setTab] = useState<"students" | "teachers">("students");
  const [studentSearch, setStudentSearch] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    if (!q) return STUDENTS;
    return STUDENTS.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        studentCode(s.id).toLowerCase().includes(q) ||
        String(s.id).includes(q)
    );
  }, [studentSearch]);

  const filteredTeachers = useMemo(() => {
    const q = teacherSearch.trim().toLowerCase();
    if (!q) return TEACHERS;
    return TEACHERS.filter(
      (t) => t.name.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q)
    );
  }, [teacherSearch]);

  if (selectedStudent) {
    return (
      <div>
        <button
          onClick={() => setSelectedStudent(null)}
          className="mb-4 flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <div className="mb-5 rounded-xl border border-border bg-card p-5">
          <h2 className="text-xl font-bold text-foreground">{selectedStudent.name}</h2>
          <p className="text-sm text-muted-foreground">
            {studentCode(selectedStudent.id)} | {selectedStudent.grade} |{" "}
            {selectedStudent.email}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Current GPA</p>
            <p className="text-2xl font-bold text-primary">
              {selectedStudent.progress.at(-1)?.gpa.toFixed(2)}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Attendance</p>
            <p className="text-2xl font-bold text-info">
              {(
                (selectedStudent.attendance.present / selectedStudent.attendance.total) *
                100
              ).toFixed(0)}
              %
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Pending Fee</p>
            <p className="text-2xl font-bold text-destructive">
              Rs. {selectedStudent.fees.pending.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (selectedTeacher) {
    const subjectStudents = STUDENTS.filter((s) =>
      s.tests.some((x) => x.subject === selectedTeacher.subject)
    );
    const assignments = TEACHER_ASSIGNMENTS.filter(
      (a) => a.subject === selectedTeacher.subject
    );

    return (
      <div>
        <button
          onClick={() => setSelectedTeacher(null)}
          className="mb-4 flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <div className="mb-5 rounded-xl border border-border bg-card p-5">
          <h2 className="text-xl font-bold text-foreground">{selectedTeacher.name}</h2>
          <p className="text-sm text-muted-foreground">
            {selectedTeacher.subject} | {selectedTeacher.email}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 mb-4">
          <p className="text-sm text-muted-foreground">
            Students in subject: {subjectStudents.length}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map((a) => (
            <div key={a.id} className="rounded-xl border border-border bg-card p-4">
              <p className="font-semibold text-foreground">{a.title}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Class {a.classGrade} | Due {a.dueDate}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => setTab("students")}
          className={`px-3 py-1.5 rounded-lg text-sm ${
            tab === "students" ? "bg-primary text-primary-foreground" : "bg-card border border-border"
          }`}
        >
          Students
        </button>
        <button
          onClick={() => setTab("teachers")}
          className={`px-3 py-1.5 rounded-lg text-sm ${
            tab === "teachers" ? "bg-primary text-primary-foreground" : "bg-card border border-border"
          }`}
        >
          Teachers
        </button>
      </div>

      {tab === "students" ? (
        <div>
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-2xl font-bold text-foreground">Student Management</h1>
            <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 bg-card">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search by name or ID"
                className="bg-transparent outline-none text-sm"
              />
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["Student", "ID", "Class", "GPA", "Fees"].map((h) => (
                    <th key={h} className="px-4 py-2 text-left text-xs text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => setSelectedStudent(s)}
                    className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-2 text-sm">{s.name}</td>
                    <td className="px-4 py-2 text-sm text-muted-foreground">
                      {studentCode(s.id)}
                    </td>
                    <td className="px-4 py-2 text-sm">{s.grade}</td>
                    <td className="px-4 py-2 text-sm font-semibold">
                      {s.progress.at(-1)?.gpa.toFixed(2)}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${badge(s.fees.status)}`}>
                        {s.fees.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-2xl font-bold text-foreground">Teacher Management</h1>
            <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 bg-card">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={teacherSearch}
                onChange={(e) => setTeacherSearch(e.target.value)}
                placeholder="Search teacher or subject"
                className="bg-transparent outline-none text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeachers.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTeacher(t)}
                className="rounded-xl border border-border bg-card p-4 text-left hover:border-primary/40"
              >
                <p className="font-semibold text-foreground">{t.name}</p>
                <p className="text-sm text-muted-foreground">{t.subject}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
