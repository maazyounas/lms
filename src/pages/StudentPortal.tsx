import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  LayoutDashboard, FileText, UserCheck, ClipboardList, Calendar,
  User, CalendarOff, Megaphone, BookOpen, ClipboardCheck
} from "lucide-react";
import PortalLayout from "@/components/PortalLayout";
import { STUDENTS, ANNOUNCEMENTS } from "@/data/mockData";
import { MOCK_TEACHER_QUIZZES, MOCK_QUIZ_SUBMISSIONS } from "@/data/mockData";
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

const StudentPortal = () => {
  const navigate = useNavigate();
  const { section } = useParams<{ section?: string }>();
  const [students, setStudents] = useState(() => {
    const raw = localStorage.getItem("students");
    if (!raw) return STUDENTS;
    try {
      const parsed = JSON.parse(raw) as typeof STUDENTS;
      return Array.isArray(parsed) ? parsed : STUDENTS;
    } catch {
      return STUDENTS;
    }
  });
  const [announcements, setAnnouncements] = useState(() => {
    const raw = localStorage.getItem("announcements");
    if (!raw) return ANNOUNCEMENTS;
    try {
      const parsed = JSON.parse(raw) as typeof ANNOUNCEMENTS;
      return Array.isArray(parsed) ? parsed : ANNOUNCEMENTS;
    } catch {
      return ANNOUNCEMENTS;
    }
  });
  const student = students[0] ?? STUDENTS[0];
  const [announcementLimit, setAnnouncementLimit] = useState(6);

  useEffect(() => {
    const seed = <T,>(key: string, value: T) => {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify(value));
      }
    };
    seed("students", STUDENTS);
    seed("announcements", ANNOUNCEMENTS);
    seed("teacher-quizzes", MOCK_TEACHER_QUIZZES);
    seed("quiz-submissions", MOCK_QUIZ_SUBMISSIONS);
  }, []);

  const allowedSections = useMemo(() => new Set(navItems.map((item) => item.id)), []);
  const activeNav = allowedSections.has(section ?? "")
    ? (section as string)
    : "dashboard";

  useEffect(() => {
    if (!section || !allowedSections.has(section)) {
      navigate("/student/dashboard", { replace: true });
    }
  }, [allowedSections, navigate, section]);

  useEffect(() => {
    if (activeNav === "announcements") {
      setAnnouncementLimit(6);
    }
  }, [activeNav]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "students") {
        const raw = localStorage.getItem("students");
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw) as typeof STUDENTS;
          if (Array.isArray(parsed)) setStudents(parsed);
        } catch {
          return;
        }
      }
      if (event.key === "announcements") {
        const raw = localStorage.getItem("announcements");
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw) as typeof ANNOUNCEMENTS;
          if (Array.isArray(parsed)) setAnnouncements(parsed);
        } catch {
          return;
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Custom notification slot with profile icon
  const handleNavChange = (nav: string) => {
    navigate(`/student/${nav}`);
  };

  const notificationSlot = (
    <div className="flex items-center gap-3">
      <button
        onClick={() => handleNavChange("profile")}
        className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
        title="My Profile"
      >
        <User className="h-5 w-5 text-primary" />
      </button>
      <NotificationBell student={student} onNavigate={handleNavChange} />
    </div>
  );

  const renderContent = () => {
    switch (activeNav) {
      case "dashboard":
        return <StudentDashboard student={student} onNavigate={handleNavChange} />;
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
              {announcements.length === 0 && (
                <div className="rounded-xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground text-center">
                  No announcements yet. Check back later or contact your teacher.
                </div>
              )}
              {announcements.slice(0, announcementLimit).map((a) => (
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
              {announcements.length > announcementLimit && (
                <div className="flex justify-center">
                  <button
                    onClick={() => setAnnouncementLimit((prev) => prev + 6)}
                    className="text-sm text-primary hover:underline"
                  >
                    Show more announcements
                  </button>
                </div>
              )}
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
      onNavChange={handleNavChange}
      notificationSlot={notificationSlot}
    >
      {renderContent()}
    </PortalLayout>
  );
};

export default StudentPortal;
