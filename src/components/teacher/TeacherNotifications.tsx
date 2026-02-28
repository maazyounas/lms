import { useState, useRef, useEffect } from "react";
import { Bell, FileText, Megaphone, CheckCircle } from "lucide-react";
import { ANNOUNCEMENTS, TEACHER_ASSIGNMENTS, type Teacher } from "@/data/mockData";

interface Props {
  teacher: Teacher;
  onNavigate: (nav: string) => void;
}

interface Notification {
  id: string;
  type: "assignment" | "announcement";
  title: string;
  description: string;
  date: string;
  read: boolean;
  targetNav: string;
}

const TeacherNotifications = ({ teacher, onNavigate }: Props) => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const myAssignments = TEACHER_ASSIGNMENTS.filter((a) => a.subject === teacher.subject);
    const assignmentNotifs: Notification[] = myAssignments
      .flatMap((a) =>
        a.submissions
          .filter((s) => s.status === "Submitted" || s.status === "Late")
          .map((s) => ({
            id: `sub-${a.id}-${s.studentId}`,
            type: "assignment" as const,
            title: `${s.studentName} submitted "${a.title}"`,
            description: `${s.status} · Class ${a.classGrade}`,
            date: s.submittedDate || a.dueDate,
            read: false,
            targetNav: "assignments",
          }))
      );

    const announcementNotifs: Notification[] = ANNOUNCEMENTS.slice(0, 3).map((a) => ({
      id: `ann-${a.id}`,
      type: "announcement" as const,
      title: a.title,
      description: a.content.slice(0, 60) + "...",
      date: a.date,
      read: false,
      targetNav: "announcements",
    }));

    return [...assignmentNotifs, ...announcementNotifs].sort((a, b) => b.date.localeCompare(a.date));
  });

  const ref = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleClick = (n: Notification) => {
    setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    onNavigate(n.targetNav);
    setOpen(false);
  };

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="relative text-muted-foreground hover:text-foreground transition-colors">
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
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-primary hover:underline flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No notifications</p>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`w-full text-left px-4 py-3 border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${!n.read ? "bg-primary/5" : ""}`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`mt-0.5 h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${n.type === "assignment" ? "bg-info/15 text-info" : "bg-warning/15 text-warning"}`}>
                      {n.type === "assignment" ? <FileText className="h-3.5 w-3.5" /> : <Megaphone className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs ${!n.read ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{n.title}</p>
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
    </div>
  );
};

export default TeacherNotifications;
