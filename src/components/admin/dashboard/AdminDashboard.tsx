import { STUDENTS, TEACHERS, type Announcement, type Student } from "@/data/mockData";

interface Props {
  announcements: Announcement[];
  pendingLeaves: number;
  onOpenStudent: (student: Student) => void;
}

const AdminDashboard = ({ announcements, pendingLeaves, onOpenStudent }: Props) => {
  const topStudents = [...STUDENTS]
    .sort((a, b) => (b.progress.at(-1)?.gpa || 0) - (a.progress.at(-1)?.gpa || 0))
    .slice(0, 5);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Students</p>
          <p className="text-2xl font-bold text-foreground">{STUDENTS.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Teachers</p>
          <p className="text-2xl font-bold text-foreground">{TEACHERS.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Pending Leaves</p>
          <p className="text-2xl font-bold text-foreground">{pendingLeaves}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Students With Dues</p>
          <p className="text-2xl font-bold text-foreground">
            {STUDENTS.filter((s) => s.fees.pending > 0).length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-semibold mb-3">Top Performers</h3>
          {topStudents.map((s) => (
            <button
              key={s.id}
              onClick={() => onOpenStudent(s)}
              className="w-full text-left flex items-center justify-between p-2 rounded hover:bg-muted/30"
            >
              <span className="text-sm text-foreground">{s.name}</span>
              <span className="text-sm font-bold text-primary">
                {s.progress.at(-1)?.gpa.toFixed(2)}
              </span>
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-semibold mb-3">Recent Announcements</h3>
          {announcements.slice(0, 5).map((a) => (
            <div key={a.id} className="p-2 border-b border-border last:border-0">
              <p className="text-sm font-medium text-foreground">{a.title}</p>
              <p className="text-xs text-muted-foreground">{a.date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
