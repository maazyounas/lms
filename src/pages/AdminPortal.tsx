import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  UserPlus,
  CalendarCheck,
  CalendarDays,
  Bell,
  FileText,
  Settings,
} from "lucide-react";
import PortalLayout from "@/components/PortalLayout";
import { ANNOUNCEMENTS, type Announcement, type Student } from "@/data/mockData";
import AdminDashboard from "@/components/admin/dashboard/AdminDashboard";
import AdminUsers from "@/components/admin/users/AdminUsers";
import AdminCourses from "@/components/admin/courses/AdminCourses";
import AdminEnrollments from "@/components/admin/enrollments/AdminEnrollments";
import AdminAttendance from "@/components/admin/attendance/AdminAttendance";
import AdminLeaveRequests from "@/components/admin/leave-requests/AdminLeaveRequests";
import AdminAnnouncements from "@/components/admin/announcements/AdminAnnouncements";
import AdminReports from "@/components/admin/reports/AdminReports";
import AdminSettings from "@/components/admin/settings/AdminSettings";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", label: "Users", icon: Users },
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
  const [, setFocusedStudent] = useState<Student | null>(null);

  const renderContent = () => {
    switch (activeNav) {
      case "dashboard":
        return (
          <AdminDashboard
            announcements={announcements}
            pendingLeaves={pendingLeaves}
            onOpenStudent={(student) => {
              setFocusedStudent(student);
              setActiveNav("users");
            }}
          />
        );
      case "users":
        return <AdminUsers />;
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
