import { BookOpen, Users, TrendingUp, UserCheck, ClipboardList, ArrowRight } from "lucide-react";
import { STUDENTS, COURSES, ANNOUNCEMENTS, TEACHER_ASSIGNMENTS, type Teacher, type Course } from "@/data/mockData";

interface Props {
  teacher: Teacher;
  onNavigate: (nav: string) => void;
  onSelectClass: (course: Course) => void;
}

const TeacherDashboard = ({ teacher, onNavigate, onSelectClass }: Props) => {
  const myStudents = STUDENTS;
  const myCourses = COURSES.filter((c) => c.teacher === teacher.name);
  const myAssignments = TEACHER_ASSIGNMENTS.filter((a) => a.subject === teacher.subject);
  const pendingGrading = myAssignments.reduce(
    (acc, a) => acc + a.submissions.filter((s) => s.status === "Submitted" && s.marks === undefined).length, 0
  );

  const avgScore = myStudents.length > 0
    ? (myStudents.reduce((a, s) => {
        const t = s.tests.find((t) => t.subject === teacher.subject && t.test === "Mid-Term");
        return a + (t ? (t.marks / t.total) * 100 : 0);
      }, 0) / myStudents.length).toFixed(0)
    : "0";

  const avgAtt = myStudents.length > 0
    ? (myStudents.reduce((a, s) => a + (s.attendance.present / s.attendance.total) * 100, 0) / myStudents.length).toFixed(0)
    : "0";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Welcome, {teacher.name.split(" ").slice(1).join(" ")}! 👋</h1>
        <p className="text-muted-foreground text-sm">Subject: {teacher.subject} · Classes: {teacher.classes.join(", ")}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "My Classes", value: myCourses.length, icon: BookOpen, color: "text-success bg-success/10" },
          { label: "Total Students", value: teacher.students, icon: Users, color: "text-info bg-info/10" },
          { label: "Avg Class Score", value: `${avgScore}%`, icon: TrendingUp, color: "text-accent bg-accent/10" },
          { label: "Pending Grading", value: pendingGrading, icon: ClipboardList, color: "text-warning bg-warning/10" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <div className={`h-10 w-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Classes - clickable */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">My Classes</h3>
            <button onClick={() => onNavigate("classes")} className="text-xs text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          {myCourses.map((c) => (
            <button
              key={c.id}
              onClick={() => { onSelectClass(c); onNavigate("classes"); }}
              className="w-full text-left p-3 rounded-lg hover:bg-muted/30 transition-colors mb-2"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-foreground">{c.name} ({c.code})</p>
                  <p className="text-xs text-muted-foreground">{c.schedule} · {c.room}</p>
                </div>
                <span className="text-xs text-muted-foreground">{c.students} students</span>
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Syllabus</span>
                  <span className="text-foreground">{c.progress}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${c.progress}%` }} />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Announcements */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Announcements</h3>
            <button onClick={() => onNavigate("announcements")} className="text-xs text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          {ANNOUNCEMENTS.slice(0, 4).map((a) => (
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

        {/* Recent Assignments */}
        <div className="bg-card border border-border rounded-xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Recent Assignments</h3>
            <button onClick={() => onNavigate("assignments")} className="text-xs text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {myAssignments.slice(0, 4).map((a) => {
              const submitted = a.submissions.filter((s) => s.status === "Submitted" || s.status === "Late").length;
              const graded = a.submissions.filter((s) => s.marks !== undefined).length;
              return (
                <button key={a.id} onClick={() => onNavigate("assignments")} className="text-left bg-muted/20 border border-border rounded-lg p-4 hover:border-primary/30 transition-colors">
                  <p className="text-sm font-medium text-foreground">{a.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">Class: {a.classGrade} · Due: {a.dueDate}</p>
                  <div className="flex gap-3 mt-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-info/15 text-info">{submitted}/{a.submissions.length} submitted</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-success/15 text-success">{graded} graded</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
