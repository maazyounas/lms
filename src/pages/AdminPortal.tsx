import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  LayoutDashboard,
  UserCog,
  Wallet,
  GraduationCap,
  CalendarCheck,
  CalendarDays,
  Bell,
  Layers3,
  MessageSquare,
  CalendarClock,
  FileText,
} from "lucide-react";
import PortalLayout from "@/components/PortalLayout";
import { COURSES } from "@/data/mockData";
import AdminDashboard from "@/components/admin/dashboard/AdminDashboard";
import AdminAttendance from "@/components/admin/attendance/AdminAttendance";
import AdminLeaveRequests from "@/components/admin/leave-requests/AdminLeaveRequests";
import AdminAnnouncements from "@/components/admin/announcements/AdminAnnouncements";
import AdminReports from "@/components/admin/reports/AdminReports";
import AdminStudent from "@/components/admin/student/AdminStudent";
import FeeManagement from "@/components/admin/fee/FeeManagement";
import AdminTeacher from "@/components/admin/teacher/AdminTeacher";
import AdminParentCommunication from "@/components/admin/communication/AdminParentCommunication";
import AdminTimetablePlanner from "@/components/admin/planner/AdminTimetablePlanner";
import AdminCreateClass from "@/components/admin/create-class/AdminCreateClass";
import { useAdminData } from "@/hooks/use-admin-data";

const DEFAULT_SUBJECTS = [
  "Mathematics",
  "English",
  "Physics",
  "Chemistry",
  "Urdu",
  "Computer Science",
  "Biology",
];

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "create-class", label: "Create Class", icon: Layers3 },
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
  const navigate = useNavigate();
  const { section } = useParams<{ section?: string }>();
  const {
    announcements,
    setAnnouncements,
    students,
    setStudents,
    teachers,
    setTeachers,
    feeTransactions,
    setFeeTransactions,
    plannerAllocations,
    setPlannerAllocations,
    customClasses,
    setCustomClasses,
    classSubjects,
    setClassSubjects,
    addAuditLog,
  } = useAdminData();

  const [feeFilter, setFeeFilter] = useState<"all" | "pending">("all");
  const [studentSection, setStudentSection] = useState<"enroll" | "search" | "reset">(
    "enroll"
  );
  const [dashboardSelectedStudentId, setDashboardSelectedStudentId] = useState<
    number | null
  >(null);
  const [teacherSection, setTeacherSection] = useState<"enroll" | "search" | "reset">(
    "enroll"
  );
  const [pendingLeaves, setPendingLeaves] = useState(3);
  const currentAdmin = "Admin User";

  const activeNav = navItems.some((item) => item.id === section)
    ? (section as string)
    : "dashboard";

  useEffect(() => {
    if (!section || !navItems.some((item) => item.id === section)) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate, section]);

  const handleNavChange = (id: string) => {
    if (id === "fee") {
      setFeeFilter("all");
    }
    navigate(`/admin/${id}`);
  };

  const navigateTo = (id: string) => {
    navigate(`/admin/${id}`);
  };

  const classOptions = useMemo(() => {
    const fromStudents = students.map((s) => s.grade);
    const fromAllocations = plannerAllocations.map((a) => a.className);
    return Array.from(new Set([...fromStudents, ...fromAllocations, ...customClasses])).sort();
  }, [students, plannerAllocations, customClasses]);

  const subjectOptions = useMemo(() => {
    const fromTeachers = teachers.flatMap((t) =>
      t.subject
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    );
    const fromAllocations = plannerAllocations.map((a) => a.subject);
    const fromClasses = Object.values(classSubjects).flat();
    return Array.from(
      new Set([...DEFAULT_SUBJECTS, ...fromTeachers, ...fromAllocations, ...fromClasses])
    ).sort();
  }, [teachers, plannerAllocations, classSubjects]);

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
                setStudentSection("search");
                setDashboardSelectedStudentId(student.id);
                handleNavChange("students");
              }
            }}
            onOpenStudentSearch={() => {
              setStudentSection("search");
              setDashboardSelectedStudentId(null);
              handleNavChange("students");
            }}
            onOpenTeacherSearch={() => {
              setTeacherSection("search");
              handleNavChange("teachers");
            }}
            onOpenAnnouncements={() => handleNavChange("announcements")}
            onOpenLeaveRequests={() => handleNavChange("leave-requests")}
            onOpenFeeWithDues={() => {
              setFeeFilter("pending");
              navigateTo("fee");
            }}
          />
        );
      case "students":
        return (
          <AdminStudent
            students={students}
            onStudentsChange={setStudents}
            onOpenFeeManagement={() => handleNavChange("fee")}
            onAuditLog={addAuditLog}
            currentAdmin={currentAdmin}
            initialSection={studentSection}
            initialSelectedStudentId={dashboardSelectedStudentId}
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
            onTransactionsChange={setFeeTransactions}
            transactions={feeTransactions}
            onAuditLog={addAuditLog}
            currentAdmin={currentAdmin}
            showPendingOnly={feeFilter === "pending"}
          />
        );
      case "teachers":
        return (
          <AdminTeacher
            teachers={teachers}
            onTeachersChange={setTeachers}
            onAuditLog={addAuditLog}
            currentAdmin={currentAdmin}
            initialSection={teacherSection}
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
            teachers={teachers}
            allocations={plannerAllocations}
            classOptions={classOptions}
            subjectOptions={subjectOptions}
            onAllocationsChange={setPlannerAllocations}
          />
        );
      case "create-class":
        return (
          <AdminCreateClass
            classes={customClasses}
            classSubjects={classSubjects}
            teachers={teachers}
            students={students}
            courses={COURSES}
            onAddClass={(value) => {
              setCustomClasses((prev) => [...prev, value]);
              setClassSubjects((prev) => ({ ...prev, [value]: prev[value] ?? [] }));
            }}
            onDeleteClass={(value) => {
              setCustomClasses((prev) => prev.filter((item) => item !== value));
              setClassSubjects((prev) => {
                const next = { ...prev };
                delete next[value];
                return next;
              });
            }}
            onAddSubject={(className, value) =>
              setClassSubjects((prev) => ({
                ...prev,
                [className]: [...(prev[className] ?? []), value],
              }))
            }
            onDeleteSubject={(className, value) =>
              setClassSubjects((prev) => ({
                ...prev,
                [className]: (prev[className] ?? []).filter((item) => item !== value),
              }))
            }
          />
        );
      case "attendance":
        return <AdminAttendance students={students} />;
      case "leave-requests":
        return <AdminLeaveRequests onPendingCountChange={setPendingLeaves} />;
      case "announcements":
        return (
          <AdminAnnouncements
            announcements={announcements}
            students={students}
            onAnnouncementsChange={setAnnouncements}
          />
        );
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
      onNavChange={(id) => {
        handleNavChange(id);
      }}
      notificationSlot={<></>}
    >

      {/* Main content area with consistent card styling */}
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
        {renderContent()}
      </div>
    </PortalLayout>
  );
};

export default AdminPortal;
