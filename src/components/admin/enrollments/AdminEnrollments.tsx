import { useMemo } from "react";
import { STUDENTS } from "@/data/mockData";

const AdminEnrollments = () => {
  const byClass = useMemo(() => {
    const map = new Map<string, number>();
    STUDENTS.forEach((s) => map.set(s.grade, (map.get(s.grade) || 0) + 1));
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-5">Enrollments</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Enrolled</p>
          <p className="text-2xl font-bold text-foreground">{STUDENTS.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Active Students</p>
          <p className="text-2xl font-bold text-foreground">
            {STUDENTS.filter((s) => s.status === "Active").length}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Classes</p>
          <p className="text-2xl font-bold text-foreground">{byClass.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-semibold text-foreground mb-3">Enrollment by Class</h3>
          <div className="space-y-2">
            {byClass.map(([grade, count]) => (
              <div key={grade} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{grade}</span>
                <span className="font-semibold text-foreground">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-semibold text-foreground mb-3">Recent Enrollments</h3>
          <div className="space-y-2">
            {[...STUDENTS]
              .sort((a, b) => b.enrollDate.localeCompare(a.enrollDate))
              .slice(0, 8)
              .map((s) => (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{s.name}</span>
                  <span className="text-muted-foreground">{s.enrollDate}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEnrollments;
