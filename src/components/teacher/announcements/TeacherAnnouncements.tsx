import { useState } from "react";
import { toast } from "sonner";
import type { Announcement, Student } from "@/data/mockData";

type SentAnnouncement = {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  targetLabel: string;
};

type Props = {
  senderName: string;
  classes: string[];
  students: Student[];
  receivedAnnouncements: Announcement[];
  allStudentsLabel?: string;
  onAnnouncementCreated?: (announcement: Announcement) => void;
  hideReceived?: boolean;
  lockTargetAll?: boolean;
};

const TeacherAnnouncements = ({
  senderName,
  classes,
  students,
  receivedAnnouncements,
  allStudentsLabel = "All Students (in my classes)",
  onAnnouncementCreated,
  hideReceived = false,
  lockTargetAll = false,
}: Props) => {
  const [sentAnnouncements, setSentAnnouncements] = useState<SentAnnouncement[]>([]);
  const [announceForm, setAnnounceForm] = useState({
    title: "",
    content: "",
    targetType: "all" as "all" | "classes" | "students",
    selectedClasses: [] as string[],
    selectedStudents: [] as number[],
    studentClassFilter: "all",
  });

  const filteredStudents =
    announceForm.studentClassFilter === "all"
      ? students
      : students.filter((s) => s.grade === announceForm.studentClassFilter);

  const handleCreateAnnouncement = () => {
    if (!announceForm.title.trim() || !announceForm.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    let targetLabel = "";
    if (lockTargetAll || announceForm.targetType === "all") {
      targetLabel =
        classes.length > 0
          ? `All students in ${classes.join(", ")}`
          : "All students";
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
      const studentNames = students
        .filter((s) => announceForm.selectedStudents.includes(s.id))
        .map((s) => s.name)
        .join(", ");
      targetLabel = `Students: ${studentNames}`;
    }

    const newAnnouncement: SentAnnouncement = {
      id: Date.now().toString(),
      title: announceForm.title,
      content: announceForm.content,
      date: new Date().toISOString().split("T")[0],
      author: senderName,
      targetLabel,
    };

    setSentAnnouncements((prev) => [newAnnouncement, ...prev]);
    onAnnouncementCreated?.({
      id: Date.now(),
      title: announceForm.title,
      date: newAnnouncement.date,
      priority: "medium",
      content: announceForm.content,
      author: senderName,
    });
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Announcements</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Create and manage announcements for your students.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            {!lockTargetAll && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Target Audience
                </label>
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
                  <option value="all">{allStudentsLabel}</option>
                  <option value="classes">Specific Classes</option>
                  <option value="students">Specific Students</option>
                </select>
              </div>
            )}

            {!lockTargetAll && announceForm.targetType === "classes" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Select Classes
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-border rounded-lg p-2">
                  {classes.map((cls) => (
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
                  {classes.length === 0 && (
                    <p className="text-xs text-muted-foreground">No classes available.</p>
                  )}
                </div>
              </div>
            )}

            {!lockTargetAll && announceForm.targetType === "students" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Class Filter
                  </label>
                  <select
                    value={announceForm.studentClassFilter}
                    onChange={(e) =>
                      setAnnounceForm({ ...announceForm, studentClassFilter: e.target.value })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="all">All Classes</option>
                    {classes.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Select Students
                  </label>
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

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Sent Announcements</h3>
            {sentAnnouncements.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No sent announcements yet.
              </p>
            ) : (
              <div className="space-y-3">
                {sentAnnouncements.map((a) => (
                  <div
                    key={a.id}
                    className="p-4 rounded-xl border border-border bg-muted/10 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-success mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground text-sm">{a.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {a.content}
                        </p>
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

          {!hideReceived && (
            <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Received Announcements
              </h3>
              <div className="space-y-3">
              {receivedAnnouncements.map((a) => (
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
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {a.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {a.date} · {a.author}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {receivedAnnouncements.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No announcements received yet.
                </p>
              )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default TeacherAnnouncements;

