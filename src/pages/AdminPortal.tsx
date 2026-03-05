import { useState } from "react";
import {
  LayoutDashboard,
  UserCog,
  Wallet,
  BookOpen,
  UserPlus,
  CalendarCheck,
  CalendarDays,
  Bell,
  FileText,
  Settings,
} from "lucide-react";
import PortalLayout from "@/components/PortalLayout";
import { ANNOUNCEMENTS, STUDENTS, type Announcement, type Student } from "@/data/mockData";
import AdminDashboard from "@/components/admin/dashboard/AdminDashboard";
import AdminCourses from "@/components/admin/courses/AdminCourses";
import AdminEnrollments from "@/components/admin/enrollments/AdminEnrollments";
import AdminAttendance from "@/components/admin/attendance/AdminAttendance";
import AdminLeaveRequests from "@/components/admin/leave-requests/AdminLeaveRequests";
import AdminAnnouncements from "@/components/admin/announcements/AdminAnnouncements";
import AdminReports from "@/components/admin/reports/AdminReports";
import AdminSettings from "@/components/admin/settings/AdminSettings";
import AdminStudent from "@/components/admin/student/AdminStudent";
import FeeManagement from "@/components/admin/fee/FeeManagement";


const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "students", label: "Students", icon: UserCog },
  { id: "fee", label: "Fee Management", icon: Wallet },
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "enrollments", label: "Enrollments", icon: UserPlus },
  { id: "attendance", label: "Attendance", icon: CalendarCheck },
  { id: "leave-requests", label: "Leave Requests", icon: CalendarDays },
  { id: "announcements", label: "Announcements", icon: Bell },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings },
];

const AdminPortal = () => {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [pendingLeaves, setPendingLeaves] = useState(3);
  const [announcements, setAnnouncements] = useState<Announcement[]>(ANNOUNCEMENTS);
  const [students, setStudents] = useState<Student[]>(STUDENTS);

  const renderContent = () => {
    switch (activeNav) {
      case "dashboard":
        return (
          <AdminDashboard
            announcements={announcements}
            pendingLeaves={pendingLeaves}
            onOpenStudent={(student) => {
              if (student) {
                setActiveNav("students");
              }
            }}
          />
        );
      case "students":
        return (
          <AdminStudent
            students={students}
            onStudentsChange={setStudents}
            onOpenFeeManagement={() => setActiveNav("fee")}
          />
        );
      case "fee":
        return <FeeManagement students={students} onStudentsChange={setStudents} />;
      case "courses":
        return <AdminCourses />;
      case "enrollments":
        return <AdminEnrollments />;
      case "attendance":
        return <AdminAttendance />;
      case "leave-requests":
        return <AdminLeaveRequests onPendingCountChange={setPendingLeaves} />;
      case "announcements":
        return <AdminAnnouncements onAnnouncementsChange={setAnnouncements} />;
      case "reports":
        return <AdminReports />;
      case "settings":
        return <AdminSettings />;
      default:
        return null;
    }
  };

  return (
    <PortalLayout
      role="Administrator"
      userName="Admin User"
      userAvatar="AU"
      navItems={navItems}
      activeNav={activeNav}
      onNavChange={setActiveNav}
    >
      {renderContent()}
    </PortalLayout>
  );
};

export default AdminPortal;
