import { useMemo, useState } from "react";
import { KeyRound, Search, UserPlus } from "lucide-react";
import type { Teacher } from "@/data/mockData";
import type { AuditLogEntry } from "@/components/admin/types";
import { toast } from "sonner";

export type AdminTeacherRecord = Teacher & {
  classSubjects?: Record<string, string[]>;
};

interface Props {
  teachers: AdminTeacherRecord[];
  onTeachersChange: (next: AdminTeacherRecord[]) => void;
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

const teacherCode = (id: number) => `TCH-${String(id).padStart(4, "0")}`;

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "TR";

const AdminTeacher = ({
  teachers,
  onTeachersChange,
  onAuditLog,
  currentAdmin = "Admin User",
}: Props) => {
  const [activeSection, setActiveSection] = useState<Section>("enroll");
  const [query, setQuery] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const [resetId, setResetId] = useState("");

  const [enrollForm, setEnrollForm] = useState({
    name: "",
    id: "",
    classes: [] as string[],
    classSubjects: {} as Record<string, string[]>,
  });

  const classOptions = useMemo(() => {
    const dataClasses = teachers.flatMap((t) => t.classes);
    return Array.from(new Set([...DEFAULT_CLASSES, ...dataClasses])).sort();
  }, [teachers]);

  const subjectOptions = useMemo(() => {
    const dataSubjects = teachers.flatMap((t) =>
      t.subject
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
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
    [selectedTeacherId, teachers]
  );

  const toggleClass = (className: string) => {
    setEnrollForm((prev) => {
      const exists = prev.classes.includes(className);
      if (exists) {
        const nextSubjects = { ...prev.classSubjects };
        delete nextSubjects[className];
        return {
          ...prev,
          classes: prev.classes.filter((x) => x !== className),
          classSubjects: nextSubjects,
        };
      }
      return {
        ...prev,
        classes: [...prev.classes, className],
        classSubjects: { ...prev.classSubjects, [className]: [] },
      };
    });
  };

  const toggleSubjectForClass = (className: string, subject: string) => {
    setEnrollForm((prev) => {
      const current = prev.classSubjects[className] || [];
      const next = current.includes(subject)
        ? current.filter((x) => x !== subject)
        : [...current, subject];
      return {
        ...prev,
        classSubjects: { ...prev.classSubjects, [className]: next },
      };
    });
  };

  const enrollTeacher = () => {
    const name = enrollForm.name.trim();
    const numericId = Number(enrollForm.id.trim());
    const classes = enrollForm.classes;

    if (!name || !Number.isInteger(numericId) || numericId <= 0 || classes.length === 0) {
      toast.error("Enter valid name, ID and at least one class");
      return;
    }

    if (teachers.some((t) => t.id === numericId)) {
      toast.error("Teacher ID must be unique");
      return;
    }

    const hasMissingSubjects = classes.some(
      (className) => (enrollForm.classSubjects[className] || []).length === 0
    );
    if (hasMissingSubjects) {
      toast.error("Assign at least one subject for each selected class");
      return;
    }

    const allSubjects = Array.from(
      new Set(classes.flatMap((className) => enrollForm.classSubjects[className] || []))
    );

    const newTeacher: AdminTeacherRecord = {
      id: numericId,
      name,
      subject: allSubjects.join(", "),
      email: `${name.toLowerCase().replace(/\s+/g, ".")}@school.edu`,
      avatar: getInitials(name),
      classes,
      students: 0,
      phone: "",
      address: "",
      dob: "1985-01-01",
      gender: "Not Set",
      qualification: "",
      joinDate: new Date().toISOString().slice(0, 10),
      emergencyContact: "",
      emergencyPhone: "",
      classSubjects: classes.reduce<Record<string, string[]>>((acc, className) => {
        acc[className] = enrollForm.classSubjects[className] || [];
        return acc;
      }, {}),
    };

    onTeachersChange([...teachers, newTeacher]);
    onAuditLog?.({
      actor: currentAdmin,
      module: "Teacher",
      action: "Enrolled Teacher",
      details: `${newTeacher.name} (${teacherCode(newTeacher.id)}) assigned ${newTeacher.classes.join(", ")}.`,
    });
    setEnrollForm({ name: "", id: "", classes: [], classSubjects: {} });
    toast.success(`Teacher enrolled. Default password: ${numericId}`);
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
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Enroll Teacher</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              value={enrollForm.name}
              onChange={(e) => setEnrollForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Teacher Name"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              value={enrollForm.id}
              onChange={(e) => setEnrollForm((prev) => ({ ...prev, id: e.target.value }))}
              placeholder="Teacher ID"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Assign Classes</p>
            <div className="flex flex-wrap gap-2">
              {classOptions.map((className) => (
                <label
                  key={className}
                  className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={enrollForm.classes.includes(className)}
                    onChange={() => toggleClass(className)}
                  />
                  {className}
                </label>
              ))}
            </div>
          </div>

          {enrollForm.classes.map((className) => (
            <div key={className} className="space-y-2 rounded-lg border border-border bg-background p-3">
              <p className="text-sm font-medium text-foreground">
                {className}: Assign Subjects
              </p>
              <div className="flex flex-wrap gap-2">
                {subjectOptions.map((subject) => (
                  <label
                    key={`${className}-${subject}`}
                    className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={(enrollForm.classSubjects[className] || []).includes(subject)}
                      onChange={() => toggleSubjectForClass(className, subject)}
                    />
                    {subject}
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={enrollTeacher}
            className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            Enroll Teacher
          </button>
        </div>
      )}

      {activeSection === "search" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by teacher name, ID, class or subject"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4">
            <div className="rounded-xl border border-border bg-card p-3 max-h-[460px] overflow-auto">
              {filteredTeachers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No teacher found.</p>
              ) : (
                <div className="space-y-2">
                  {filteredTeachers.map((teacher) => (
                    <button
                      key={teacher.id}
                      onClick={() => setSelectedTeacherId(teacher.id)}
                      className={`w-full rounded-lg border px-3 py-2 text-left ${
                        selectedTeacherId === teacher.id
                          ? "border-primary bg-primary/5"
                          : "border-border bg-background"
                      }`}
                    >
                      <p className="font-medium text-foreground">{teacher.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {teacherCode(teacher.id)} | {teacher.classes.join(", ")}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              {!selectedTeacher ? (
                <p className="text-sm text-muted-foreground">Select a teacher to view full details.</p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">{selectedTeacher.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {teacherCode(selectedTeacher.id)} | {selectedTeacher.email}
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg border border-border bg-background p-3">
                      <p className="text-xs text-muted-foreground">Subjects</p>
                      <p className="font-medium text-foreground">{selectedTeacher.subject || "N/A"}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-background p-3">
                      <p className="text-xs text-muted-foreground">Classes</p>
                      <p className="font-medium text-foreground">
                        {selectedTeacher.classes.join(", ") || "N/A"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-background p-3">
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="font-medium text-foreground">{selectedTeacher.phone || "N/A"}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-background p-3">
                      <p className="text-xs text-muted-foreground">Qualification</p>
                      <p className="font-medium text-foreground">
                        {selectedTeacher.qualification || "N/A"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-background p-3">
                      <p className="text-xs text-muted-foreground">Gender</p>
                      <p className="font-medium text-foreground">{selectedTeacher.gender || "N/A"}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-background p-3">
                      <p className="text-xs text-muted-foreground">Join Date</p>
                      <p className="font-medium text-foreground">{selectedTeacher.joinDate || "N/A"}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-background p-3 sm:col-span-2">
                      <p className="text-xs text-muted-foreground">Address</p>
                      <p className="font-medium text-foreground">{selectedTeacher.address || "N/A"}</p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-background p-3">
                    <p className="text-xs text-muted-foreground mb-2">Class-wise Subject Assignment</p>
                    {selectedTeacher.classSubjects &&
                    Object.keys(selectedTeacher.classSubjects).length > 0 ? (
                      <div className="space-y-1">
                        {Object.entries(selectedTeacher.classSubjects).map(([className, subjects]) => (
                          <p key={className} className="text-sm text-foreground">
                            <span className="font-medium">{className}:</span>{" "}
                            {subjects.length > 0 ? subjects.join(", ") : "No subjects assigned"}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Class-wise mapping not available for this teacher.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSection === "reset" && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4 max-w-xl">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Reset Teacher Password</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Enter teacher ID to reset portal password. Default password after reset is teacher ID.
          </p>
          <div className="flex gap-2">
            <input
              value={resetId}
              onChange={(e) => setResetId(e.target.value)}
              placeholder="Teacher ID"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <button
              onClick={resetPassword}
              className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeacher;
