import { useEffect, useMemo, useState } from "react";
import { STUDENTS } from "@/data/mockData";
import AttendanceDetails from "./components/AttendanceDetails";
import AttendanceFilters from "./components/AttendanceFilters";
import StudentList from "./components/StudentList";
import type {
  AdminAttendanceProps,
  AttendanceRecord,
  AttendanceStatus,
} from "./types/attendance";

type TeacherAttendancePayload = {
  id: string;
  className: string;
  teacherName: string;
  date: string;
  time: string;
  classType?: string;
  roomOrMode?: string;
  entries: { studentId: number; status: AttendanceStatus }[];
};

const buildLogsFromSubmissions = (
  students: AdminAttendanceProps["students"] = [],
  submissions: TeacherAttendancePayload[]
) => {
  const logs: Record<number, AttendanceRecord[]> = {};
  students.forEach((student) => {
    logs[student.id] = [];
  });

  submissions.forEach((payload) => {
    const day = new Date(payload.date).toLocaleDateString("en-US", {
      weekday: "short",
    });
    payload.entries.forEach((entry) => {
      if (!logs[entry.studentId]) return;
      logs[entry.studentId].push({
        id: `${payload.id}::${entry.studentId}`,
        date: payload.date,
        day,
        time: payload.time,
        className: payload.className,
        status: entry.status,
      });
    });
  });

  Object.values(logs).forEach((records) => {
    records.sort((a, b) => b.date.localeCompare(a.date));
  });

  return logs;
};

const AdminAttendance = ({ students = STUDENTS }: AdminAttendanceProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("All Classes");
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [activeStatusFilter, setActiveStatusFilter] = useState<AttendanceStatus | null>(
    null
  );
  const [activeSubjectFilter, setActiveSubjectFilter] = useState<string>("All Subjects");
  const [teacherSubmissions, setTeacherSubmissions] = useState<
    TeacherAttendancePayload[]
  >([]);

  const attendanceLogs = useMemo(
    () => buildLogsFromSubmissions(students, teacherSubmissions),
    [students, teacherSubmissions]
  );

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const classOptions = useMemo(() => {
    const set = new Set(students.map((student) => student.grade));
    teacherSubmissions.forEach((entry) => set.add(entry.className));
    return ["All Classes", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [students, teacherSubmissions]);

  const classSummary = useMemo(() => {
    const map = new Map<string, { submissions: number; entries: number; lastDate?: string }>();
    teacherSubmissions.forEach((payload) => {
      const current = map.get(payload.className) || { submissions: 0, entries: 0 };
      current.submissions += 1;
      current.entries += payload.entries.length;
      if (!current.lastDate || payload.date > current.lastDate) {
        current.lastDate = payload.date;
      }
      map.set(payload.className, current);
    });
    return Array.from(map.entries()).map(([className, info]) => ({
      className,
      ...info,
    }));
  }, [teacherSubmissions]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const classMatch = selectedClass === "All Classes" || student.grade === selectedClass;
      if (!classMatch) return false;
      if (!normalizedQuery) return true;
      const nameMatch = student.name.toLowerCase().includes(normalizedQuery);
      const idMatch = `${student.id}`.includes(normalizedQuery);
      return nameMatch || idMatch;
    });
  }, [normalizedQuery, selectedClass, students]);

  useEffect(() => {
    const readSubmissions = () => {
      const raw = localStorage.getItem("teacher-attendance");
      if (!raw) {
        setTeacherSubmissions([]);
        return;
      }
      try {
        const parsed = JSON.parse(raw) as TeacherAttendancePayload[];
        setTeacherSubmissions(Array.isArray(parsed) ? parsed : []);
      } catch {
        setTeacherSubmissions([]);
      }
    };

    readSubmissions();
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "teacher-attendance") {
        readSubmissions();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    if (selectedStudentId && !students.some((student) => student.id === selectedStudentId)) {
      setSelectedStudentId(null);
    }
  }, [selectedStudentId, students]);

  const selectedStudent = students.find((student) => student.id === selectedStudentId) ?? null;
  const selectedLog = useMemo(() => {
    if (!selectedStudent) return [];
    return attendanceLogs[selectedStudent.id] ?? [];
  }, [attendanceLogs, selectedStudent]);
  const subjectOptions = useMemo(() => {
    if (!selectedStudent) return ["All Subjects"];
    const courseSet = new Set<string>();
    selectedLog.forEach((record) => courseSet.add(record.className));
    return ["All Subjects", ...Array.from(courseSet).sort((a, b) => a.localeCompare(b))];
  }, [selectedLog, selectedStudent]);

  const subjectFilteredLog = useMemo(() => {
    if (!selectedStudent) return [];
    if (activeSubjectFilter === "All Subjects") return selectedLog;
    return selectedLog.filter((record) => record.className === activeSubjectFilter);
  }, [activeSubjectFilter, selectedLog, selectedStudent]);

  const statusCounts = useMemo(() => {
    return subjectFilteredLog.reduce(
      (acc, record) => {
        acc[record.status] += 1;
        return acc;
      },
      { Present: 0, Absent: 0, Late: 0, Leave: 0 } as Record<AttendanceStatus, number>
    );
  }, [subjectFilteredLog]);

  const visibleRecords = useMemo(() => {
    if (!activeStatusFilter) return subjectFilteredLog;
    return subjectFilteredLog.filter((record) => record.status === activeStatusFilter);
  }, [activeStatusFilter, subjectFilteredLog]);

  const updateRecordStatus = (recordId: string, status: AttendanceStatus) => {
    if (!selectedStudent) return;
    const [payloadId, studentIdRaw] = recordId.split("::");
    if (!payloadId || !studentIdRaw) return;
    const studentId = Number(studentIdRaw);
    if (!Number.isFinite(studentId)) return;

    const raw = localStorage.getItem("teacher-attendance");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as TeacherAttendancePayload[];
      const updated = parsed.map((payload) => {
        if (payload.id !== payloadId) return payload;
        return {
          ...payload,
          entries: payload.entries.map((entry) =>
            entry.studentId === studentId ? { ...entry, status } : entry
          ),
        };
      });
      localStorage.setItem("teacher-attendance", JSON.stringify(updated));
      setTeacherSubmissions(updated);
    } catch {
      return;
    }
  };

  return (
    <div>
      {teacherSubmissions.length === 0 && (
        <div className="mb-4 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          No attendance submissions yet. Ask teachers to submit attendance to see
          records here.
        </div>
      )}

      {classSummary.length > 0 && (
        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {classSummary.map((entry) => (
            <button
              key={entry.className}
              type="button"
              onClick={() => setSelectedClass(entry.className)}
              className="rounded-xl border border-border bg-card p-4 text-left hover:border-primary/40"
            >
              <p className="text-xs text-muted-foreground">Class</p>
              <p className="text-lg font-semibold text-foreground">{entry.className}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Submissions: {entry.submissions} · Students: {entry.entries}
              </p>
              {entry.lastDate && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last submitted: {entry.lastDate}
                </p>
              )}
            </button>
          ))}
        </div>
      )}

      <AttendanceFilters
        selectedClass={selectedClass}
        onSelectClass={setSelectedClass}
        classOptions={classOptions}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        filteredCount={filteredStudents.length}
        totalCount={students.length}
      />

      <StudentList
        students={filteredStudents}
        onSelectStudent={(student) => {
          setSelectedStudentId(student.id);
          setActiveStatusFilter(null);
          setActiveSubjectFilter("All Subjects");
        }}
      />

      {selectedStudent && (
        <AttendanceDetails
          selectedStudent={selectedStudent}
          subjectOptions={subjectOptions}
          activeSubjectFilter={activeSubjectFilter}
          onSubjectFilterChange={setActiveSubjectFilter}
          statusCounts={statusCounts}
          activeStatusFilter={activeStatusFilter}
          onStatusFilterChange={setActiveStatusFilter}
          visibleRecords={visibleRecords}
          subjectFilteredTotal={subjectFilteredLog.length}
          onClose={() => setSelectedStudentId(null)}
          onUpdateRecordStatus={updateRecordStatus}
        />
      )}
    </div>
  );
};

export default AdminAttendance;
