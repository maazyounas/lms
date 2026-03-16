import { useMemo, useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { ANNOUNCEMENTS, STUDENTS, type Announcement } from "@/data/mockData";
import { toast } from "sonner";
import CreateAnnouncementModal from "@/components/teacher/notifications/components/CreateAnnouncementModal";
import useOutsideClick from "@/components/teacher/notifications/hooks/useOutsideClick";
import type { AnnouncementFormState } from "@/components/teacher/notifications/types";

interface Props {
  onAnnouncementsChange?: (announcements: Announcement[]) => void;
}

const AdminAnnouncements = ({ onAnnouncementsChange }: Props) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>(ANNOUNCEMENTS);
  const [modalOpen, setModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [form, setForm] = useState<AnnouncementFormState>({
    title: "",
    content: "",
    targetType: "all",
    selectedClasses: [],
    selectedStudents: [],
  });

  const createAnnouncement = () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content are required.");
      return;
    }

    if (form.targetType === "classes" && form.selectedClasses.length === 0) {
      toast.error("Select at least one class");
      return;
    }

    if (form.targetType === "students" && form.selectedStudents.length === 0) {
      toast.error("Select at least one student");
      return;
    }

    const nextId = announcements.length
      ? Math.max(...announcements.map((a) => a.id)) + 1
      : 1;
    const next = [
      {
        id: nextId,
        title: form.title,
        content: form.content,
        priority,
        author: "Admin Office",
        date: new Date().toISOString().slice(0, 10),
      },
      ...announcements,
    ];

    setAnnouncements(next);
    onAnnouncementsChange?.(next);
    setForm({
      title: "",
      content: "",
      targetType: "all",
      selectedClasses: [],
      selectedStudents: [],
    });
    setPriority("medium");
    setModalOpen(false);
    toast.success("Announcement published.");
  };

  const removeAnnouncement = (id: number) => {
    const next = announcements.filter((a) => a.id !== id);
    setAnnouncements(next);
    onAnnouncementsChange?.(next);
  };

  const teacherClasses = useMemo(
    () => Array.from(new Set(STUDENTS.map((student) => student.grade))),
    []
  );
  const studentsInTeacherClasses = useMemo(() => STUDENTS, []);

  useOutsideClick(modalRef, () => setModalOpen(false), modalOpen);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-foreground">Announcements</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create
        </button>
      </div>

      <div className="space-y-3">
        {announcements.map((a) => (
          <div
            key={a.id}
            className="rounded-xl border border-border bg-card p-4 flex items-start justify-between gap-3"
          >
            <div>
              <p className="font-semibold text-foreground">{a.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{a.content}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {a.date} | {a.author}
              </p>
            </div>
            <button
              onClick={() => removeAnnouncement(a.id)}
              className="px-2 py-1 rounded bg-destructive text-destructive-foreground"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      <CreateAnnouncementModal
        open={modalOpen}
        modalRef={modalRef}
        form={form}
        teacherClasses={teacherClasses}
        studentsInTeacherClasses={studentsInTeacherClasses}
        showPriority
        priority={priority}
        onPriorityChange={setPriority}
        onClose={() => setModalOpen(false)}
        onFormChange={setForm}
        onSubmit={createAnnouncement}
      />
    </div>
  );
};

export default AdminAnnouncements;
