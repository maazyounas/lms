import { useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  GraduationCap,
  Wallet,
  TrendingUp,
  Calendar,
  BookOpen,
} from "lucide-react";
import type { Student } from "@/data/mockData";
import type { AdminTeacherRecord } from "@/components/admin/teacher/types";
import type { FeeTransaction } from "@/components/admin/types";

interface Props {
  students: Student[];
  teachers: AdminTeacherRecord[];
  feeTransactions: FeeTransaction[];
}

const COLORS = ["hsl(var(--primary))", "#82ca9d", "#ffc658", "#ff8042", "#8884d8"];

const AdminReports = ({ students, teachers, feeTransactions }: Props) => {
  // Summary stats
  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalCollected = students.reduce((a, s) => a + s.fees.paid, 0);
  const totalPending = students.reduce((a, s) => a + s.fees.pending, 0);
  const totalFees = totalCollected + totalPending;
  const collectionRate = totalFees > 0 ? (totalCollected / totalFees) * 100 : 0;

  const totalAttendance = students.reduce(
    (acc, s) => {
      acc.present += s.attendance.present;
      acc.total += s.attendance.total;
      return acc;
    },
    { present: 0, total: 0 }
  );
  const avgAttendance =
    totalAttendance.total > 0
      ? (totalAttendance.present / totalAttendance.total) * 100
      : 0;

  // Monthly fee collection (line chart)
  const monthlyCollection = useMemo(() => {
    const map = new Map<string, number>();
    feeTransactions.forEach((tx) => {
      const month = tx.transactionDate.slice(0, 7); // YYYY-MM
      map.set(month, (map.get(month) || 0) + tx.amount);
    });
    return [...map.entries()]
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [feeTransactions]);

  // Pending dues by class (bar chart)
  const pendingDuesByClass = useMemo(() => {
    const map = new Map<string, { students: number; pending: number }>();
    students.forEach((student) => {
      const current = map.get(student.grade) || { students: 0, pending: 0 };
      current.students += 1;
      current.pending += student.fees.pending;
      map.set(student.grade, current);
    });
    return [...map.entries()]
      .map(([className, value]) => ({ className, ...value }))
      .sort((a, b) => b.pending - a.pending);
  }, [students]);

  // Teacher workload distribution (pie chart)
  const teacherWorkload = useMemo(() => {
    return teachers.map((teacher) => {
      // Count unique subjects overall
      const subjects = teacher.subject
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const subjectCount = subjects.length;

      // Count total class-subject assignments (if available)
      let classSubjectCount = 0;
      if (teacher.classSubjects) {
        classSubjectCount = Object.values(teacher.classSubjects).reduce(
          (sum, subs) => sum + subs.length,
          0
        );
      } else {
        // Fallback: assume each class teaches all subjects
        classSubjectCount = teacher.classes.length * subjectCount;
      }

      return {
        id: teacher.id,
        name: teacher.name,
        loadUnits: classSubjectCount || 1, // at least 1
      };
    });
  }, [teachers]);

  // Attendance trends by class (bar chart)
  const attendanceTrends = useMemo(() => {
    const map = new Map<string, { present: number; total: number }>();
    students.forEach((student) => {
      const current = map.get(student.grade) || { present: 0, total: 0 };
      current.present += student.attendance.present;
      current.total += student.attendance.total;
      map.set(student.grade, current);
    });
    return [...map.entries()]
      .map(([className, value]) => ({
        className,
        percentage: value.total > 0 ? (value.present / value.total) * 100 : 0,
        present: value.present,
        total: value.total,
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }, [students]);

  // Custom tooltip for charts
  type TooltipEntry = {
    name: string;
    value: number;
  };

  type TooltipProps = {
    active?: boolean;
    payload?: TooltipEntry[];
    label?: string;
  };

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3 text-sm">
          <p className="font-medium text-foreground">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-muted-foreground">
              {entry.name}: {entry.value.toLocaleString()}
              {entry.name === "Percentage" ? "%" : ""}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Analytics & Reports
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Comprehensive insights into fees, attendance, and teacher workload.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-card border border-border rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {totalStudents}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Teachers</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {totalTeachers}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <GraduationCap className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Collection Rate</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {collectionRate.toFixed(1)}%
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Wallet className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Attendance</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {avgAttendance.toFixed(1)}%
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Fee Collection */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              Monthly Fee Collection
            </h3>
          </div>
          {monthlyCollection.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No fee transactions recorded.
            </p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyCollection}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Pending Dues by Class */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              Pending Dues by Class
            </h3>
          </div>
          {pendingDuesByClass.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No pending dues.
            </p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pendingDuesByClass}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="className"
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="pending" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Teacher Workload Distribution */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              Teacher Workload Distribution
            </h3>
          </div>
          {teacherWorkload.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No teacher data.
            </p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={teacherWorkload}
                    dataKey="loadUnits"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => entry.name.split(" ")[0]}
                  >
                    {teacherWorkload.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Attendance Trends by Class */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              Attendance Trends by Class
            </h3>
          </div>
          {attendanceTrends.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No attendance data.
            </p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="className"
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    domain={[0, 100]}
                    unit="%"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="percentage"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Monthly Fee Collection Table */}
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Monthly Fee Collection (Detailed)</h3>
          </div>
          <div className="max-h-60 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-muted/30 sticky top-0">
                <tr>
                  <th className="px-6 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Collected
                  </th>
                </tr>
              </thead>
              <tbody>
                {monthlyCollection.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-6 py-4 text-sm text-muted-foreground text-center">
                      No data.
                    </td>
                  </tr>
                ) : (
                  monthlyCollection.map((row) => (
                    <tr key={row.month} className="border-b border-border last:border-0">
                      <td className="px-6 py-2 text-sm">{row.month}</td>
                      <td className="px-6 py-2 text-sm font-medium">
                        Rs. {row.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Dues Table */}
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Pending Dues by Class (Detailed)</h3>
          </div>
          <div className="max-h-60 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-muted/30 sticky top-0">
                <tr>
                  <th className="px-6 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Students
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Pending
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendingDuesByClass.map((row) => (
                  <tr key={row.className} className="border-b border-border last:border-0">
                    <td className="px-6 py-2 text-sm">{row.className}</td>
                    <td className="px-6 py-2 text-sm">{row.students}</td>
                    <td className="px-6 py-2 text-sm text-destructive font-medium">
                      Rs. {row.pending.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Teacher Workload Table */}
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Teacher Workload (Detailed)</h3>
          </div>
          <div className="max-h-60 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-muted/30 sticky top-0">
                <tr>
                  <th className="px-6 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Teacher
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Load Units
                  </th>
                </tr>
              </thead>
              <tbody>
                {teacherWorkload.map((row) => (
                  <tr key={row.id} className="border-b border-border last:border-0">
                    <td className="px-6 py-2 text-sm">{row.name}</td>
                    <td className="px-6 py-2 text-sm font-medium">{row.loadUnits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Attendance Trends Table */}
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Attendance Trends (Detailed)</h3>
          </div>
          <div className="max-h-60 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-muted/30 sticky top-0">
                <tr>
                  <th className="px-6 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Attendance %
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Present/Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {attendanceTrends.map((row) => (
                  <tr key={row.className} className="border-b border-border last:border-0">
                    <td className="px-6 py-2 text-sm">{row.className}</td>
                    <td className="px-6 py-2 text-sm font-medium">
                      {row.percentage.toFixed(1)}%
                    </td>
                    <td className="px-6 py-2 text-sm">
                      {row.present}/{row.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
