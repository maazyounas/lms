import { STUDENTS } from "@/data/mockData";

const AdminAttendance = () => {
  const averageAttendance =
    STUDENTS.length > 0
      ? STUDENTS.reduce((acc, s) => acc + (s.attendance.present / s.attendance.total) * 100, 0) /
        STUDENTS.length
      : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-5">Attendance Reports</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Overall Attendance</p>
          <p className="text-2xl font-bold text-foreground">{averageAttendance.toFixed(1)}%</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Below 75%</p>
          <p className="text-2xl font-bold text-foreground">
            {
              STUDENTS.filter(
                (s) => (s.attendance.present / s.attendance.total) * 100 < 75
              ).length
            }
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["Student", "Class", "Present", "Absent", "Late", "Percent"].map((h) => (
                <th key={h} className="px-4 py-2 text-left text-xs text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {STUDENTS.map((s) => {
              const pct = (s.attendance.present / s.attendance.total) * 100;
              return (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-2 text-sm">{s.name}</td>
                  <td className="px-4 py-2 text-sm">{s.grade}</td>
                  <td className="px-4 py-2 text-sm">{s.attendance.present}</td>
                  <td className="px-4 py-2 text-sm">{s.attendance.absent}</td>
                  <td className="px-4 py-2 text-sm">{s.attendance.late}</td>
                  <td className="px-4 py-2 text-sm font-semibold">
                    <span className={pct >= 85 ? "text-success" : pct >= 75 ? "text-warning" : "text-destructive"}>
                      {pct.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAttendance;
