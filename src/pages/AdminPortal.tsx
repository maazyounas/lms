import { useEffect, useMemo, useRef, useState } from "react";
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
import {
  ANNOUNCEMENTS,
  STUDENTS,
  TEACHERS,
  COURSES,
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
import AdminTeacher from "@/components/admin/teacher/AdminTeacher";
import type { AdminTeacherRecord } from "@/components/admin/teacher/types";
import AdminParentCommunication from "@/components/admin/communication/AdminParentCommunication";
import AdminTimetablePlanner from "@/components/admin/planner/AdminTimetablePlanner";
import AdminCreateClass from "@/components/admin/create-class/AdminCreateClass";
import type {
  AuditLogEntry,
  FeeTransaction,
  PlannerAllocation,
} from "@/components/admin/types";

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
  const [activeNav, setActiveNav] = useState("dashboard");
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
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const raw = localStorage.getItem("announcements");
    if (!raw) return ANNOUNCEMENTS;
    try {
      const parsed = JSON.parse(raw) as Announcement[];
      return Array.isArray(parsed) ? parsed : ANNOUNCEMENTS;
    } catch {
      return ANNOUNCEMENTS;
    }
  });
  const [students, setStudents] = useState<Student[]>(() => {
    const raw = localStorage.getItem("students");
    if (!raw) return STUDENTS;
    try {
      const parsed = JSON.parse(raw) as Student[];
      return Array.isArray(parsed) ? parsed : STUDENTS;
    } catch {
      return STUDENTS;
    }
  });
  const [teachers, setTeachers] = useState<AdminTeacherRecord[]>(() => {
    const raw = localStorage.getItem("teachers");
    if (!raw) return TEACHERS as AdminTeacherRecord[];
    try {
      const parsed = JSON.parse(raw) as AdminTeacherRecord[];
      return Array.isArray(parsed) ? parsed : (TEACHERS as AdminTeacherRecord[]);
    } catch {
      return TEACHERS as AdminTeacherRecord[];
    }
  });
  const [feeTransactions, setFeeTransactions] = useState<FeeTransaction[]>(() => {
    const raw = localStorage.getItem("fee-transactions");
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as FeeTransaction[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const raw = localStorage.getItem("audit-logs");
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as AuditLogEntry[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [plannerAllocations, setPlannerAllocations] = useState<PlannerAllocation[]>(() => {
    const raw = localStorage.getItem("planner-allocations");
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as PlannerAllocation[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [customClasses, setCustomClasses] = useState<string[]>(() => {
    const raw = localStorage.getItem("custom-classes");
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as string[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [classSubjects, setClassSubjects] = useState<Record<string, string[]>>(() => {
    const raw = localStorage.getItem("class-subjects");
    if (!raw) return {};
    try {
      const parsed = JSON.parse(raw) as Record<string, string[]>;
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  });
  const currentAdmin = "Admin User";
  const stateRef = useRef({
    announcements,
    students,
    teachers,
    feeTransactions,
    auditLogs,
    plannerAllocations,
    customClasses,
    classSubjects,
  });

  const addAuditLog = (entry: Omit<AuditLogEntry, "id" | "createdAt">) => {
    const nextEntry: AuditLogEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
    };
    setAuditLogs((prev) => [nextEntry, ...prev]);
  };

  useEffect(() => {
    localStorage.setItem("announcements", JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem("students", JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem("teachers", JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem("fee-transactions", JSON.stringify(feeTransactions));
  }, [feeTransactions]);

  useEffect(() => {
    localStorage.setItem("audit-logs", JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem("planner-allocations", JSON.stringify(plannerAllocations));
  }, [plannerAllocations]);

  useEffect(() => {
    localStorage.setItem("custom-classes", JSON.stringify(customClasses));
  }, [customClasses]);

  useEffect(() => {
    localStorage.setItem("class-subjects", JSON.stringify(classSubjects));
  }, [classSubjects]);

  useEffect(() => {
    stateRef.current = {
      announcements,
      students,
      teachers,
      feeTransactions,
      auditLogs,
      plannerAllocations,
      customClasses,
      classSubjects,
    };
  }, [
    announcements,
    students,
    teachers,
    feeTransactions,
    auditLogs,
    plannerAllocations,
    customClasses,
    classSubjects,
  ]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      switch (event.key) {
        case "announcements": {
          const raw = localStorage.getItem("announcements");
          if (!raw) return;
          try {
            const parsed = JSON.parse(raw) as Announcement[];
            if (Array.isArray(parsed)) setAnnouncements(parsed);
          } catch {
            return;
          }
          break;
        }
        case "students": {
          const raw = localStorage.getItem("students");
          if (!raw) return;
          try {
            const parsed = JSON.parse(raw) as Student[];
            if (Array.isArray(parsed)) setStudents(parsed);
          } catch {
            return;
          }
          break;
        }
        case "teachers": {
          const raw = localStorage.getItem("teachers");
          if (!raw) return;
          try {
            const parsed = JSON.parse(raw) as AdminTeacherRecord[];
            if (Array.isArray(parsed)) setTeachers(parsed);
          } catch {
            return;
          }
          break;
        }
        case "fee-transactions": {
          const raw = localStorage.getItem("fee-transactions");
          if (!raw) return;
          try {
            const parsed = JSON.parse(raw) as FeeTransaction[];
            if (Array.isArray(parsed)) setFeeTransactions(parsed);
          } catch {
            return;
          }
          break;
        }
        case "audit-logs": {
          const raw = localStorage.getItem("audit-logs");
          if (!raw) return;
          try {
            const parsed = JSON.parse(raw) as AuditLogEntry[];
            if (Array.isArray(parsed)) setAuditLogs(parsed);
          } catch {
            return;
          }
          break;
        }
        case "planner-allocations": {
          const raw = localStorage.getItem("planner-allocations");
          if (!raw) return;
          try {
            const parsed = JSON.parse(raw) as PlannerAllocation[];
            if (Array.isArray(parsed)) setPlannerAllocations(parsed);
          } catch {
            return;
          }
          break;
        }
        case "custom-classes": {
          const raw = localStorage.getItem("custom-classes");
          if (!raw) return;
          try {
            const parsed = JSON.parse(raw) as string[];
            if (Array.isArray(parsed)) setCustomClasses(parsed);
          } catch {
            return;
          }
          break;
        }
        case "class-subjects": {
          const raw = localStorage.getItem("class-subjects");
          if (!raw) return;
          try {
            const parsed = JSON.parse(raw) as Record<string, string[]>;
            if (parsed && typeof parsed === "object") setClassSubjects(parsed);
          } catch {
            return;
          }
          break;
        }
        default:
          break;
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    const syncFromStorage = () => {
      const read = <T,>(key: string, fallback: T): T => {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        try {
          const parsed = JSON.parse(raw) as T;
          return parsed ?? fallback;
        } catch {
          return fallback;
        }
      };

      const announcementsRaw = localStorage.getItem("announcements");
      if (announcementsRaw && announcementsRaw !== JSON.stringify(stateRef.current.announcements)) {
        const parsed = read<Announcement[]>("announcements", []);
        if (Array.isArray(parsed)) setAnnouncements(parsed);
      }

      const studentsRaw = localStorage.getItem("students");
      if (studentsRaw && studentsRaw !== JSON.stringify(stateRef.current.students)) {
        const parsed = read<Student[]>("students", []);
        if (Array.isArray(parsed)) setStudents(parsed);
      }

      const teachersRaw = localStorage.getItem("teachers");
      if (teachersRaw && teachersRaw !== JSON.stringify(stateRef.current.teachers)) {
        const parsed = read<AdminTeacherRecord[]>("teachers", []);
        if (Array.isArray(parsed)) setTeachers(parsed);
      }

      const feeRaw = localStorage.getItem("fee-transactions");
      if (feeRaw && feeRaw !== JSON.stringify(stateRef.current.feeTransactions)) {
        const parsed = read<FeeTransaction[]>("fee-transactions", []);
        if (Array.isArray(parsed)) setFeeTransactions(parsed);
      }

      const auditRaw = localStorage.getItem("audit-logs");
      if (auditRaw && auditRaw !== JSON.stringify(stateRef.current.auditLogs)) {
        const parsed = read<AuditLogEntry[]>("audit-logs", []);
        if (Array.isArray(parsed)) setAuditLogs(parsed);
      }

      const plannerRaw = localStorage.getItem("planner-allocations");
      if (plannerRaw && plannerRaw !== JSON.stringify(stateRef.current.plannerAllocations)) {
        const parsed = read<PlannerAllocation[]>("planner-allocations", []);
        if (Array.isArray(parsed)) setPlannerAllocations(parsed);
      }

      const classesRaw = localStorage.getItem("custom-classes");
      if (classesRaw && classesRaw !== JSON.stringify(stateRef.current.customClasses)) {
        const parsed = read<string[]>("custom-classes", []);
        if (Array.isArray(parsed)) setCustomClasses(parsed);
      }

      const subjectsRaw = localStorage.getItem("class-subjects");
      if (subjectsRaw && subjectsRaw !== JSON.stringify(stateRef.current.classSubjects)) {
        const parsed = read<Record<string, string[]>>("class-subjects", {});
        if (parsed && typeof parsed === "object") setClassSubjects(parsed);
      }
    };

    const interval = window.setInterval(syncFromStorage, 3000);
    return () => window.clearInterval(interval);
  }, []);

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
                setActiveNav("students");
              }
            }}
            onOpenStudentSearch={() => {
              setStudentSection("search");
              setDashboardSelectedStudentId(null);
              setActiveNav("students");
            }}
            onOpenTeacherSearch={() => {
              setTeacherSection("search");
              setActiveNav("teachers");
            }}
            onOpenAnnouncements={() => setActiveNav("announcements")}
            onOpenLeaveRequests={() => setActiveNav("leave-requests")}
            onOpenFeeWithDues={() => {
              setFeeFilter("pending");
              setActiveNav("fee");
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
      onNavChange={(id) => {
        if (id === "fee") {
          setFeeFilter("all");
        }
        setActiveNav(id);
      }}
    >

      {/* Main content area with consistent card styling */}
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
        {renderContent()}
      </div>
    </PortalLayout>
  );
};

export default AdminPortal;
