import { useMemo } from "react";
import type { Student } from "@/data/mockData";
import type { AdminTeacherRecord } from "@/components/admin/teacher/types";
import type { FeeTransaction } from "@/components/admin/types";

interface Props {
  students: Student[];
  teachers: AdminTeacherRecord[];
  feeTransactions: FeeTransaction[];
}

const AdminReports = ({ students, teachers, feeTransactions }: Props) => {
  const totalCollected = students.reduce((a, s) => a + s.fees.paid, 0);
  const totalPending = students.reduce((a, s) => a + s.fees.pending, 0);

  const monthlyCollection = useMemo(() => {
    const map = new Map<string, number>();
    feeTransactions.forEach((tx) => {
      const month = tx.transactionDate.slice(0, 7);
      map.set(month, (map.get(month) || 0) + tx.amount);
    });
    return [...map.entries()]
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [feeTransactions]);

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

  const teacherWorkload = useMemo(
    () =>
      teachers.map((teacher) => {
        const subjectSet = new Set(
          teacher.subject
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        );
        const classSubjectCount = Object.values(teacher.classSubjects || {}).reduce(
          (sum, subjects) => sum + subjects.length,
          0
        );
        return {
          id: teacher.id,
          name: teacher.name,
          classes: teacher.classes.length,
          subjects: subjectSet.size,
          loadUnits: classSubjectCount || teacher.classes.length * Math.max(subjectSet.size, 1),
        };
      }),
    [teachers]
  );

  const attendanceTrends = useMemo(() => {
    const map = new Map<string, { present: number; total: number }>();
    students.forEach((student) => {
      const current = map.get(student.grade) || { present: 0, total: 0 };
      current.present += student.attendance.present;
      current.total += student.attendance.total;
      map.set(student.grade, current);
    });
    return [...map.entries()].map(([className, value]) => ({
      className,
      pct: value.total > 0 ? (value.present / value.total) * 100 : 0,
      present: value.present,
      total: value.total,
    }));
  }, [students]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-5">Advanced Reports</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Collected</p>
          <p className="text-2xl font-bold text-foreground">Rs. {totalCollected.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Pending</p>
          <p className="text-2xl font-bold text-foreground">Rs. {totalPending.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Monthly Transactions</p>
          <p className="text-2xl font-bold text-foreground">{feeTransactions.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="p-4 font-semibold text-foreground">Monthly Fee Collection</div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Month", "Collected"].map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-xs text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthlyCollection.length === 0 && (
                <tr>
                  <td className="px-4 py-3 text-sm text-muted-foreground" colSpan={2}>
                    No fee transactions recorded yet.
                  </td>
                </tr>
              )}
              {monthlyCollection.map((row) => (
                <tr key={row.month} className="border-b border-border last:border-0">
                  <td className="px-4 py-2 text-sm">{row.month}</td>
                  <td className="px-4 py-2 text-sm font-semibold">Rs. {row.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="p-4 font-semibold text-foreground">Pending Dues By Class</div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Class", "Students", "Pending"].map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-xs text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pendingDuesByClass.map((row) => (
                <tr key={row.className} className="border-b border-border last:border-0">
                  <td className="px-4 py-2 text-sm">{row.className}</td>
                  <td className="px-4 py-2 text-sm">{row.students}</td>
                  <td className="px-4 py-2 text-sm text-destructive">
                    Rs. {row.pending.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="p-4 font-semibold text-foreground">Teacher Workload Report</div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Teacher", "Classes", "Subjects", "Load Units"].map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-xs text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teacherWorkload.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-2 text-sm">{row.name}</td>
                  <td className="px-4 py-2 text-sm">{row.classes}</td>
                  <td className="px-4 py-2 text-sm">{row.subjects}</td>
                  <td className="px-4 py-2 text-sm font-semibold">{row.loadUnits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="p-4 font-semibold text-foreground">Attendance Trends By Class</div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Class", "Attendance", "Present/Total"].map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-xs text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attendanceTrends.map((row) => (
                <tr key={row.className} className="border-b border-border last:border-0">
                  <td className="px-4 py-2 text-sm">{row.className}</td>
                  <td className="px-4 py-2 text-sm">{row.pct.toFixed(1)}%</td>
                  <td className="px-4 py-2 text-sm">
                    {row.present}/{row.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
