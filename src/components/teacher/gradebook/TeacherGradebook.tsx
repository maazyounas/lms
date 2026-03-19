import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Save, User } from "lucide-react";
import { STUDENTS, type Student, type Teacher } from "@/data/mockData";
import { toast } from "sonner";
import { cambridgeGradeColor, percentageToCambridgeGrade } from "@/lib/grades";

type GradebookEntry = {
  id: string;
  teacherId: number;
  subject: string;
  classGrade: string;
  term: string;
  assessment: string;
  totalMarks: number;
  createdAt: string;
  marks: { studentId: number; marks: number }[];
};

type Props = {
  teacher: Teacher;
};

const storageKey = "teacher-gradebook-entries";

const TeacherGradebook = ({ teacher }: Props) => {
  const [selectedClass, setSelectedClass] = useState(teacher.classes[0] || "");
  const [term, setTerm] = useState("Term 1");
  const [assessment, setAssessment] = useState("");
  const [totalMarks, setTotalMarks] = useState("100");
  const [marksMap, setMarksMap] = useState<Record<number, string>>({});
  const [entries, setEntries] = useState<GradebookEntry[]>([]);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [autoFillMissing, setAutoFillMissing] = useState(true);
  const [page, setPage] = useState(1);

  const pageSize = 20;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(storageKey);
    const parsed = raw ? (JSON.parse(raw) as GradebookEntry[]) : [];
    setEntries(parsed.filter((e) => e.teacherId === teacher.id));
  }, [teacher.id]);

  const classStudents = useMemo(
    () => STUDENTS.filter((s) => s.grade === selectedClass),
    [selectedClass]
  );

  const totalMarksNumber = Number(totalMarks);
  const totalPages = Math.max(1, Math.ceil(classStudents.length / pageSize));
  const pagedStudents = useMemo(() => {
    const start = (page - 1) * pageSize;
    return classStudents.slice(start, start + pageSize);
  }, [classStudents, page, pageSize]);

  const activeEntry = useMemo(
    () => entries.find((e) => e.id === activeEntryId) || null,
    [entries, activeEntryId]
  );

  useEffect(() => {
    const next: Record<number, string> = {};
    classStudents.forEach((s) => {
      next[s.id] = marksMap[s.id] ?? "";
    });
    setMarksMap(next);
  }, [classStudents]);

  useEffect(() => {
    setPage(1);
  }, [selectedClass, classStudents.length]);

  const handleSave = () => {
    const total = Number(totalMarks);
    if (!selectedClass) {
      toast.error("Select a class to continue.");
      return;
    }
    if (!assessment.trim()) {
      toast.error("Enter an assessment name.");
      return;
    }
    if (Number.isNaN(total) || total <= 0) {
      toast.error("Total marks must be greater than 0.");
      return;
    }

    if (!autoFillMissing) {
      const missing = classStudents.filter(
        (s) => marksMap[s.id] === "" || marksMap[s.id] === undefined
      );
      if (missing.length > 0) {
        toast.error("Enter marks for all students or enable auto-fill missing as 0.");
        return;
      }
    }

    const marks = classStudents.map((s) => {
      const raw = marksMap[s.id];
      const value = raw === "" ? 0 : Number(raw);
      return { studentId: s.id, marks: Number.isNaN(value) ? 0 : value };
    });

    const invalid = marks.find((m) => m.marks < 0 || m.marks > total);
    if (invalid) {
      toast.error(`Marks must be between 0 and ${total}.`);
      return;
    }

    const entry: GradebookEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      teacherId: teacher.id,
      subject: teacher.subject,
      classGrade: selectedClass,
      term,
      assessment: assessment.trim(),
      totalMarks: total,
      createdAt: new Date().toISOString(),
      marks,
    };

    const nextEntries = [entry, ...entries];
    setEntries(nextEntries);
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(nextEntries));
    }
    toast.success("Gradebook entry saved.");
    setAssessment("");
    setActiveEntryId(entry.id);
  };

  const getStudent = (id: number) =>
    STUDENTS.find((s) => s.id === id) as Student | undefined;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Gradebook</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enter marks by class, term, and assessment.
        </p>
      </div>
      <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
        Enter total marks once; percentages and Cambridge grades are calculated automatically.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm"
                >
                  {teacher.classes.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Term</label>
                <input
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="e.g., Term 1 or Spring 2026"
                  className="mt-1 w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-muted-foreground">Assessment</label>
                <input
                  value={assessment}
                  onChange={(e) => setAssessment(e.target.value)}
                  placeholder="e.g., Mid-Term Quiz"
                  className="mt-1 w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Total Marks</label>
                <input
                  type="number"
                  min={1}
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <input
                id="auto-fill-missing"
                type="checkbox"
                checked={autoFillMissing}
                onChange={(e) => setAutoFillMissing(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <label htmlFor="auto-fill-missing">
                Auto-fill missing marks as 0 when saving
              </label>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="text-left p-2">Student</th>
                    <th className="text-left p-2">Marks</th>
                    <th className="text-left p-2">%</th>
                    <th className="text-left p-2">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedStudents.map((s) => {
                    const raw = marksMap[s.id];
                    const hasValue = raw !== "" && raw !== undefined;
                    const numeric = hasValue ? Number(raw) : autoFillMissing ? 0 : NaN;
                    const safeMarks = Number.isNaN(numeric) ? null : numeric;
                    const percent =
                      safeMarks !== null && !Number.isNaN(totalMarksNumber) && totalMarksNumber > 0
                        ? (safeMarks / totalMarksNumber) * 100
                        : null;
                    const grade =
                      percent !== null ? percentageToCambridgeGrade(percent) : null;
                    return (
                    <tr key={s.id} className="border-b border-border last:border-0">
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                            {s.avatar}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{s.name}</p>
                            <p className="text-xs text-muted-foreground">
                              ID: STU-{String(s.id).padStart(4, "0")}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min={0}
                          value={marksMap[s.id] ?? ""}
                          onChange={(e) =>
                            setMarksMap((prev) => ({ ...prev, [s.id]: e.target.value }))
                          }
                          className="w-24 rounded-md border border-border bg-muted/30 px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="p-2 text-sm text-muted-foreground">
                        {percent === null ? "—" : `${percent.toFixed(1)}%`}
                      </td>
                      <td className={`p-2 text-sm font-semibold ${grade ? cambridgeGradeColor(grade) : "text-muted-foreground"}`}>
                        {grade ?? "—"}
                      </td>
                    </tr>
                    );
                  })}
                  {classStudents.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-muted-foreground">
                        No students in this class.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {classStudents.length > pageSize && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                <div>
                  Showing {(page - 1) * pageSize + 1}-
                  {Math.min(page * pageSize, classStudents.length)} of {classStudents.length}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-2 py-1 rounded border border-border hover:bg-muted/40"
                    disabled={page === 1}
                  >
                    Prev
                  </button>
                  <span>
                    Page {page} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-2 py-1 rounded border border-border hover:bg-muted/40"
                    disabled={page === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
              >
                <Save className="h-4 w-4" />
                Save Marks
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <ClipboardList className="h-4 w-4" /> Recent Entries
            </h3>
            {entries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No gradebook entries yet.</p>
            ) : (
              <div className="space-y-2">
                {entries.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => setActiveEntryId(entry.id)}
                    className={`w-full text-left rounded-lg border p-3 ${
                      entry.id === activeEntryId
                        ? "border-primary/60 bg-primary/5"
                        : "border-border bg-background hover:border-primary/40"
                    }`}
                  >
                    <p className="text-sm font-semibold text-foreground">{entry.assessment}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {entry.classGrade} - {entry.term}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {activeEntry && (
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <User className="h-4 w-4" /> Entry Details
              </h3>
              <div className="text-xs text-muted-foreground">
                <p>{activeEntry.assessment}</p>
                <p>
                  {activeEntry.classGrade} - {activeEntry.term}
                </p>
                <p>Total: {activeEntry.totalMarks}</p>
              </div>
              <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                {activeEntry.marks.map((m) => {
                  const student = getStudent(m.studentId);
                  return (
                    <div key={m.studentId} className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{student?.name || "Student"}</span>
                      <span className="text-muted-foreground">
                        {m.marks}/{activeEntry.totalMarks}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherGradebook;
