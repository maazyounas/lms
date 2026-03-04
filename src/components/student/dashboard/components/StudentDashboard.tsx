import { TrendingUp, FileText, UserCheck, ClipboardList } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { Student } from "@/data/mockData";
import { ANNOUNCEMENTS } from "@/data/mockData";

interface Props {
  student: Student;
  onNavigate: (nav: string) => void;
}

const StudentDashboard = ({ student, onNavigate }: Props) => {
  const attPct = ((student.attendance.present / student.attendance.total) * 100).toFixed(0);
  const avgMarks = (student.tests.reduce((a, t) => a + (t.marks / t.total) * 100, 0) / student.tests.length).toFixed(1);
  const pendingAssignments = student.assignments.filter((a) => a.status === "Pending").length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Welcome, {student.name.split(" ")[0]}! 👋</h1>
        <p className="text-muted-foreground text-sm">Here's your academic overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Current GPA", value: student.progress.at(-1)!.gpa.toFixed(2), icon: TrendingUp, color: "text-success bg-success/10", nav: "grades" },
          { label: "Avg Marks", value: `${avgMarks}%`, icon: FileText, color: "text-info bg-info/10", nav: "grades" },
          { label: "Attendance", value: `${attPct}%`, icon: UserCheck, color: "text-accent bg-accent/10", nav: "attendance" },
          { label: "Pending Work", value: pendingAssignments, icon: ClipboardList, color: "text-warning bg-warning/10", nav: "assignments" },
        ].map((stat) => (
          <button
            key={stat.label}
            onClick={() => onNavigate(stat.nav)}
            className="bg-card border border-border rounded-xl p-5 text-left hover:border-primary/30 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <div className={`h-10 w-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">GPA Trend</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={student.progress}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(215 20% 55%)" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 4]} hide />
              <Tooltip contentStyle={{ background: "hsl(222 30% 11%)", border: "1px solid hsl(222 15% 20%)", borderRadius: 8, color: "hsl(210 40% 96%)" }} />
              <Line type="monotone" dataKey="gpa" stroke="hsl(160 84% 39%)" strokeWidth={2} dot={{ r: 3, fill: "hsl(160 84% 39%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Recent Announcements</h3>
          {ANNOUNCEMENTS.slice(0, 3).map((a) => (
            <div key={a.id} className="p-3 rounded-lg hover:bg-muted/30 transition-colors mb-1">
              <div className="flex items-start gap-2">
                <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${a.priority === "high" ? "bg-destructive" : a.priority === "medium" ? "bg-warning" : "bg-muted-foreground"}`} />
                <div>
                  <p className="text-sm font-medium text-foreground">{a.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
