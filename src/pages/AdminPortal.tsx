import { useMemo, useState } from "react";
import {
  LayoutDashboard,
  UserCog,
  Wallet,
  BookOpen,
  GraduationCap,
  CalendarCheck,
  CalendarDays,
  Bell,
  AlertTriangle,
  Shield,
  Layers3,
  MessageSquare,
  CalendarClock,
  FileText,
  Settings,
} from "lucide-react";
import PortalLayout from "@/components/PortalLayout";
import {
  ANNOUNCEMENTS,
  STUDENTS,
  TEACHERS,
  type Announcement,
  type Student,
} from "@/data/mockData";
import AdminDashboard from "@/components/admin/dashboard/AdminDashboard";
import AdminAttendance from "@/components/admin/attendance/AdminAttendance";
import AdminLeaveRequests from "@/components/admin/leave-requests/AdminLeaveRequests";
import AdminAnnouncements from "@/components/admin/announcements/AdminAnnouncements";
import AdminReports from "@/components/admin/reports/AdminReports";
import AdminStudent from "@/components/admin/student/AdminStudent";
import FeeManagement from "@/components/admin/fee/FeeManagement";
import AdminTeacher, {
  type AdminTeacherRecord,
} from "@/components/admin/teacher/AdminTeacher";
import AdminParentCommunication from "@/components/admin/communication/AdminParentCommunication";
import AdminTimetablePlanner from "@/components/admin/planner/AdminTimetablePlanner";
import type {
  AuditLogEntry,
  FeeTransaction,
  PlannerAllocation,
  SmartAlert,
} from "@/components/admin/types";


const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "students", label: "Students", icon: UserCog },
  { id: "teachers", label: "Teachers", icon: GraduationCap },
  { id: "fee", label: "Fee Management", icon: Wallet },
  { id: "communication", label: "Parent Communication", icon: MessageSquare },
  { id: "planner", label: "Timetable Planner", icon: CalendarClock },
  { id: "attendance", label: "Attendance", icon: CalendarCheck },
  { id: "leave-requests", label: "Leave Requests", icon: CalendarDays },
  { id: "announcements", label: "Announcements", icon: Bell },
  { id: "reports", label: "Reports", icon: FileText },
];

const AdminPortal = () => {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [pendingLeaves, setPendingLeaves] = useState(3);
  const [announcements, setAnnouncements] = useState<Announcement[]>(ANNOUNCEMENTS);
  const [students, setStudents] = useState<Student[]>(STUDENTS);
  const [teachers, setTeachers] = useState<AdminTeacherRecord[]>(
    TEACHERS as AdminTeacherRecord[]
  );
  const [feeTransactions, setFeeTransactions] = useState<FeeTransaction[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [plannerAllocations, setPlannerAllocations] = useState<PlannerAllocation[]>([]);
  const currentAdmin = "Admin User";

  const addAuditLog = (entry: Omit<AuditLogEntry, "id" | "createdAt">) => {
    const nextEntry: AuditLogEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
    };
    setAuditLogs((prev) => [nextEntry, ...prev]);
  };

  const smartAlerts = useMemo<SmartAlert[]>(() => {
    const today = new Date();
    const dayMs = 24 * 60 * 60 * 1000;
    const alerts: SmartAlert[] = [];

    students.forEach((student) => {
      if (student.fees.pending > 0) {
        alerts.push({
          id: `fee-${student.id}`,
          type: "fee",
          severity: student.fees.pending > 20000 ? "high" : "medium",
          title: `Pending Fee: ${student.name}`,
          message: `${student.grade} has pending dues of Rs. ${student.fees.pending.toLocaleString()}.`,
          createdAt: new Date().toISOString(),
        });
      }

      if (student.attendance.total > 0) {
        const pct = (student.attendance.present / student.attendance.total) * 100;
        if (pct < 75) {
          alerts.push({
            id: `att-${student.id}`,
            type: "attendance",
            severity: pct < 60 ? "high" : "medium",
            title: `Low Attendance: ${student.name}`,
            message: `Attendance is ${pct.toFixed(0)}% (threshold 75%).`,
            createdAt: new Date().toISOString(),
          });
        }
      }

      const missingCount = student.assignments.filter((a) => a.status === "Missing").length;
      const overduePendingCount = student.assignments.filter((a) => {
        const dueDate = new Date(a.due);
        return a.status === "Pending" && Number.isFinite(dueDate.getTime()) && dueDate < today;
      }).length;

      const assignmentIssueCount = missingCount + overduePendingCount;
      if (assignmentIssueCount > 0) {
        alerts.push({
          id: `ass-${student.id}`,
          type: "assignment",
          severity: assignmentIssueCount > 2 ? "high" : "medium",
          title: `Assignment Alert: ${student.name}`,
          message: `${assignmentIssueCount} missing/overdue assignment(s) detected.`,
          createdAt: new Date().toISOString(),
        });
      }
    });

    announcements.forEach((announcement) => {
      const announcementDate = new Date(announcement.date);
      if (!Number.isFinite(announcementDate.getTime())) return;
      const diffDays = Math.ceil((announcementDate.getTime() - today.getTime()) / dayMs);
      if (diffDays >= 0 && diffDays <= 7) {
        alerts.push({
          id: `ann-${announcement.id}`,
          type: "announcement",
          severity: announcement.priority === "high" ? "high" : "low",
          title: `Expiring Announcement: ${announcement.title}`,
          message: `Announcement date is ${announcement.date}. Review before it expires.`,
          createdAt: new Date().toISOString(),
        });
      }
    });

    return alerts.sort((a, b) => {
      const weight = { high: 3, medium: 2, low: 1 };
      return weight[b.severity] - weight[a.severity];
    });
  }, [announcements, students]);

  const renderContent = () => {
    switch (activeNav) {
      case "dashboard":
        return (
          <AdminDashboard
            students={students}
            teachersCount={teachers.length}
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
            onAuditLog={addAuditLog}
            currentAdmin={currentAdmin}
          />
        );
      case "fee":
        return (
          <FeeManagement
            students={students}
            onStudentsChange={setStudents}
            onRecordTransaction={(transaction) =>
              setFeeTransactions((prev) => [transaction, ...prev])
            }
            transactions={feeTransactions}
            onAuditLog={addAuditLog}
            currentAdmin={currentAdmin}
          />
        );
      case "teachers":
        return (
          <AdminTeacher
            teachers={teachers}
            onTeachersChange={setTeachers}
            onAuditLog={addAuditLog}
            currentAdmin={currentAdmin}
          />
        );
      case "communication":
        return (
          <AdminParentCommunication
            students={students}
            onAuditLog={addAuditLog}
            currentAdmin={currentAdmin}
          />
        );
      case "planner":
        return (
          <AdminTimetablePlanner
            students={students}
            teachers={teachers}
            allocations={plannerAllocations}
            onAllocationsChange={setPlannerAllocations}
          />
        );
      
      case "attendance":
        return <AdminAttendance students={students} />;
      case "leave-requests":
        return <AdminLeaveRequests onPendingCountChange={setPendingLeaves} />;
      case "announcements":
        return <AdminAnnouncements onAnnouncementsChange={setAnnouncements} />;
      case "reports":
        return (
          <AdminReports
            students={students}
            teachers={teachers}
            feeTransactions={feeTransactions}
          />
        );
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
