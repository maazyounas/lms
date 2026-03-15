import { useEffect, useMemo, useState } from "react";
import { TIMETABLE, type Student } from "@/data/mockData";
import type { AuditLogEntry } from "@/components/admin/types";
import { toast } from "sonner";
import type { EnrollStudentForm } from "./types";
import { DEFAULT_CLASSES, DEFAULT_SUBJECTS, getInitials, studentCode } from "./utils";
import EnrollStudentSection from "./enroll/EnrollStudentSection";
import SearchStudentSection from "./search/SearchStudentSection";
import ResetStudentSection from "./reset/ResetStudentSection";

interface Props {
  students: Student[];
  onStudentsChange: (next: Student[]) => void;
  onOpenFeeManagement: () => void;
  onAuditLog?: (entry: Omit<AuditLogEntry, "id" | "createdAt">) => void;
  currentAdmin?: string;
}

type Section = "enroll" | "search" | "reset";

const AdminStudent = ({
  students,
  onStudentsChange,
  onOpenFeeManagement,
  onAuditLog,
  currentAdmin = "Admin User",
}: Props) => {
  const [activeSection, setActiveSection] = useState<Section>("enroll");

  const [enrollForm, setEnrollForm] = useState<EnrollStudentForm>({
    name: "",
    id: "",
    gender: "",
    guardian: "",
    guardianPhone: "",
    className: "",
    subjects: [],
  });

  const [query, setQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [editableStudent, setEditableStudent] = useState<Student | null>(null);

  const [resetId, setResetId] = useState("");
  const [lastEnrolledId, setLastEnrolledId] = useState<number | null>(null);

  const classes = useMemo(() => {
    const fromData = students.map((s) => s.grade);
    return Array.from(new Set([...DEFAULT_CLASSES, ...fromData])).sort();
  }, [students]);

  const subjectOptions = useMemo(() => {
    const fromData = students.flatMap((s) => s.tests.map((t) => t.subject));
    return Array.from(new Set([...DEFAULT_SUBJECTS, ...fromData])).sort();
  }, [students]);

  const classSubjectOptions = useMemo(() => {
    return classes.reduce<Record<string, string[]>>((acc, className) => {
      const classSubjects = students
        .filter((s) => s.grade === className)
        .flatMap((s) => s.tests.map((t) => t.subject));
      const unique = Array.from(new Set([...DEFAULT_SUBJECTS, ...classSubjects])).sort();
      acc[className] = unique;
      return acc;
    }, {});
  }, [classes, students]);

  const activeSubjectOptions =
    enrollForm.className && classSubjectOptions[enrollForm.className]
      ? classSubjectOptions[enrollForm.className]
      : subjectOptions;

  const pendingFeeCount = students.filter((s) => s.fees.pending > 0).length;

  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        String(s.id).includes(q) ||
        studentCode(s.id).toLowerCase().includes(q),
    );
  }, [query, students]);

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === selectedStudentId) || null,
    [selectedStudentId, students],
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
    const guardianName = enrollForm.guardian.trim();
    const guardianPhone = enrollForm.guardianPhone.trim();
    const gender = enrollForm.gender.trim();

    if (!name || !className || !Number.isInteger(numericId) || numericId <= 0) {
      toast.error("Enter valid name, ID and class");
      return;
    }

    if (!gender) {
      toast.error("Select gender");
      return;
    }

    if (!guardianName || !guardianPhone) {
      toast.error("Enter guardian name and phone");
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
      gender,
      dob: "2010-01-01",
      phone: "",
      guardian: guardianName,
      guardianPhone,
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
    setLastEnrolledId(numericId);
    setEnrollForm({
      name: "",
      id: "",
      gender: "",
      guardian: "",
      guardianPhone: "",
      className: "",
      subjects: [],
    });
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

  const deleteStudent = (student: Student) => {
    if (!window.confirm(`Are you sure you want to delete ${student.name}?`)) return;
    const next = students.filter((s) => s.id !== student.id);
    onStudentsChange(next);
    onAuditLog?.({
      actor: currentAdmin,
      module: "Student",
      action: "Deleted Student",
      details: `${student.name} (${studentCode(student.id)}) removed.`,
    });
    if (selectedStudentId === student.id) setSelectedStudentId(null);
    toast.success("Student deleted.");
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
        <EnrollStudentSection
          enrollForm={enrollForm}
          onChange={(next) => setEnrollForm(next)}
          onEnroll={enrollStudent}
          classes={classes}
          activeSubjectOptions={activeSubjectOptions}
          onToggleSubject={toggleEnrollSubject}
          lastEnrolledId={lastEnrolledId}
        />
      )}

      {activeSection === "search" && (
        <SearchStudentSection
          query={query}
          onQueryChange={setQuery}
          filteredStudents={filteredStudents}
          selectedStudentId={selectedStudentId}
          onSelectStudentId={setSelectedStudentId}
          editableStudent={editableStudent}
          onEditableStudentChange={(next) => setEditableStudent(next)}
          onToggleSubject={toggleEditableSubject}
          subjectOptions={subjectOptions}
          onSave={saveStudentUpdates}
          onDelete={deleteStudent}
          timetable={TIMETABLE}
        />
      )}

      {activeSection === "reset" && (
        <ResetStudentSection
          resetId={resetId}
          onResetIdChange={setResetId}
          onReset={resetPassword}
        />
      )}
    </div>
  );
};

export default AdminStudent;
