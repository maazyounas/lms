import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { ANNOUNCEMENTS, type Announcement } from "@/data/mockData";
import { toast } from "sonner";

interface Props {
  onAnnouncementsChange?: (announcements: Announcement[]) => void;
}

const AdminAnnouncements = ({ onAnnouncementsChange }: Props) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>(ANNOUNCEMENTS);
  const [newAnn, setNewAnn] = useState({
    title: "",
    priority: "medium" as "low" | "medium" | "high",
    content: "",
  });

  const createAnnouncement = () => {
    if (!newAnn.title.trim() || !newAnn.content.trim()) {
      toast.error("Title and content are required.");
      return;
    }

    const nextId = announcements.length
      ? Math.max(...announcements.map((a) => a.id)) + 1
      : 1;
    const next = [
      {
        id: nextId,
        title: newAnn.title,
        content: newAnn.content,
        priority: newAnn.priority,
        author: "Admin Office",
        date: new Date().toISOString().slice(0, 10),
      },
      ...announcements,
    ];

    setAnnouncements(next);
    onAnnouncementsChange?.(next);
    setNewAnn({ title: "", priority: "medium", content: "" });
    toast.success("Announcement published.");
  };

  const removeAnnouncement = (id: number) => {
    const next = announcements.filter((a) => a.id !== id);
    setAnnouncements(next);
    onAnnouncementsChange?.(next);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-5">Announcements</h1>
      <div className="rounded-xl border border-border bg-card p-4 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            value={newAnn.title}
            onChange={(e) => setNewAnn((p) => ({ ...p, title: e.target.value }))}
            placeholder="Title"
            className="sm:col-span-2 border border-border rounded-lg px-3 py-2 text-sm bg-muted/30"
          />
          <select
            value={newAnn.priority}
            onChange={(e) =>
              setNewAnn((p) => ({
                ...p,
                priority: e.target.value as "low" | "medium" | "high",
              }))
            }
            className="border border-border rounded-lg px-3 py-2 text-sm bg-muted/30"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <textarea
          value={newAnn.content}
          onChange={(e) => setNewAnn((p) => ({ ...p, content: e.target.value }))}
          rows={3}
          placeholder="Content"
          className="w-full mt-3 border border-border rounded-lg px-3 py-2 text-sm bg-muted/30 resize-none"
        />
        <button
          onClick={createAnnouncement}
          className="mt-3 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Publish
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
    </div>
  );
};

export default AdminAnnouncements;
