import { STUDENTS, TEACHER_ASSIGNMENTS } from "@/data/mockData";

const AdminReports = () => {
  const totalCollected = STUDENTS.reduce((a, s) => a + s.fees.paid, 0);
  const totalPending = STUDENTS.reduce((a, s) => a + s.fees.pending, 0);
  const studentsWithDues = STUDENTS.filter((s) => s.fees.pending > 0);

  const assignmentStats = TEACHER_ASSIGNMENTS.map((a) => {
    const submitted = a.submissions.filter(
      (s) => s.status === "Submitted" || s.status === "Late"
    ).length;
    const missing = a.submissions.filter((s) => s.status === "Missing").length;
    return { id: a.id, title: a.title, classGrade: a.classGrade, submitted, missing };
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-5">Reports</h1>

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
          <p className="text-xs text-muted-foreground">Students With Dues</p>
          <p className="text-2xl font-bold text-foreground">{studentsWithDues.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="p-4 font-semibold text-foreground">Fee Dues</div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Student", "Class", "Pending"].map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-xs text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {studentsWithDues.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-2 text-sm">{s.name}</td>
                  <td className="px-4 py-2 text-sm">{s.grade}</td>
                  <td className="px-4 py-2 text-sm text-destructive">
                    Rs. {s.fees.pending.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="p-4 font-semibold text-foreground">Assignment Submissions</div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Assignment", "Class", "Submitted", "Missing"].map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-xs text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assignmentStats.map((a) => (
                <tr key={a.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-2 text-sm">{a.title}</td>
                  <td className="px-4 py-2 text-sm">{a.classGrade}</td>
                  <td className="px-4 py-2 text-sm text-success">{a.submitted}</td>
                  <td className="px-4 py-2 text-sm text-destructive">{a.missing}</td>
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
