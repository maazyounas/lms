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
import { toast } from "sonner";
import TeacherDashboard from "@/components/teacher/dashboard/TeacherDashboard";
import TeacherClasses from "@/components/teacher/classes/TeacherClasses";
import TeacherProfile from "@/components/teacher/profile/TeacherProfile";
import TeacherLeave from "@/components/teacher/leave/TeacherLeave";
import TeacherAssignments from "@/components/teacher/assignments/TeacherAssignments";
import TeacherNotifications from "@/components/teacher/notifications/TeacherNotifications";
import TeacherCreateQuiz from "@/components/teacher/quizzes/TeacherCreateQuiz";
import AdminAttendance from "@/components/admin/attendance/AdminAttendance";
import AdminParentCommunication from "@/components/admin/communication/AdminParentCommunication";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "classes", label: "My Classes", icon: BookOpen },
  { id: "assignments", label: "Assignments", icon: ClipboardList },
  { id: "attendance", label: "Attendance", icon: CalendarCheck },
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
  const [teacherAnnouncements, setTeacherAnnouncements] = useState<
    { id: string; title: string; content: string; date: string; author: string; targetLabel: string }[]
  >([]);
  const [announceForm, setAnnounceForm] = useState({
    title: "",
    content: "",
    targetType: "all" as "all" | "classes" | "students",
    selectedClasses: [] as string[],
    selectedStudents: [] as number[],
    studentClassFilter: "all",
  });
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
        return <AdminAttendance students={myStudents} />;
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
        const filteredStudents =
          announceForm.studentClassFilter === "all"
            ? studentsInTeacherClasses
            : studentsInTeacherClasses.filter((s) => s.grade === announceForm.studentClassFilter);

        const handleCreateAnnouncement = () => {
          if (!announceForm.title.trim() || !announceForm.content.trim()) {
            toast.error("Title and content are required");
            return;
          }

          let targetLabel = "";
          if (announceForm.targetType === "all") {
            targetLabel = `All students in ${teacherClasses.join(", ")}`;
          } else if (announceForm.targetType === "classes") {
            if (announceForm.selectedClasses.length === 0) {
              toast.error("Select at least one class");
              return;
            }
            targetLabel = `Classes: ${announceForm.selectedClasses.join(", ")}`;
          } else {
            if (announceForm.selectedStudents.length === 0) {
              toast.error("Select at least one student");
              return;
            }
            const studentNames = studentsInTeacherClasses
              .filter((s) => announceForm.selectedStudents.includes(s.id))
              .map((s) => s.name)
              .join(", ");
            targetLabel = `Students: ${studentNames}`;
          }

          const newAnnouncement = {
            id: Date.now().toString(),
            title: announceForm.title,
            content: announceForm.content,
            date: new Date().toISOString().split("T")[0],
            author: teacher.name,
            targetLabel,
          };

          setTeacherAnnouncements((prev) => [newAnnouncement, ...prev]);
          toast.success(`Announcement sent to ${targetLabel}`);

          setAnnounceForm({
            title: "",
            content: "",
            targetType: "all",
            selectedClasses: [],
            selectedStudents: [],
            studentClassFilter: "all",
          });
        };

        return (
          <div className="space-y-6">
            {/* Page Header */}
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Announcements</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Create and manage announcements for your students.
              </p>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Create Announcement Card */}
              <div className="bg-card border border-border rounded-2xl shadow-sm p-6 h-fit">
                <h3 className="text-lg font-semibold text-foreground mb-4">Send Announcement</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Title</label>
                    <input
                      type="text"
                      value={announceForm.title}
                      onChange={(e) => setAnnounceForm({ ...announceForm, title: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Announcement title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Content</label>
                    <textarea
                      value={announceForm.content}
                      onChange={(e) => setAnnounceForm({ ...announceForm, content: e.target.value })}
                      rows={4}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Write your announcement..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Target Audience</label>
                    <select
                      value={announceForm.targetType}
                      onChange={(e) =>
                        setAnnounceForm({
                          ...announceForm,
                          targetType: e.target.value as "all" | "classes" | "students",
                          selectedClasses: [],
                          selectedStudents: [],
                          studentClassFilter: "all",
                        })
                      }
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="all">All Students (in my classes)</option>
                      <option value="classes">Specific Classes</option>
                      <option value="students">Specific Students</option>
                    </select>
                  </div>

                  {announceForm.targetType === "classes" && (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Select Classes</label>
                      <div className="space-y-2 max-h-40 overflow-y-auto border border-border rounded-lg p-2">
                        {teacherClasses.map((cls) => (
                          <label key={cls} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={announceForm.selectedClasses.includes(cls)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setAnnounceForm({
                                    ...announceForm,
                                    selectedClasses: [...announceForm.selectedClasses, cls],
                                  });
                                } else {
                                  setAnnounceForm({
                                    ...announceForm,
                                    selectedClasses: announceForm.selectedClasses.filter((c) => c !== cls),
                                  });
                                }
                              }}
                              className="rounded border-border"
                            />
                            {cls}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {announceForm.targetType === "students" && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Class Filter</label>
                        <select
                          value={announceForm.studentClassFilter}
                          onChange={(e) =>
                            setAnnounceForm({ ...announceForm, studentClassFilter: e.target.value })
                          }
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="all">All My Classes</option>
                          {teacherClasses.map((cls) => (
                            <option key={cls} value={cls}>
                              {cls}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Select Students</label>
                        <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-lg p-2">
                          {filteredStudents.map((student) => (
                            <label key={student.id} className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={announceForm.selectedStudents.includes(student.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setAnnounceForm({
                                      ...announceForm,
                                      selectedStudents: [...announceForm.selectedStudents, student.id],
                                    });
                                  } else {
                                    setAnnounceForm({
                                      ...announceForm,
                                      selectedStudents: announceForm.selectedStudents.filter(
                                        (id) => id !== student.id
                                      ),
                                    });
                                  }
                                }}
                                className="rounded border-border"
                              />
                              {student.name} ({student.grade})
                            </label>
                          ))}
                          {filteredStudents.length === 0 && (
                            <p className="text-xs text-muted-foreground">No students in this class.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleCreateAnnouncement}
                    className="w-full bg-primary text-primary-foreground py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Send Announcement
                  </button>
                </div>
              </div>

              {/* Announcements Lists */}
              <div className="space-y-6">
                {/* Sent Announcements */}
                <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Sent Announcements</h3>
                  {teacherAnnouncements.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">No sent announcements yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {teacherAnnouncements.map((a) => (
                        <div
                          key={a.id}
                          className="p-4 rounded-xl border border-border bg-muted/10 hover:border-primary/30 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="h-2 w-2 rounded-full bg-success mt-1.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-foreground text-sm">{a.title}</h4>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{a.content}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {a.date} · {a.author} · {a.targetLabel}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Received Announcements */}
                <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Received Announcements</h3>
                  <div className="space-y-3">
                    {ANNOUNCEMENTS.map((a) => (
                      <div
                        key={a.id}
                        className="p-4 rounded-xl border border-border bg-muted/10 hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${
                              a.priority === "high"
                                ? "bg-destructive"
                                : a.priority === "medium"
                                ? "bg-warning"
                                : "bg-muted-foreground"
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground text-sm">{a.title}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{a.content}</p>
                            <p className="text-xs text-muted-foreground mt-1">{a.date} · {a.author}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
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