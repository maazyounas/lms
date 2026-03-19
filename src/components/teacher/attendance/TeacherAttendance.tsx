import { useMemo, useState } from "react";
import { CheckCircle2, Clock, XCircle, CalendarCheck } from "lucide-react";
import { toast } from "sonner";
import type { Student } from "@/data/mockData";

type AttendanceStatus = "Present" | "Absent" | "Late" | "Leave";

type AttendanceEntry = {
  studentId: number;
  status: AttendanceStatus;
};

type Props = {
  students: Student[];
  teacherName: string;
  teacherClasses: string[];
};

const statusStyles: Record<AttendanceStatus, string> = {
  Present: "border-success/40 bg-success/10 text-success",
  Absent: "border-destructive/40 bg-destructive/10 text-destructive",
  Late: "border-warning/40 bg-warning/10 text-warning",
  Leave: "border-muted-foreground/40 bg-muted/10 text-muted-foreground",
};

const TeacherAttendance = ({ students, teacherName, teacherClasses }: Props) => {
  const [selectedClass, setSelectedClass] = useState(
    teacherClasses[0] || "All Classes"
  );
  const [attendanceDate, setAttendanceDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [attendanceTime, setAttendanceTime] = useState("");
  const [classType, setClassType] = useState<"Regular" | "Online" | "Extra Class">(
    "Regular"
  );
  const [roomOrMode, setRoomOrMode] = useState("");
  const [attendanceMap, setAttendanceMap] = useState<Record<number, AttendanceStatus>>(
    {}
  );

  const classOptions = useMemo(() => {
    const set = new Set(teacherClasses);
    return set.size > 0 ? Array.from(set) : ["All Classes"];
  }, [teacherClasses]);

  const filteredStudents = useMemo(() => {
    if (selectedClass === "All Classes") return students;
    return students.filter((student) => student.grade === selectedClass);
  }, [students, selectedClass]);

  const setStatus = (studentId: number, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const bulkSet = (status: AttendanceStatus) => {
    const next: Record<number, AttendanceStatus> = { ...attendanceMap };
    filteredStudents.forEach((student) => {
      next[student.id] = status;
    });
    setAttendanceMap(next);
  };

  const counts = useMemo(() => {
    return filteredStudents.reduce(
      (acc, student) => {
        const status = attendanceMap[student.id];
        if (status) acc[status] += 1;
        return acc;
      },
      { Present: 0, Absent: 0, Late: 0, Leave: 0 } as Record<AttendanceStatus, number>
    );
  }, [attendanceMap, filteredStudents]);

  const handleSubmit = () => {
    if (filteredStudents.length === 0) {
      toast.error("No students in this class.");
      return;
    }
    if (!selectedClass || selectedClass === "All Classes") {
      toast.error("Select a class before submitting.");
      return;
    }
    if (!attendanceDate) {
      toast.error("Select an attendance date.");
      return;
    }
    if (!attendanceTime) {
      toast.error("Select an attendance time.");
      return;
    }
    const missing = filteredStudents.filter((s) => !attendanceMap[s.id]);
    if (missing.length > 0) {
      toast.error("Mark attendance for all students before submitting.");
      return;
    }

    const entries: AttendanceEntry[] = filteredStudents.map((student) => ({
      studentId: student.id,
      status: attendanceMap[student.id],
    }));

    const payload = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      className: selectedClass,
      teacherName,
      date: attendanceDate,
      time: attendanceTime,
      classType,
      roomOrMode: roomOrMode.trim() || undefined,
      entries,
    };

    const storageKey = "teacher-attendance";
    const raw = localStorage.getItem(storageKey);
    const existing = raw ? (JSON.parse(raw) as unknown[]) : [];
    localStorage.setItem(storageKey, JSON.stringify([payload, ...existing]));

    toast.success("Attendance submitted.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Mark attendance by class and submit to the admin.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
        >
          {classOptions.map((cls) => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={attendanceDate}
          onChange={(e) => setAttendanceDate(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
        />

        <input
          type="time"
          value={attendanceTime}
          onChange={(e) => setAttendanceTime(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
        />

        <select
          value={classType}
          onChange={(e) =>
            setClassType(e.target.value as "Regular" | "Online" | "Extra Class")
          }
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
        >
          <option value="Regular">Regular Class</option>
          <option value="Online">Online</option>
          <option value="Extra Class">Extra Class</option>
        </select>

        <input
          value={roomOrMode}
          onChange={(e) => setRoomOrMode(e.target.value)}
          placeholder={
            classType === "Online"
              ? "Online / Zoom link"
              : classType === "Extra Class"
              ? "Extra class details"
              : "Room number"
          }
          className="min-w-[180px] rounded-lg border border-border bg-card px-3 py-2 text-sm"
        />

        <div className="flex flex-wrap gap-2">
          {(["Present", "Absent", "Late", "Leave"] as AttendanceStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => bulkSet(status)}
              className={`rounded-lg border px-3 py-2 text-xs ${statusStyles[status]}`}
            >
              Mark All {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <CalendarCheck className="h-4 w-4" /> Total
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{filteredStudents.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-success text-sm">
            <CheckCircle2 className="h-4 w-4" /> Present
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{counts.Present}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-warning text-sm">
            <Clock className="h-4 w-4" /> Late
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{counts.Late}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-destructive text-sm">
            <XCircle className="h-4 w-4" /> Absent/Leave
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">
            {counts.Absent + counts.Leave}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {["Student", "ID", "Status"].map((head) => (
                <th
                  key={head}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-6 text-sm text-muted-foreground text-center"
                >
                  No students in this class.
                </td>
              </tr>
            )}
            {filteredStudents.map((student) => {
              const current = attendanceMap[student.id];
              return (
                <tr key={student.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-sm">
                    <p className="font-medium text-foreground">{student.name}</p>
                    <p className="text-xs text-muted-foreground">{student.guardian}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    STU-{String(student.id).padStart(4, "0")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {(["Present", "Absent", "Late", "Leave"] as AttendanceStatus[]).map(
                        (status) => (
                          <button
                            key={status}
                            onClick={() => setStatus(student.id, status)}
                            className={`rounded-full border px-3 py-1 text-xs ${
                              current === status
                                ? statusStyles[status]
                                : "border-border text-muted-foreground"
                            }`}
                          >
                            {status}
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Submit Attendance
        </button>
      </div>
    </div>
  );
};

export default TeacherAttendance;
