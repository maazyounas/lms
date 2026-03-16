import { useEffect, useMemo, useState } from "react";
import type { AuditLogEntry } from "@/components/admin/types";
import { toast } from "sonner";
import type { AdminTeacherRecord } from "./types";
import { DEFAULT_CLASSES, DEFAULT_SUBJECTS, GENDER_OPTIONS, getInitials, teacherCode } from "./utils";
import EnrollTeacherSection from "./enroll/EnrollTeacherSection";
import SearchTeacherSection from "./search/SearchTeacherSection";
import ResetTeacherSection from "./reset/ResetTeacherSection";

interface Props {
  teachers: AdminTeacherRecord[];
  onTeachersChange: (next: AdminTeacherRecord[]) => void;
  onAuditLog?: (entry: Omit<AuditLogEntry, "id" | "createdAt">) => void;
  currentAdmin?: string;
  initialSection?: Section;
}

type Section = "enroll" | "search" | "reset";

type EnrollForm = {
  name: string;
  id: string;
  gender: string;
  qualification: string;
  courses: string[];
  classes: string[];
  classSubjects: Record<string, string[]>;
};

type EditForm = {
  name: string;
  id: number;
  gender: string;
  qualification: string;
  courses: string[];
  classes: string[];
  classSubjects: Record<string, string[]>;
};

type FormWithClasses = {
  courses: string[];
  classes: string[];
  classSubjects: Record<string, string[]>;
};

const AdminTeacher = ({
  teachers,
  onTeachersChange,
  onAuditLog,
  currentAdmin = "Admin User",
  initialSection = "enroll",
}: Props) => {
  const [activeSection, setActiveSection] = useState<Section>(initialSection);
  const [query, setQuery] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const [resetId, setResetId] = useState("");

  const [enrollForm, setEnrollForm] = useState<EnrollForm>({
    name: "",
    id: "",
    gender: "Male",
    qualification: "",
    courses: [],
    classes: [],
    classSubjects: {},
  });

  const [editingTeacherId, setEditingTeacherId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  
  useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection]);

  const classOptions = useMemo(() => {
    const dataClasses = teachers.flatMap((t) => t.classes);
    return Array.from(new Set([...DEFAULT_CLASSES, ...dataClasses])).sort();
  }, [teachers]);

  const subjectOptions = useMemo(() => {
    const dataSubjects = teachers.flatMap((t) =>
      t.subject
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    );
    return Array.from(new Set([...DEFAULT_SUBJECTS, ...dataSubjects])).sort();
  }, [teachers]);

  const filteredTeachers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return teachers;

    return teachers.filter((t) => {
      const subjectText = t.subject.toLowerCase();
      const classesText = t.classes.join(" ").toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        String(t.id).includes(q) ||
        teacherCode(t.id).toLowerCase().includes(q) ||
        subjectText.includes(q) ||
        classesText.includes(q)
      );
    });
  }, [query, teachers]);

  const selectedTeacher = useMemo(
    () => teachers.find((t) => t.id === selectedTeacherId) || null,
    [selectedTeacherId, teachers],
  );

  const toggleClass = <T extends FormWithClasses>(
    form: T,
    setForm: (next: T) => void,
    className: string,
  ) => {
    const exists = form.classes.includes(className);
    if (exists) {
      const nextSubjects = { ...form.classSubjects };
      delete nextSubjects[className];
      setForm({
        ...form,
        classes: form.classes.filter((x) => x !== className),
        classSubjects: nextSubjects,
      });
    } else {
      setForm({
        ...form,
        classes: [...form.classes, className],
        classSubjects: { ...form.classSubjects, [className]: [...form.courses] },
      });
    }
  };

  const toggleSubjectForClass = <T extends FormWithClasses>(
    form: T,
    setForm: (next: T) => void,
    className: string,
    subject: string,
  ) => {
    const current = form.classSubjects[className] || [];
    const next = current.includes(subject)
      ? current.filter((x) => x !== subject)
      : [...current, subject];
    setForm({
      ...form,
      classSubjects: { ...form.classSubjects, [className]: next },
    });
  };

  const enrollTeacher = () => {
    const name = enrollForm.name.trim();
    const numericId = Number(enrollForm.id.trim());
    const classes = enrollForm.classes;
    const courses = enrollForm.courses;
    const gender = enrollForm.gender;
    const qualification = enrollForm.qualification.trim();

    if (!name || !Number.isInteger(numericId) || numericId <= 0) {
      toast.error("Enter valid name and ID");
      return;
    }

    if (courses.length === 0) {
      toast.error("Assign at least one course");
      return;
    }

    if (classes.length === 0) {
      toast.error("Assign at least one class");
      return;
    }

    if (teachers.some((t) => t.id === numericId)) {
      toast.error("Teacher ID must be unique");
      return;
    }

    const effectiveClassSubjects = classes.reduce<Record<string, string[]>>((acc, className) => {
      const current = enrollForm.classSubjects[className] || [];
      acc[className] = current.length > 0 ? current : courses;
      return acc;
    }, {});

    const hasMissingSubjects = classes.some(
      (className) => (effectiveClassSubjects[className] || []).length === 0,
    );
    if (hasMissingSubjects) {
      toast.error("Assign at least one subject for each selected class");
      return;
    }

    const allSubjects = Array.from(
      new Set(classes.flatMap((className) => effectiveClassSubjects[className] || [])),
    );

    const newTeacher: AdminTeacherRecord = {
      id: numericId,
      name,
      gender,
      qualification,
      subject: allSubjects.join(", "),
      email: `${name.toLowerCase().replace(/\s+/g, ".")}@school.edu`,
      avatar: getInitials(name),
      classes,
      students: 0,
      phone: "",
      address: "",
      dob: "1985-01-01",
      joinDate: new Date().toISOString().slice(0, 10),
      emergencyContact: "",
      emergencyPhone: "",
      classSubjects: effectiveClassSubjects,
    };

    onTeachersChange([...teachers, newTeacher]);
    onAuditLog?.({
      actor: currentAdmin,
      module: "Teacher",
      action: "Enrolled Teacher",
      details: `${newTeacher.name} (${teacherCode(newTeacher.id)}) assigned ${newTeacher.classes.join(", ")}.`,
    });
    setEnrollForm({
      name: "",
      id: "",
      gender: "Male",
      qualification: "",
      courses: [],
      classes: [],
      classSubjects: {},
    });
    toast.success(`Teacher enrolled. Default password: ${numericId}`);
  };

  const startEditing = (teacher: AdminTeacherRecord) => {
    setEditingTeacherId(teacher.id);
    let classSubjects = teacher.classSubjects ? { ...teacher.classSubjects } : {};
    let courses: string[] = [];
    if (Object.keys(classSubjects).length === 0 && teacher.classes.length > 0) {
      const subjects = teacher.subject.split(",").map((s) => s.trim()).filter(Boolean);
      courses = subjects;
      classSubjects = teacher.classes.reduce((acc, cls) => {
        acc[cls] = subjects;
        return acc;
      }, {} as Record<string, string[]>);
    } else {
      courses = Array.from(
        new Set(Object.values(classSubjects).flatMap((subjects) => subjects)),
      );
    }
    setEditForm({
      name: teacher.name,
      id: teacher.id,
      gender: teacher.gender || "Male",
      qualification: teacher.qualification || "",
      courses,
      classes: [...teacher.classes],
      classSubjects,
    });
  };

  const cancelEdit = () => {
    setEditingTeacherId(null);
    setEditForm(null);
  };

  const saveEdit = () => {
    if (!editForm || !editingTeacherId) return;

    const name = editForm.name.trim();
    const classes = editForm.classes;
    const courses = editForm.courses;
    const gender = editForm.gender;
    const qualification = editForm.qualification.trim();

    if (!name) {
      toast.error("Name is required");
      return;
    }

    if (courses.length === 0) {
      toast.error("Assign at least one course");
      return;
    }

    if (classes.length === 0) {
      toast.error("Assign at least one class");
      return;
    }

    if (editForm.id !== editingTeacherId && teachers.some((t) => t.id === editForm.id)) {
      toast.error("Teacher ID already exists");
      return;
    }

    const effectiveClassSubjects = classes.reduce<Record<string, string[]>>((acc, className) => {
      const current = editForm.classSubjects[className] || [];
      acc[className] = current.length > 0 ? current : courses;
      return acc;
    }, {});

    const hasMissingSubjects = classes.some(
      (className) => (effectiveClassSubjects[className] || []).length === 0,
    );
    if (hasMissingSubjects) {
      toast.error("Assign at least one subject for each selected class");
      return;
    }

    const allSubjects = Array.from(
      new Set(classes.flatMap((className) => effectiveClassSubjects[className] || [])),
    );

    const updatedTeacher: AdminTeacherRecord = {
      ...teachers.find((t) => t.id === editingTeacherId)!,
      id: editForm.id,
      name,
      gender,
      qualification,
      subject: allSubjects.join(", "),
      classes,
      classSubjects: effectiveClassSubjects,
    };

    const newTeachers = teachers.map((t) =>
      t.id === editingTeacherId ? updatedTeacher : t,
    );
    onTeachersChange(newTeachers);
    onAuditLog?.({
      actor: currentAdmin,
      module: "Teacher",
      action: "Updated Teacher",
      details: `${updatedTeacher.name} (${teacherCode(updatedTeacher.id)}) details updated.`,
    });
    setEditingTeacherId(null);
    setEditForm(null);
    toast.success("Teacher updated successfully.");
  };

  const deleteTeacher = (teacher: AdminTeacherRecord) => {
    if (!window.confirm(`Are you sure you want to delete ${teacher.name}?`)) return;
    const newTeachers = teachers.filter((t) => t.id !== teacher.id);
    onTeachersChange(newTeachers);
    onAuditLog?.({
      actor: currentAdmin,
      module: "Teacher",
      action: "Deleted Teacher",
      details: `${teacher.name} (${teacherCode(teacher.id)}) removed.`,
    });
    if (selectedTeacherId === teacher.id) setSelectedTeacherId(null);
    toast.success("Teacher deleted.");
  };

  const resetPassword = () => {
    const numeric = Number(resetId.trim().replace(/[^0-9]/g, ""));
    if (!Number.isInteger(numeric) || numeric <= 0) {
      toast.error("Enter teacher ID");
      return;
    }

    const target = teachers.find((t) => t.id === numeric);
    if (!target) {
      toast.error("Teacher not found");
      return;
    }

    onAuditLog?.({
      actor: currentAdmin,
      module: "Security",
      action: "Reset Teacher Password",
      details: `Password reset for ${target.name} (${teacherCode(target.id)}).`,
    });
    toast.success(`Password reset. Default password is ${target.id}`);
    setResetId("");
  };

  const handleToggleEnrollClass = (className: string) =>
    toggleClass(enrollForm, (next) => setEnrollForm(next), className);
  const handleToggleEnrollSubject = (className: string, subject: string) =>
    toggleSubjectForClass(enrollForm, (next) => setEnrollForm(next), className, subject);
  const handleToggleEnrollCourse = (course: string) =>
    setEnrollForm((prev) => {
      const prevCourses = prev.courses;
      const nextCourses = prevCourses.includes(course)
        ? prevCourses.filter((x) => x !== course)
        : [...prevCourses, course];
      const nextClassSubjects = { ...prev.classSubjects };
      prev.classes.forEach((className) => {
        const current = nextClassSubjects[className] || [];
        const isAuto =
          current.length === 0 ||
          (current.length === prevCourses.length &&
            current.every((item) => prevCourses.includes(item)));
        if (isAuto) {
          nextClassSubjects[className] = nextCourses;
        } else {
          nextClassSubjects[className] = current.filter((item) =>
            nextCourses.includes(item),
          );
        }
      });
      return { ...prev, courses: nextCourses, classSubjects: nextClassSubjects };
    });

  const handleToggleEditClass = (className: string) => {
    if (!editForm) return;
    toggleClass(editForm, (next) => setEditForm(next), className);
  };
  const handleToggleEditSubject = (className: string, subject: string) => {
    if (!editForm) return;
    toggleSubjectForClass(editForm, (next) => setEditForm(next), className, subject);
  };
  const handleToggleEditCourse = (course: string) => {
    if (!editForm) return;
    setEditForm((prev) => {
      if (!prev) return prev;
      const prevCourses = prev.courses;
      const nextCourses = prevCourses.includes(course)
        ? prevCourses.filter((x) => x !== course)
        : [...prevCourses, course];
      const nextClassSubjects = { ...prev.classSubjects };
      prev.classes.forEach((className) => {
        const current = nextClassSubjects[className] || [];
        const isAuto =
          current.length === 0 ||
          (current.length === prevCourses.length &&
            current.every((item) => prevCourses.includes(item)));
        if (isAuto) {
          nextClassSubjects[className] = nextCourses;
        } else {
          nextClassSubjects[className] = current.filter((item) =>
            nextCourses.includes(item),
          );
        }
      });
      return { ...prev, courses: nextCourses, classSubjects: nextClassSubjects };
    });
  };

  const handleEditFormChange = (next: EditForm) => setEditForm(next);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Teacher Administration</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Teachers</p>
          <p className="text-2xl font-bold text-foreground">{teachers.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Classes Covered</p>
          <p className="text-2xl font-bold text-foreground">
            {new Set(teachers.flatMap((t) => t.classes)).size}
          </p>
        </div>
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
          Enroll Teacher
        </button>
        <button
          onClick={() => setActiveSection("search")}
          className={`px-4 py-2 rounded-lg text-sm border ${
            activeSection === "search"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card border-border"
          }`}
        >
          Search Teacher
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
        <EnrollTeacherSection
          enrollForm={enrollForm}
          onChange={(next) => setEnrollForm(next)}
          onEnroll={enrollTeacher}
          classOptions={classOptions}
          subjectOptions={subjectOptions}
          genderOptions={GENDER_OPTIONS}
          onToggleClass={handleToggleEnrollClass}
          onToggleCourse={handleToggleEnrollCourse}
          onToggleSubject={handleToggleEnrollSubject}
        />
      )}

      {activeSection === "search" && (
        <SearchTeacherSection
          query={query}
          onQueryChange={setQuery}
          filteredTeachers={filteredTeachers}
          selectedTeacherId={selectedTeacherId}
          onSelectTeacherId={setSelectedTeacherId}
          selectedTeacher={selectedTeacher}
          editingTeacherId={editingTeacherId}
          editForm={editForm}
          onEditFormChange={handleEditFormChange}
          onStartEditing={startEditing}
          onCancelEdit={cancelEdit}
          onSaveEdit={saveEdit}
          onDeleteTeacher={deleteTeacher}
          classOptions={classOptions}
          subjectOptions={subjectOptions}
          genderOptions={GENDER_OPTIONS}
          onToggleClass={handleToggleEditClass}
          onToggleCourse={handleToggleEditCourse}
          onToggleSubject={handleToggleEditSubject}
        />
      )}

      {activeSection === "reset" && (
        <ResetTeacherSection
          resetId={resetId}
          onResetIdChange={setResetId}
          onReset={resetPassword}
        />
      )}
    </div>
  );
};

export default AdminTeacher;
