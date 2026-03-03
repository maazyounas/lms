import { useState } from "react";
import {
  LayoutDashboard, BookOpen, Users, ClipboardCheck,
  User, CalendarOff, ClipboardList, Megaphone
} from "lucide-react";
import PortalLayout from "@/components/PortalLayout";
import { STUDENTS, ANNOUNCEMENTS, TEACHERS, type Course } from "@/data/mockData";
import TeacherDashboard from "@/components/teacher/TeacherDashboard";
import TeacherClasses from "@/components/teacher/TeacherClasses";
import TeacherProfile from "@/components/teacher/TeacherProfile";
import TeacherLeave from "@/components/teacher/TeacherLeave";
import TeacherAssignments from "@/components/teacher/TeacherAssignments";
import TeacherNotifications from "@/components/teacher/TeacherNotifications";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "classes", label: "My Classes", icon: BookOpen },
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
