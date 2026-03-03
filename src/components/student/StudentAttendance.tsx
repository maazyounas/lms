import { useState, useMemo } from "react";
import { CheckCircle, XCircle, Clock, ArrowLeft } from "lucide-react";
import type { Student } from "@/data/mockData";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
interface Props {
  student: Student;
}

type AttendanceStatus = "Present" | "Absent" | "Late";
interface DayRecord { date: string; day: string; status: AttendanceStatus }

// Generate mock day-by-day attendance
function generateAttendanceLog(att: Student["attendance"]): DayRecord[] {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const records: DayRecord[] = [];
  const startDate = new Date("2025-08-04");

  let present = 0, absent = 0, late = 0;
  for (let i = 0; i < att.total; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + Math.floor(i / 5) * 7 + (i % 5));
    let status: AttendanceStatus = "Present";
    if (absent < att.absent && Math.random() < att.absent / att.total && absent < att.absent) {
      status = "Absent"; absent++;
    } else if (late < att.late && Math.random() < att.late / att.total && late < att.late) {
      status = "Late"; late++;
    } else {
      present++;
    }
    records.push({
      date: d.toISOString().split("T")[0],
      day: days[i % 5],
      status,
    });
  }
  // Fix counts to match exactly
  let pCount = records.filter(r => r.status === "Present").length;
  let aCount = records.filter(r => r.status === "Absent").length;
  let lCount = records.filter(r => r.status === "Late").length;
  // Adjust if needed by swapping random records
  while (aCount < att.absent) {
    const idx = records.findIndex(r => r.status === "Present");
    if (idx >= 0) { records[idx].status = "Absent"; aCount++; pCount--; }
    else break;
  }
  while (lCount < att.late) {
    const idx = records.findIndex(r => r.status === "Present" && records.indexOf(r) > 10);
    if (idx >= 0) { records[idx].status = "Late"; lCount++; pCount--; }
    else break;
  }
  return records;
}

const statusConfig = {
  Present: { icon: CheckCircle, color: "text-success", bg: "bg-success/10", border: "border-success/30" },
  Absent: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30" },
  Late: { icon: Clock, color: "text-warning", bg: "bg-warning/10", border: "border-warning/30" },
};

const StudentAttendance = ({ student }: Props) => {
  const [filter, setFilter] = useState<AttendanceStatus | null>(null);
  const attPct = ((student.attendance.present / student.attendance.total) * 100).toFixed(0);

  const chartData = [
  { name: "Present", value: student.attendance.present },
  { name: "Absent", value: student.attendance.absent },
  { name: "Late", value: student.attendance.late },
];

const COLORS = {
  Present: "hsl(var(--success))",
  Absent: "hsl(var(--destructive))",
  Late: "hsl(var(--warning))",
};

  const log = useMemo(() => generateAttendanceLog(student.attendance), [student]);

  const filtered = filter ? log.filter((r) => r.status === filter) : null;

  const cards: { label: AttendanceStatus; value: number }[] = [
    { label: "Present", value: student.attendance.present },
    { label: "Absent", value: student.attendance.absent },
    { label: "Late", value: student.attendance.late },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
        {filter && (
          <button onClick={() => setFilter(null)} className="flex items-center gap-1 text-sm text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to overview
          </button>
        )}
      </div>
{/* Attendance Chart */}
<div className="bg-card border border-border rounded-xl p-6 mb-6">
  <h2 className="text-lg font-semibold text-foreground mb-4 text-center">
    Attendance Distribution
  </h2>

  <div className="h-72">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          outerRadius={100}
          innerRadius={60}
          paddingAngle={4}
        >
          {chartData.map((entry) => (
            <Cell
              key={entry.name}
              fill={COLORS[entry.name as keyof typeof COLORS]}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  </div>
</div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {cards.map((item) => {
          const cfg = statusConfig[item.label];
          return (
            <button
              key={item.label}
              onClick={() => setFilter(item.label)}
              className={`bg-card border rounded-xl p-6 text-center transition-all hover:scale-[1.02] cursor-pointer ${
                filter === item.label ? `${cfg.border} border-2` : "border-border"
              }`}
            >
              <div className={`h-12 w-12 rounded-full ${cfg.bg} flex items-center justify-center mx-auto mb-3`}>
                <cfg.icon className={`h-6 w-6 ${cfg.color}`} />
              </div>
              <p className="text-3xl font-bold text-foreground">{item.value}</p>
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground mt-1">out of {student.attendance.total} days</p>
            </button>
          );
        })}
      </div>

      {/* Overall rate */}
      <div className="bg-card border border-border rounded-xl p-6 text-center mb-6">
        <p className="text-sm text-muted-foreground">Overall Attendance Rate</p>
        <p className="text-4xl font-bold text-primary mt-2">{attPct}%</p>
      </div>

      {/* Detailed Day Log */}
      {filtered && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <h3 className="font-semibold text-foreground">
              {filter} Days ({filtered.length} records)
            </h3>
          </div>
          <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border sticky top-0 bg-card">
                  {["#", "Date", "Day", "Status"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => {
                  const cfg = statusConfig[r.status];
                  return (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-2.5 text-sm text-muted-foreground">{i + 1}</td>
                      <td className="px-5 py-2.5 text-sm text-foreground">{r.date}</td>
                      <td className="px-5 py-2.5 text-sm text-muted-foreground">{r.day}</td>
                      <td className="px-5 py-2.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>{r.status}</span>
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

export default StudentAttendance;
