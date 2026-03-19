import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  ClipboardList,
  MessageSquare,
  Calendar,
  CheckCircle2,
  User,
  CalendarOff,
  Megaphone,
  CalendarCheck,
} from "lucide-react";
import PortalLayout from "@/components/PortalLayout";
import {
  STUDENTS,
  ANNOUNCEMENTS,
  TEACHERS,
  MOCK_TEACHER_QUIZZES,
  MOCK_QUIZ_SUBMISSIONS,
  type Course,
} from "@/data/mockData";
import TeacherDashboard from "@/components/teacher/dashboard/TeacherDashboard";
import TeacherClasses from "@/components/teacher/classes/TeacherClasses";
import TeacherProfile from "@/components/teacher/profile/TeacherProfile";
import TeacherLeave from "@/components/teacher/leave/TeacherLeave";
import TeacherAssignments from "@/components/teacher/assignments/TeacherAssignments";
import TeacherNotifications from "@/components/teacher/notifications/TeacherNotifications";
import TeacherAnnouncements from "@/components/teacher/announcements/TeacherAnnouncements";
import TeacherCreateQuiz from "@/components/teacher/quizzes/TeacherCreateQuiz";
import TeacherCheckQuizzes from "@/components/teacher/quizzes/TeacherCheckQuizzes";
import TeacherAttendance from "@/components/teacher/attendance/TeacherAttendance";
import AdminParentCommunication from "@/components/admin/communication/AdminParentCommunication";
import AdminAttendance from "@/components/admin/attendance/AdminAttendance";
import TeacherGradebook from "@/components/teacher/gradebook/TeacherGradebook";
import TeacherTimetable from "@/components/teacher/timetable/TeacherTimetable";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "classes", label: "My Classes", icon: BookOpen },
  { id: "gradebook", label: "Gradebook", icon: ClipboardList },
  { id: "assignments", label: "Assignments", icon: ClipboardList },
  { id: "attendance", label: "Attendance", icon: CalendarCheck },
  { id: "timetable", label: "Timetable", icon: Calendar },
  { id: "see-attendance", label: "See Attendance", icon: CalendarCheck },
  { id: "createQuiz", label: "Create Quiz", icon: ClipboardCheck },
  { id: "checkQuizzes", label: "Check Quizzes", icon: CheckCircle2 },
  { id: "leave", label: "Apply for Leave", icon: CalendarOff },
  { id: "communication", label: "Parent Communication", icon: MessageSquare },
  { id: "announcements", label: "Announcements", icon: Megaphone },
];

const currentTeacher = TEACHERS[0];

const TeacherPortal = () => {
  const navigate = useNavigate();
  const { section } = useParams<{ section?: string }>();
  const [selectedClass, setSelectedClass] = useState<Course | null>(null);
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
  const [teachers, setTeachers] = useState(() => {
    const raw = localStorage.getItem("teachers");
    if (!raw) return TEACHERS;
    try {
      const parsed = JSON.parse(raw) as typeof TEACHERS;
      return Array.isArray(parsed) ? parsed : TEACHERS;
    } catch {
      return TEACHERS;
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
  const teacher = teachers[0] ?? currentTeacher;
  const myStudents = students;

  useEffect(() => {
    const seed = <T,>(key: string, value: T) => {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify(value));
      }
    };
    seed("students", STUDENTS);
    seed("teachers", TEACHERS);
    seed("announcements", ANNOUNCEMENTS);
    seed("teacher-quizzes", MOCK_TEACHER_QUIZZES);
    seed("quiz-submissions", MOCK_QUIZ_SUBMISSIONS);
  }, []);

  const allowedSections = useMemo(
    () => new Set([...navItems.map((item) => item.id), "profile"]),
    []
  );

  const activeNav = allowedSections.has(section ?? "")
    ? (section as string)
    : "dashboard";

  useEffect(() => {
    if (!section || !allowedSections.has(section)) {
      navigate("/teacher/dashboard", { replace: true });
    }
  }, [allowedSections, navigate, section]);

  useEffect(() => {
    if (activeNav !== "classes" && selectedClass) {
      setSelectedClass(null);
    }
  }, [activeNav, selectedClass]);

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
      if (event.key === "teachers") {
        const raw = localStorage.getItem("teachers");
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw) as typeof TEACHERS;
          if (Array.isArray(parsed)) setTeachers(parsed);
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

  useEffect(() => {
    localStorage.setItem("announcements", JSON.stringify(announcements));
  }, [announcements]);

  const handleNavChange = (nav: string) => {
    navigate(`/teacher/${nav}`);
  };

  const renderContent = () => {
    switch (activeNav) {
      case "dashboard":
        return (
          <TeacherDashboard
            teacher={teacher}
            onNavigate={handleNavChange}
            onSelectClass={setSelectedClass}
          />
        );
      case "classes":
        return (
          <TeacherClasses
            teacher={teacher}
            selectedClass={selectedClass}
            onSelectClass={setSelectedClass}
            onNavigate={handleNavChange}
          />
        );
      case "gradebook":
        return <TeacherGradebook teacher={teacher} />;
      case "timetable":
        return <TeacherTimetable teacher={teacher} />;
      case "profile":
        return <TeacherProfile teacher={teacher} />;
      case "leave":
        return <TeacherLeave teacher={teacher} />;
      case "assignments":
        return <TeacherAssignments teacher={teacher} />;
      case "attendance":
        return (
          <TeacherAttendance
            students={myStudents.filter((s) =>
              teacher.classes.includes(s.grade),
            )}
            teacherName={teacher.name}
            teacherClasses={teacher.classes}
          />
        );
      case "see-attendance":
        return (
          <AdminAttendance
            students={myStudents.filter((s) =>
              teacher.classes.includes(s.grade),
            )}
          />
        );
      case "communication": {
        const teacherClasses = teacher.classes || [];
        const studentsInTeacherClasses = myStudents.filter((s) =>
          teacherClasses.includes(s.grade),
        );
        return (
          <AdminParentCommunication
            students={studentsInTeacherClasses}
            currentAdmin={teacher.name}
            onAuditLog={() => {}}
          />
        );
      }
      case "createQuiz":
        return <TeacherCreateQuiz teacher={teacher} />;
      case "checkQuizzes":
        return <TeacherCheckQuizzes teacher={teacher} />;
      case "announcements": {
        const teacherClasses = teacher.classes || [];
        const studentsInTeacherClasses = myStudents.filter((s) =>
          teacherClasses.includes(s.grade),
        );
        return (
          <TeacherAnnouncements
            senderName={teacher.name}
            classes={teacherClasses}
            students={studentsInTeacherClasses}
            receivedAnnouncements={announcements}
            allStudentsLabel="All Students (in my classes)"
            onAnnouncementCreated={(announcement) => {
              setAnnouncements((prev) => [announcement, ...prev]);
            }}
          />
        );
      }
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
      onNavChange={handleNavChange}
      notificationSlot={
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNavChange("profile")}
            className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
            title="My Profile"
          >
            <User className="h-5 w-5 text-primary" />
          </button>
          <TeacherNotifications teacher={teacher} onNavigate={handleNavChange} />
        </div>
      }
    >
      <div className="space-y-6">
        {/* Main content container for all tabs (announcements is already inside its own card) */}
        {activeNav !== "announcements" ? (
          <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
            {renderContent()}
          </div>
        ) : (
          renderContent()
        )}
      </div>
    </PortalLayout>
  );
};

export default TeacherPortal;
