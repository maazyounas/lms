import { useState, useRef, useEffect } from "react";
import { Bell, ClipboardList, Megaphone, X } from "lucide-react";
import { ANNOUNCEMENTS } from "@/data/mockData";
import type { Student } from "@/data/mockData";

interface Notification {
  id: string;
  title: string;
  description: string;
  type: "assignment" | "announcement";
  date: string;
  read: boolean;
  targetNav: string;
}

function generateNotifications(student: Student): Notification[] {
  const notifs: Notification[] = [];

  // Pending/new assignments
  student.assignments
    .filter((a) => a.status === "Pending")
    .forEach((a, i) => {
      notifs.push({
        id: `asgn-${i}`,
        title: `Assignment Due: ${a.title}`,
        description: `${a.subject} — Due ${a.due}`,
        type: "assignment",
        date: a.due,
        read: false,
        targetNav: "assignments",
      });
    });

  // Recent announcements
  ANNOUNCEMENTS.slice(0, 3).forEach((a) => {
    notifs.push({
      id: `ann-${a.id}`,
      title: a.title,
      description: a.content.slice(0, 80) + "...",
      type: "announcement",
      date: a.date,
      read: false,
      targetNav: "announcements",
    });
  });

  return notifs;
}

interface Props {
  student: Student;
  onNavigate: (nav: string) => void;
}

const NotificationBell = ({ student, onNavigate }: Props) => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(() => generateNotifications(student));
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleNotifClick = (notif: Notification) => {
    setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)));
    onNavigate(notif.targetNav);
    setOpen(false);
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
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
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="font-semibold text-foreground text-sm">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                  Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto scrollbar-thin">
            {notifications.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground text-center">No notifications</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleNotifClick(n)}
                  className={`w-full text-left px-4 py-3 hover:bg-muted/30 transition-colors border-b border-border last:border-0 ${
                    !n.read ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                      n.type === "assignment" ? "bg-warning/15 text-warning" : "bg-info/15 text-info"
                    }`}>
                      {n.type === "assignment" ? <ClipboardList className="h-4 w-4" /> : <Megaphone className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm ${!n.read ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{n.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{n.date}</p>
                    </div>
                    {!n.read && <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />}
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

export default NotificationBell;
