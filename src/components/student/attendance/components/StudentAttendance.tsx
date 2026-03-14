import { useState, useMemo } from "react";
import { CheckCircle, XCircle, Clock, Calendar, BookOpen } from "lucide-react";
import type { Student } from "@/data/mockData";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface Props {
  student: Student;
}

type AttendanceStatus = "Present" | "Absent" | "Late" | "Leave";
interface DayRecord {
  date: string;
  day: string;
  status: AttendanceStatus;
  subject: string; // Added subject field
}

// Generate mock day-by-day attendance with subjects
function generateAttendanceLog(
  att: Student["attendance"],
  subjects: string[],
): DayRecord[] {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const records: DayRecord[] = [];
  const startDate = new Date("2025-08-04");

  let present = 0,
    absent = 0,
    late = 0;
  for (let i = 0; i < att.total; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + Math.floor(i / 5) * 7 + (i % 5));
    let status: AttendanceStatus = "Present";
    if (
      absent < att.absent &&
      Math.random() < att.absent / att.total &&
      absent < att.absent
    ) {
      status = "Absent";
      absent++;
    } else if (
      late < att.late &&
      Math.random() < att.late / att.total &&
      late < att.late
    ) {
      status = "Late";
      late++;
    } else {
      present++;
    }
    // Assign a random subject from the list
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    records.push({
      date: d.toISOString().split("T")[0],
      day: days[i % 5],
      status,
      subject,
    });
  }
  // Adjust counts to match input (simplified)
  let pCount = records.filter((r) => r.status === "Present").length;
  let aCount = records.filter((r) => r.status === "Absent").length;
  let lCount = records.filter((r) => r.status === "Late").length;
  while (aCount < att.absent) {
    const idx = records.findIndex((r) => r.status === "Present");
    if (idx >= 0) {
      records[idx].status = "Absent";
      aCount++;
      pCount--;
    } else break;
  }
  while (lCount < att.late) {
    const idx = records.findIndex(
      (r) => r.status === "Present" && records.indexOf(r) > 10,
    );
    if (idx >= 0) {
      records[idx].status = "Late";
      lCount++;
      pCount--;
    } else break;
  }
  return records;
}

const statusConfig = {
  Present: {
    icon: CheckCircle,
    color: "text-success",
    bg: "bg-success/15",
    border: "border-success/30",
    lightBg: "bg-success/5",
  },
  Absent: {
    icon: XCircle,
    color: "text-destructive",
    bg: "bg-destructive/15",
    border: "border-destructive/30",
    lightBg: "bg-destructive/5",
  },
  Late: {
    icon: Clock,
    color: "text-warning",
    bg: "bg-warning/15",
    border: "border-warning/30",
    lightBg: "bg-warning/5",
  },
  Leave: {
    icon: Calendar, // You can replace with a better icon
    color: "text-info",
    bg: "bg-info/15",
    border: "border-info/30",
    lightBg: "bg-info/5",
  },
};

const COLORS = {
  Present: "hsl(var(--success))",
  Absent: "hsl(var(--destructive))",
  Late: "hsl(var(--warning))",
  Leave: "hsl(var(--info))",
};

const StudentAttendance = ({ student }: Props) => {
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | null>(
    null,
  );
  const [courseFilter, setCourseFilter] = useState<string | null>(null);

  // Extract unique subjects from tests
  const subjects = useMemo(
    () => Array.from(new Set(student.tests.map((t) => t.subject))),
    [student],
  );

  const attPct = (
    (student.attendance.present / student.attendance.total) *
    100
  ).toFixed(0);

  const chartData = [
    { name: "Present", value: student.attendance.present },
    { name: "Absent", value: student.attendance.absent },
    { name: "Late", value: student.attendance.late },
    { name: "Leave", value: 0 }, // Placeholder for leaves
  ];

  const log = useMemo(
    () => generateAttendanceLog(student.attendance, subjects),
    [student, subjects],
  );

  // Apply filters
  const filteredLog = useMemo(() => {
    let filtered = log;
    if (statusFilter) {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }
    if (courseFilter) {
      filtered = filtered.filter((r) => r.subject === courseFilter);
    }
    return filtered;
  }, [log, statusFilter, courseFilter]);

  const cards: { label: AttendanceStatus; value: number }[] = [
    { label: "Present", value: student.attendance.present },
    { label: "Absent", value: student.attendance.absent },
    { label: "Late", value: student.attendance.late },
    { label: "Leave", value: 0 }, // Placeholder
  ];

  return (
    <div>
      {/* Header with filter reset */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
        {(statusFilter || courseFilter) && (
          <button
            onClick={() => {
              setStatusFilter(null);
              setCourseFilter(null);
            }}
            className="flex items-center gap-1 text-sm text-primary hover:underline transition"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Attendance Chart with integrated rate */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Attendance Distribution
        </h2>
        <div className="h-72 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                innerRadius={60}
                paddingAngle={4}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[entry.name as keyof typeof COLORS]}
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  color: "hsl(var(--foreground))",
                }}
                labelStyle={{
                  color: "hsl(var(--foreground))",
                }}
                itemStyle={{
                  color: "hsl(var(--foreground))",
                }}
                formatter={(value, name) => [`${value} days`, name]}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                formatter={(value) => (
                  <span className="text-sm text-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Overall rate centered inside donut */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <p className="text-3xl font-bold text-primary">{attPct}%</p>
            <p className="text-xs text-muted-foreground">Overall</p>
          </div>
        </div>
      </div>

      {/* Summary Cards (Present, Absent, Late, Leave) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {cards.map((item) => {
          const cfg = statusConfig[item.label];
          const isActive = statusFilter === item.label;
          return (
            <button
              key={item.label}
              onClick={() => setStatusFilter(isActive ? null : item.label)}
              className={`group relative bg-card border rounded-xl p-6 text-center transition-all duration-200 hover:scale-[1.02] hover:shadow-md ${
                isActive
                  ? `${cfg.border} border-2 shadow-lg`
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div
                className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity ${cfg.lightBg}`}
                aria-hidden="true"
              />
              <div className="relative">
                <div
                  className={`h-14 w-14 rounded-full ${cfg.bg} flex items-center justify-center mx-auto mb-3 transition-transform group-hover:scale-110`}
                >
                  <cfg.icon className={`h-7 w-7 ${cfg.color}`} />
                </div>
                <p className="text-3xl font-bold text-foreground">
                  {item.value}
                </p>
                <p className="text-sm font-medium text-muted-foreground">
                  {item.label}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  out of {student.attendance.total} days
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Course Filter Bar */}
      {subjects.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            Filter by Course
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCourseFilter(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                courseFilter === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              All Courses
            </button>
            {subjects.map((subject) => (
              <button
                key={subject}
                onClick={() => setCourseFilter(subject)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  courseFilter === subject
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Day Log */}
      {filteredLog.length > 0 ? (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              {statusFilter && (
                <span
                  className={`h-3 w-3 rounded-full ${
                    statusFilter === "Present"
                      ? "bg-success"
                      : statusFilter === "Absent"
                        ? "bg-destructive"
                        : statusFilter === "Late"
                          ? "bg-warning"
                          : "bg-info"
                  }`}
                />
              )}
              {statusFilter ? `${statusFilter} Days` : "All Days"}
              {courseFilter && ` – ${courseFilter}`}
              <span className="text-xs text-muted-foreground font-normal">
                ({filteredLog.length} records)
              </span>
            </h3>
            <span className="text-xs text-muted-foreground">
              Sorted by date
            </span>
          </div>
          <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
            <table className="w-full">
              <thead className="sticky top-0 bg-card z-10">
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">
                    #
                  </th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">
                    Date
                  </th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">
                    Day
                  </th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">
                    Course
                  </th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLog.map((r, i) => {
                  const cfg = statusConfig[r.status];
                  return (
                    <tr
                      key={i}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-5 py-3 text-sm text-muted-foreground">
                        {i + 1}
                      </td>
                      <td className="px-5 py-3 text-sm text-foreground font-medium">
                        {new Date(r.date).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">
                        {r.day}
                      </td>
                      <td className="px-5 py-3 text-sm text-foreground">
                        <span className="px-2 py-1 rounded-full bg-muted/50 text-xs">
                          {r.subject}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-muted-foreground">
            No attendance records match the selected filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentAttendance;
