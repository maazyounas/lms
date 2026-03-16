import { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  User,
  CalendarOff,
  ClipboardList,
  Megaphone,
  CalendarCheck,
  MessageSquare,
} from "lucide-react";
import PortalLayout from "@/components/PortalLayout";
import { STUDENTS, ANNOUNCEMENTS, TEACHERS, type Course } from "@/data/mockData";
import TeacherDashboard from "@/components/teacher/dashboard/TeacherDashboard";
import TeacherClasses from "@/components/teacher/classes/TeacherClasses";
import TeacherProfile from "@/components/teacher/profile/TeacherProfile";
import TeacherLeave from "@/components/teacher/leave/TeacherLeave";
import TeacherAssignments from "@/components/teacher/assignments/TeacherAssignments";
import TeacherNotifications from "@/components/teacher/notifications/TeacherNotifications";
import TeacherAnnouncements from "@/components/teacher/announcements/TeacherAnnouncements";
import TeacherCreateQuiz from "@/components/teacher/quizzes/TeacherCreateQuiz";
import TeacherAttendance from "@/components/teacher/attendance/TeacherAttendance";
import AdminParentCommunication from "@/components/admin/communication/AdminParentCommunication";
import AdminAttendance from "@/components/admin/attendance/AdminAttendance";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "classes", label: "My Classes", icon: BookOpen },
  { id: "assignments", label: "Assignments", icon: ClipboardList },
  { id: "attendance", label: "Attendance", icon: CalendarCheck },
  { id: "see-attendance", label: "See Attendance", icon: CalendarCheck },
  { id: "profile", label: "My Profile", icon: User },
  { id: "leave", label: "Apply for Leave", icon: CalendarOff },
  { id: "communication", label: "Parent Communication", icon: MessageSquare },
  { id: "announcements", label: "Announcements", icon: Megaphone },
  { id: "createQuiz", label: "Create Quiz", icon: ClipboardCheck },
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
        return (
          <TeacherClasses
            teacher={teacher}
            selectedClass={selectedClass}
            onSelectClass={setSelectedClass}
            onNavigate={(nav) => setActiveNav(nav)}
          />
        );
      case "profile":
        return <TeacherProfile teacher={teacher} />;
      case "leave":
        return <TeacherLeave teacher={teacher} />;
      case "assignments":
        return <TeacherAssignments teacher={teacher} />;
      case "attendance":
        return (
          <TeacherAttendance
            students={myStudents.filter((s) => teacher.classes.includes(s.grade))}
            teacherName={teacher.name}
            teacherClasses={teacher.classes}
          />
        );
      case "see-attendance":
        return (
          <AdminAttendance
            students={myStudents.filter((s) => teacher.classes.includes(s.grade))}
          />
        );
      case "communication": {
        const teacherClasses = teacher.classes || [];
        const studentsInTeacherClasses = myStudents.filter((s) => teacherClasses.includes(s.grade));
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
      case "announcements": {
        const teacherClasses = teacher.classes || [];
        const studentsInTeacherClasses = myStudents.filter((s) => teacherClasses.includes(s.grade));
        return (
          <TeacherAnnouncements
            senderName={teacher.name}
            classes={teacherClasses}
            students={studentsInTeacherClasses}
            receivedAnnouncements={ANNOUNCEMENTS}
            allStudentsLabel="All Students (in my classes)"
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
      onNavChange={(nav) => { setActiveNav(nav); if (nav !== "classes") setSelectedClass(null); }}
      notificationSlot={<TeacherNotifications teacher={teacher} onNavigate={setActiveNav} />}
    >
      <div className="space-y-6">
        {/* Page Header for all other tabs (except announcements which handles its own) */}
        {activeNav !== "announcements" && (
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {navItems.find((item) => item.id === activeNav)?.label || "Teacher Portal"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {activeNav === "dashboard" && "Overview of your classes and recent activity."}
              {activeNav === "classes" && "Manage your courses and teaching materials."}
              {activeNav === "assignments" && "Create and review student assignments."}
              {activeNav === "attendance" && "Track student attendance."}
              {activeNav === "profile" && "View and update your personal information."}
              {activeNav === "leave" && "Apply for leave and view your leave history."}
              {activeNav === "communication" && "Communicate with parents."}
              {activeNav === "createQuiz" && "Create quizzes for your students."}
            </p>
          </div>
        )}

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
