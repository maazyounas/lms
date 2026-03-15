import { useState, useRef, useEffect } from "react";
import { Bell, FileText, Megaphone, CheckCircle, Plus, X } from "lucide-react";
import { ANNOUNCEMENTS, TEACHER_ASSIGNMENTS, STUDENTS, type Teacher } from "@/data/mockData";
import { toast } from "sonner";

interface Props {
  teacher: Teacher;
  onNavigate: (nav: string) => void;
}

interface Notification {
  id: string;
  type: "assignment" | "announcement" | "teacher-announcement";
  title: string;
  description: string;
  date: string;
  read: boolean;
  targetNav: string;
}

interface TeacherAnnouncement {
  id: string;
  title: string;
  content: string;
  target: {
    type: "all" | "classes" | "students";
    classes?: string[];
    students?: number[]; // student IDs
  };
  date: string;
}

const TeacherNotifications = ({ teacher, onNavigate }: Props) => {
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [teacherAnnouncements, setTeacherAnnouncements] = useState<TeacherAnnouncement[]>([]);

  // Form state for new announcement
  const [form, setForm] = useState({
    title: "",
    content: "",
    targetType: "all" as "all" | "classes" | "students",
    selectedClasses: [] as string[],
    selectedStudents: [] as number[],
  });

  // Build notifications from assignments, system announcements, and teacher's own announcements
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const myAssignments = TEACHER_ASSIGNMENTS.filter((a) => a.subject === teacher.subject);
    const assignmentNotifs: Notification[] = myAssignments.flatMap((a) =>
      a.submissions
        .filter((s) => s.status === "Submitted" || s.status === "Late")
        .map((s) => ({
          id: `sub-${a.id}-${s.studentId}`,
          type: "assignment",
          title: `${s.studentName} submitted "${a.title}"`,
          description: `${s.status} · Class ${a.classGrade}`,
          date: s.submittedDate || a.dueDate,
          read: false,
          targetNav: "assignments",
        }))
    );

    const announcementNotifs: Notification[] = ANNOUNCEMENTS.slice(0, 3).map((a) => ({
      id: `ann-${a.id}`,
      type: "announcement",
      title: a.title,
      description: a.content.slice(0, 60) + "...",
      date: a.date,
      read: false,
      targetNav: "announcements",
    }));

    return [...assignmentNotifs, ...announcementNotifs].sort((a, b) => b.date.localeCompare(a.date));
  });

  // Update notifications when teacher creates a new announcement
  useEffect(() => {
    const teacherNotifs: Notification[] = teacherAnnouncements.map((a) => ({
      id: `teacher-ann-${a.id}`,
      type: "teacher-announcement",
      title: `You announced: ${a.title}`,
      description: a.content.slice(0, 60) + "...",
      date: a.date,
      read: false,
      targetNav: "announcements",
    }));

    setNotifications((prev) => {
      const filtered = prev.filter((n) => !n.id.startsWith("teacher-ann-"));
      return [...teacherNotifs, ...filtered].sort((a, b) => b.date.localeCompare(a.date));
    });
  }, [teacherAnnouncements]);

  const ref = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close modal when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) setModalOpen(false);
    };
    if (modalOpen) {
      document.addEventListener("mousedown", handler);
    }
    return () => document.removeEventListener("mousedown", handler);
  }, [modalOpen]);

  const handleClick = (n: Notification) => {
    setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    onNavigate(n.targetNav);
    setOpen(false);
  };

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  // Get teacher's classes and students
  const teacherClasses = teacher.classes || [];
  const studentsInTeacherClasses = STUDENTS.filter((s) => teacherClasses.includes(s.grade));

  const handleCreateAnnouncement = () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    let targetDescription = "";
    if (form.targetType === "all") {
      targetDescription = `All students in ${teacherClasses.join(", ")}`;
    } else if (form.targetType === "classes") {
      if (form.selectedClasses.length === 0) {
        toast.error("Select at least one class");
        return;
      }
      targetDescription = `Classes: ${form.selectedClasses.join(", ")}`;
    } else {
      if (form.selectedStudents.length === 0) {
        toast.error("Select at least one student");
        return;
      }
      const studentNames = studentsInTeacherClasses
        .filter((s) => form.selectedStudents.includes(s.id))
        .map((s) => s.name)
        .join(", ");
      targetDescription = `Students: ${studentNames}`;
    }

    const newAnnouncement: TeacherAnnouncement = {
      id: Date.now().toString(),
      title: form.title,
      content: form.content,
      target: {
        type: form.targetType,
        classes: form.targetType === "classes" ? form.selectedClasses : undefined,
        students: form.targetType === "students" ? form.selectedStudents : undefined,
      },
      date: new Date().toISOString().split("T")[0],
    };

    setTeacherAnnouncements((prev) => [newAnnouncement, ...prev]);

    toast.success(`Announcement sent to ${targetDescription}`);

    // Reset form and close modal
    setForm({ title: "", content: "", targetType: "all", selectedClasses: [], selectedStudents: [] });
    setModalOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative text-muted-foreground hover:text-foreground transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <CheckCircle className="h-3 w-3" /> Mark all read
                </button>
              )}
              <button
                onClick={() => setModalOpen(true)}
                className="text-xs text-primary hover:underline flex items-center gap-1"
                title="Create Announcement"
              >
                <Plus className="h-3 w-3" /> Create
              </button>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No notifications</p>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`w-full text-left px-4 py-3 border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${
                    !n.read ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`mt-0.5 h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${
                        n.type === "assignment"
                          ? "bg-info/15 text-info"
                          : n.type === "teacher-announcement"
                          ? "bg-success/15 text-success"
                          : "bg-warning/15 text-warning"
                      }`}
                    >
                      {n.type === "assignment" ? (
                        <FileText className="h-3.5 w-3.5" />
                      ) : (
                        <Megaphone className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs ${
                          !n.read ? "font-semibold text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {n.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{n.description}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{n.date}</p>
                    </div>
                    {!n.read && <div className="h-2 w-2 rounded-full bg-primary mt-1 shrink-0" />}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Create Announcement Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div
            ref={modalRef}
            className="bg-card border border-border rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Create Announcement</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  placeholder="Announcement title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Content</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={4}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none"
                  placeholder="Write your announcement..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Target Audience</label>
                <select
                  value={form.targetType}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      targetType: e.target.value as "all" | "classes" | "students",
                      selectedClasses: [],
                      selectedStudents: [],
                    })
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All Students (in my classes)</option>
                  <option value="classes">Specific Classes</option>
                  <option value="students">Specific Students</option>
                </select>
              </div>

              {form.targetType === "classes" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Select Classes</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto border border-border rounded-lg p-2">
                    {teacherClasses.map((cls) => (
                      <label key={cls} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={form.selectedClasses.includes(cls)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm({ ...form, selectedClasses: [...form.selectedClasses, cls] });
                            } else {
                              setForm({
                                ...form,
                                selectedClasses: form.selectedClasses.filter((c) => c !== cls),
                              });
                            }
                          }}
                        />
                        {cls}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {form.targetType === "students" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Select Students</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto border border-border rounded-lg p-2">
                    {studentsInTeacherClasses.map((student) => (
                      <label key={student.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={form.selectedStudents.includes(student.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm({
                                ...form,
                                selectedStudents: [...form.selectedStudents, student.id],
                              });
                            } else {
                              setForm({
                                ...form,
                                selectedStudents: form.selectedStudents.filter((id) => id !== student.id),
                              });
                            }
                          }}
                        />
                        {student.name} ({student.grade})
                      </label>
                    ))}
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
        </div>
      )}
    </div>
  );
};

export default TeacherNotifications;
