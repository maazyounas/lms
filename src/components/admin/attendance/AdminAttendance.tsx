import { useEffect, useMemo, useState } from "react";
import { CheckCircle, Clock, XCircle, CalendarX2 } from "lucide-react";
import { STUDENTS, type Student } from "@/data/mockData";

type AdminAttendanceProps = {
  students?: Student[];
};

type AttendanceStatus = "Present" | "Absent" | "Late" | "Leave";
type AttendanceRecord = {
  id: string;
  date: string;
  day: string;
  time: string;
  className: string;
  status: AttendanceStatus;
};

const statusConfig: Record<
  AttendanceStatus,
  { icon: typeof CheckCircle; color: string; bg: string; border: string }
> = {
  Present: {
    icon: CheckCircle,
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/30",
  },
  Absent: {
    icon: XCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/30",
  },
  Late: {
    icon: Clock,
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/30",
  },
  Leave: {
    icon: CalendarX2,
    color: "text-muted-foreground",
    bg: "bg-muted/40",
    border: "border-border",
  },
};

const timeSlots = [
  "8:00 AM",
  "8:50 AM",
  "9:40 AM",
  "10:45 AM",
  "11:35 AM",
  "12:20 PM",
];

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];

const buildAttendanceLog = (student: Student): AttendanceRecord[] => {
  const courses = new Set<string>();
  student.tests.forEach((test) => courses.add(test.subject));
  student.assignments.forEach((assignment) => courses.add(assignment.subject));
  const courseList = Array.from(courses);
  const fallbackCourse = student.grade;

  const total = student.attendance.total;
  const targetAbsent = student.attendance.absent;
  const targetLate = student.attendance.late;

  let absentCount = 0;
  let lateCount = 0;

  const startDate = new Date("2025-08-04");
  const records: AttendanceRecord[] = [];

  for (let i = 0; i < total; i += 1) {
    const classIndex = i % timeSlots.length;
    const dayIndex = i % weekDays.length;
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + Math.floor(i / 5) * 7 + dayIndex);

    let status: AttendanceStatus = "Present";
    if (
      absentCount < targetAbsent &&
      Math.random() < targetAbsent / total &&
      absentCount < targetAbsent
    ) {
      status = "Absent";
      absentCount += 1;
    } else if (
      lateCount < targetLate &&
      Math.random() < targetLate / total &&
      lateCount < targetLate
    ) {
      status = "Late";
      lateCount += 1;
    }

    const className =
      courseList.length > 0 ? courseList[i % courseList.length] : fallbackCourse;

    records.push({
      id: `${student.id}-${i}`,
      date: date.toISOString().split("T")[0],
      day: weekDays[dayIndex],
      time: timeSlots[classIndex],
      className,
      status,
    });
  }

  return records;
};

const AdminAttendance = ({ students = STUDENTS }: AdminAttendanceProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [activeStatusFilter, setActiveStatusFilter] = useState<AttendanceStatus | null>(
    null
  );
  const [activeSubjectFilter, setActiveSubjectFilter] = useState<string>("All Subjects");
  const [attendanceLogs, setAttendanceLogs] = useState<
    Record<number, AttendanceRecord[]>
  >(() => {
    const initial: Record<number, AttendanceRecord[]> = {};
    students.forEach((student) => {
      initial[student.id] = buildAttendanceLog(student);
    });
    return initial;
  });

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredStudents = useMemo(() => {
    if (!normalizedQuery) return students;
    return students.filter((student) => {
      const nameMatch = student.name.toLowerCase().includes(normalizedQuery);
      const idMatch = `${student.id}`.includes(normalizedQuery);
      return nameMatch || idMatch;
    });
  }, [normalizedQuery, students]);

  useEffect(() => {
    setAttendanceLogs((prev) => {
      const next = { ...prev };
      students.forEach((student) => {
        if (!next[student.id]) {
          next[student.id] = buildAttendanceLog(student);
        }
      });
      return next;
    });
  }, [students]);

  useEffect(() => {
    if (selectedStudentId && !students.some((student) => student.id === selectedStudentId)) {
      setSelectedStudentId(null);
    }
  }, [selectedStudentId, students]);

  const averageAttendance =
    students.length > 0
      ? students.reduce((acc, s) => acc + (s.attendance.present / s.attendance.total) * 100, 0) /
        students.length
      : 0;

  const getStudentCourses = (student: Student) => {
    const courseSet = new Set<string>();
    student.tests.forEach((test) => courseSet.add(test.subject));
    student.assignments.forEach((assignment) => courseSet.add(assignment.subject));
    return Array.from(courseSet).sort((a, b) => a.localeCompare(b));
  };

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
    setAttendanceLogs((prev) => {
      const current = prev[selectedStudent.id] ?? [];
      const next = current.map((record) =>
        record.id === recordId ? { ...record, status } : record
      );
      return { ...prev, [selectedStudent.id]: next };
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-5">Attendance Reports</h1>

      <div className="mb-5 flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Search Student
        </label>
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search by name or student ID"
          className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <p className="text-xs text-muted-foreground">
          Showing {filteredStudents.length} of {students.length} students.
        </p>
      </div>

      {filteredStudents.length === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
          No students match your search.
        </div>
      )}

      {filteredStudents.length > 0 && (
        <div className="mt-6 space-y-4">
          {filteredStudents.map((student) => {
            const courses = getStudentCourses(student);
            const pct =
              student.attendance.total > 0
                ? (student.attendance.present / student.attendance.total) * 100
                : 0;

            return (
              <div
                key={`course-attendance-${student.id}`}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{student.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ID {student.id} · Class {student.grade}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudentId(student.id);
                      setActiveStatusFilter(null);
                      setActiveSubjectFilter("All Subjects");
                    }}
                    className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-primary/60 hover:text-primary"
                  >
                    Manage Records
                  </button>
                  <p className="text-xs text-muted-foreground">
                    Overall attendance:{" "}
                    <span className="font-semibold text-foreground">{pct.toFixed(1)}%</span>
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {(courses.length > 0 ? courses : ["Overall"]).map((course) => (
                    <div
                      key={`${student.id}-${course}`}
                      className="rounded-lg border border-border/60 bg-background p-3"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {course}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-sm text-foreground">
                        <span>Present</span>
                        <span className="font-semibold">{student.attendance.present}</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-sm text-foreground">
                        <span>Absent</span>
                        <span className="font-semibold">{student.attendance.absent}</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-sm text-foreground">
                        <span>Late</span>
                        <span className="font-semibold">{student.attendance.late}</span>
                      </div>
                      <div className="mt-2 text-sm font-semibold text-foreground">
                        {pct.toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedStudent && (
        <div className="mt-8 rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-lg font-semibold text-foreground">
                {selectedStudent.name} Attendance Records
              </p>
              <p className="text-xs text-muted-foreground">
                ID {selectedStudent.id} · Class {selectedStudent.grade}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedStudentId(null)}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Close
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {subjectOptions.map((subject) => (
              <button
                key={subject}
                type="button"
                onClick={() => {
                  setActiveSubjectFilter(subject);
                  setActiveStatusFilter(null);
                }}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  activeSubjectFilter === subject
                    ? "border-primary/60 bg-primary/10 text-primary"
                    : "border-border bg-background text-foreground"
                }`}
              >
                {subject}
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(Object.keys(statusConfig) as AttendanceStatus[]).map((status) => {
              const cfg = statusConfig[status];
              const isActive = activeStatusFilter === status;
              const Icon = cfg.icon;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setActiveStatusFilter(status)}
                  className={`rounded-xl border bg-background p-4 text-left transition ${
                    isActive ? `${cfg.border} border-2` : "border-border"
                  }`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${cfg.bg}`}>
                    <Icon className={`h-5 w-5 ${cfg.color}`} />
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-foreground">
                    {statusCounts[status]}
                  </p>
                  <p className="text-xs text-muted-foreground">{status}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>
              Showing {visibleRecords.length} of {subjectFilteredLog.length} records
              {activeStatusFilter ? ` (${activeStatusFilter})` : ""}.
            </p>
            {activeStatusFilter && (
              <button
                type="button"
                onClick={() => setActiveStatusFilter(null)}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Clear filter
              </button>
            )}
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-card">
                  {["Date", "Day", "Time", "Class", "Status", "Change"].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleRecords.map((record) => {
                  const cfg = statusConfig[record.status];
                  return (
                    <tr
                      key={record.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30"
                    >
                      <td className="px-4 py-2 text-sm text-foreground">{record.date}</td>
                      <td className="px-4 py-2 text-sm text-muted-foreground">{record.day}</td>
                      <td className="px-4 py-2 text-sm text-muted-foreground">{record.time}</td>
                      <td className="px-4 py-2 text-sm text-foreground">{record.className}</td>
                      <td className="px-4 py-2 text-sm">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <select
                          value={record.status}
                          onChange={(event) =>
                            updateRecordStatus(
                              record.id,
                              event.target.value as AttendanceStatus
                            )
                          }
                          className="h-9 w-full rounded-lg border border-border bg-background px-2 text-xs text-foreground"
                        >
                          {(Object.keys(statusConfig) as AttendanceStatus[]).map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAttendance;
