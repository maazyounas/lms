import { useState } from "react";
import {
  LayoutDashboard, BookOpen, Users, ClipboardCheck, Bell,
  User, CalendarOff, ClipboardList, Megaphone
} from "lucide-react";
import PortalLayout from "@/components/PortalLayout";
import { STUDENTS, COURSES, ANNOUNCEMENTS, TEACHERS, type Course } from "@/data/mockData";
import TeacherDashboard from "@/components/teacher/TeacherDashboard";
import TeacherClasses from "@/components/teacher/TeacherClasses";
import TeacherProfile from "@/components/teacher/TeacherProfile";
import TeacherLeave from "@/components/teacher/TeacherLeave";
import TeacherAssignments from "@/components/teacher/TeacherAssignments";
import TeacherNotifications from "@/components/teacher/TeacherNotifications";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "classes", label: "My Classes", icon: BookOpen },
  { id: "students", label: "Students", icon: Users },
  { id: "gradebook", label: "Gradebook", icon: ClipboardCheck },
  { id: "assignments", label: "Assignments", icon: ClipboardList },
  { id: "profile", label: "My Profile", icon: User },
  { id: "leave", label: "Apply for Leave", icon: CalendarOff },
  { id: "announcements", label: "Announcements", icon: Megaphone },
];

const currentTeacher = TEACHERS[0];

const gradeColor = (g: string) => {
  if (g.startsWith("A")) return "text-success";
  if (g.startsWith("B")) return "text-info";
  if (g.startsWith("C")) return "text-warning";
  return "text-destructive";
};

const TeacherPortal = () => {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [selectedClass, setSelectedClass] = useState<Course | null>(null);
  const teacher = currentTeacher;
  const myStudents = STUDENTS;

  const renderContent = () => {
    switch (activeNav) {
      case "dashboard":
        return <TeacherDashboard teacher={teacher} onNavigate={setActiveNav} onSelectClass={setSelectedClass} />;
      case "classes":
        return <TeacherClasses teacher={teacher} selectedClass={selectedClass} onSelectClass={setSelectedClass} />;
      case "profile":
        return <TeacherProfile teacher={teacher} />;
      case "leave":
        return <TeacherLeave />;
      case "assignments":
        return <TeacherAssignments teacher={teacher} />;
      case "students":
        return (
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-6">My Students</h1>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      {["Student", "Grade", "Mid-Term Score", "Attendance"].map((h) => (
                        <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {myStudents.map((s) => {
                      const midTerm = s.tests.find((t) => t.subject === teacher.subject && t.test === "Mid-Term");
                      const attPct = ((s.attendance.present / s.attendance.total) * 100).toFixed(0);
                      return (
                        <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">{s.avatar}</div>
                              <span className="text-sm font-medium text-foreground">{s.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-sm text-foreground">{s.grade}</td>
                          <td className="px-5 py-3">
                            {midTerm ? (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-foreground">{midTerm.marks}/{midTerm.total}</span>
                                <span className={`text-sm font-bold ${gradeColor(midTerm.grade)}`}>{midTerm.grade}</span>
                              </div>
                            ) : <span className="text-sm text-muted-foreground">-</span>}
                          </td>
                          <td className="px-5 py-3 text-sm text-foreground">{attPct}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case "gradebook":
        return (
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-6">Gradebook — {teacher.subject}</h1>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">Student</th>
                      {[...new Set(STUDENTS[0].tests.filter((t) => t.subject === teacher.subject).map((t) => t.test))].map((test) => (
                        <th key={test} className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">{test}</th>
                      ))}
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">Average</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myStudents.map((s) => {
                      const subjectTests = s.tests.filter((t) => t.subject === teacher.subject);
                      const avg = subjectTests.length > 0 ? subjectTests.reduce((a, t) => a + (t.marks / t.total) * 100, 0) / subjectTests.length : 0;
                      return (
                        <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">{s.avatar}</div>
                              <span className="text-sm font-medium text-foreground">{s.name}</span>
                            </div>
                          </td>
                          {[...new Set(STUDENTS[0].tests.filter((t) => t.subject === teacher.subject).map((t) => t.test))].map((testName) => {
                            const test = subjectTests.find((t) => t.test === testName);
                            return (
                              <td key={testName} className="px-5 py-3">
                                {test ? (
                                  <div>
                                    <span className="text-sm text-foreground">{test.marks}/{test.total}</span>
                                    <span className={`ml-2 text-xs font-bold ${gradeColor(test.grade)}`}>{test.grade}</span>
                                  </div>
                                ) : <span className="text-sm text-muted-foreground">-</span>}
                              </td>
                            );
                          })}
                          <td className="px-5 py-3">
                            <span className={`text-sm font-bold ${avg >= 80 ? "text-success" : avg >= 60 ? "text-warning" : "text-destructive"}`}>{avg.toFixed(0)}%</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case "announcements":
        return (
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-6">Announcements</h1>
            <div className="space-y-4">
              {ANNOUNCEMENTS.map((a) => (
                <div key={a.id} className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`h-3 w-3 rounded-full mt-1 shrink-0 ${a.priority === "high" ? "bg-destructive" : a.priority === "medium" ? "bg-warning" : "bg-muted-foreground"}`} />
                    <div>
                      <h3 className="font-semibold text-foreground">{a.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{a.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">{a.date} · {a.author}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <PortalLayout
      role="Teacher"
      userName={teacher.name}
      userAvatar={teacher.avatar}
      navItems={navItems}
      activeNav={activeNav}
      onNavChange={(nav) => { setActiveNav(nav); if (nav !== "classes") setSelectedClass(null); }}
      notificationSlot={<TeacherNotifications teacher={teacher} onNavigate={setActiveNav} />}
    >
      {renderContent()}
    </PortalLayout>
  );
};

export default TeacherPortal;
