import { useState } from "react";
import {
  LayoutDashboard, FileText, UserCheck, ClipboardList, Calendar,
  User, CalendarOff, Megaphone, BookOpen, ClipboardCheck
} from "lucide-react";
import PortalLayout from "@/components/PortalLayout";
import { STUDENTS, ANNOUNCEMENTS } from "@/data/mockData";
import StudentDashboard from "@/components/student/dashboard/components/StudentDashboard";
import StudentProfile from "@/components/student/profile/components/StudentProfile";
import StudentGrades from "@/components/student/grades/components/StudentGrades";
import StudentAttendance from "@/components/student/attendance/components/StudentAttendance";
import StudentAssignments from "@/components/student/assignments/components/StudentAssignments";
import StudentTimetable from "@/components/student/timetable/components/StudentTimetable";
import StudentLeave from "@/components/student/leave/components/StudentLeave";
import NotificationBell from "@/components/student/notifications/components/NotificationBell";
import StudentCourses from "@/components/student/courses/components/StudentCourses";
import StudentQuizzes from "@/components/student/quizzes/StudentQuizzes";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "courses", label: "My Courses", icon: BookOpen },
  { id: "grades", label: "My Grades", icon: FileText },
  { id: "attendance", label: "Attendance", icon: UserCheck },
  { id: "assignments", label: "Assignments", icon: ClipboardList },
  { id: "quizzes", label: "Quizzes", icon: ClipboardCheck },
  { id: "timetable", label: "Timetable", icon: Calendar },
  { id: "announcements", label: "Announcements", icon: Megaphone },
  { id: "profile", label: "My Profile", icon: User },
  { id: "leave", label: "Apply for Leave", icon: CalendarOff },
];

const currentStudent = STUDENTS[0];

const StudentPortal = () => {
  const [activeNav, setActiveNav] = useState("dashboard");
  const student = currentStudent;

  // Custom notification slot with profile icon
  const notificationSlot = (
    <div className="flex items-center gap-3">
      <button
        onClick={() => setActiveNav("profile")}
        className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
        title="My Profile"
      >
        <User className="h-5 w-5 text-primary" />
      </button>
      <NotificationBell student={student} onNavigate={setActiveNav} />
    </div>
  );

  const renderContent = () => {
    switch (activeNav) {
      case "dashboard":
        return <StudentDashboard student={student} onNavigate={setActiveNav} />;
      case "profile":
        return <StudentProfile student={student} />;
      case "grades":
        return <StudentGrades student={student} />;
      case "attendance":
        return <StudentAttendance student={student} />;
      case "assignments":
        return <StudentAssignments student={student} />;
      case "timetable":
        return <StudentTimetable />;
      case "leave":
        return <StudentLeave />;
      case "courses":
        return <StudentCourses />;
      case "quizzes":
        return <StudentQuizzes student={student} />;
      case "announcements":
        return (
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-6">Announcements</h1>
            <div className="space-y-3">
              {ANNOUNCEMENTS.map((a) => (
                <div key={a.id} className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <div className={`h-2 w-2 rounded-full mt-2 shrink-0 ${a.priority === "high" ? "bg-destructive" : a.priority === "medium" ? "bg-warning" : "bg-muted-foreground"}`} />
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{a.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{a.date} · {a.author}</p>
                      <p className="text-sm text-muted-foreground mt-2">{a.content}</p>
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
      role="Student"
      userName={student.name}
      userAvatar={student.avatar}
      navItems={navItems}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      notificationSlot={notificationSlot}
    >
      {renderContent()}
    </PortalLayout>
  );
};

export default StudentPortal;
