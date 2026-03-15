import { Plus, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Course, StudyMaterial } from "@/data/mockData";
import { materialIcon } from "../classUtils";
import { toast } from "sonner";

interface Props {
  selectedClass: Course;
  onUpdateDescription: (value: string) => void;
  onAddMaterial: (material: Omit<StudyMaterial, "id">) => void;
}

const OverviewTab = ({ selectedClass, onUpdateDescription, onAddMaterial }: Props) => {
  const [overviewDraft, setOverviewDraft] = useState(selectedClass.description || "");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    setOverviewDraft(selectedClass.description || "");
  }, [selectedClass.id, selectedClass.description]);

  const isOverviewDirty = useMemo(
    () => overviewDraft !== (selectedClass.description || ""),
    [overviewDraft, selectedClass.description],
  );

  const canSaveOverview = useMemo(
    () => isOverviewDirty && overviewDraft.trim().length > 0,
    [isOverviewDirty, overviewDraft],
  );

  const canAdd = useMemo(() => {
    const hasTitle = title.trim().length > 0;
    const hasFile = !!file;
    const hasUrl = url.trim().length > 0;
    return hasTitle && (hasFile !== hasUrl);
  }, [title, file, url]);

  const inferFileType = (name: string): StudyMaterial["type"] => {
    const ext = name.split(".").pop()?.toLowerCase() || "";
    if (ext === "pdf") return "pdf";
    if (ext === "doc" || ext === "docx") return "doc";
    if (ext === "ppt" || ext === "pptx") return "ppt";
    return "note";
  };

  const isAllowedFile = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase() || "";
    return ["pdf", "doc", "docx", "ppt", "pptx"].includes(ext);
  };

  const handleSaveOverview = () => {
    if (!canSaveOverview) return;
    onUpdateDescription(overviewDraft.trim());
    toast.success("Overview saved.");
  };

  const handleAdd = () => {
    if (!canAdd) return;
    if (file && url.trim()) {
      toast.error("Please provide either a file or a URL, not both.");
      return;
    }
    if (file && !isAllowedFile(file.name)) {
      toast.error("Only PDF, Word, or PowerPoint files are allowed.");
      return;
    }
    const nextType = file ? inferFileType(file.name) : "link";
    const nextUrl = file ? URL.createObjectURL(file) : url.trim();
    onAddMaterial({
      title: title.trim(),
      type: nextType,
      url: nextUrl || undefined,
      content: content.trim() || undefined,
    });
    setTitle("");
    setUrl("");
    setContent("");
    setFile(null);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-4">Course Overview</h3>
      <label className="text-sm font-medium text-foreground">Overview</label>
      <textarea
        value={overviewDraft}
        onChange={(e) => setOverviewDraft(e.target.value)}
        placeholder="Write a brief course overview..."
        className="mt-2 w-full min-h-[110px] rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
      />
      <button
        onClick={handleSaveOverview}
        disabled={!canSaveOverview}
        className="mt-3 inline-flex items-center gap-2 rounded-lg border border-primary px-3 py-2 text-sm text-primary hover:bg-primary/10 disabled:opacity-50"
      >
        <Save className="h-4 w-4" /> Save Overview
      </button>

      <h4 className="font-medium text-foreground mb-3">Recent Materials</h4>
      {selectedClass.materials && selectedClass.materials.length > 0 ? (
        <div className="space-y-2">
          {selectedClass.materials.slice(0, 5).map((mat) => {
            const Icon = materialIcon(mat.type);
            return (
              <div key={mat.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="text-sm text-foreground">{mat.title}</span>
                </div>
                {mat.url && (
                  <a
                    href={mat.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm"
                  >
                    View
                  </a>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No materials added yet.</p>
      )}

      <div className="mt-6 border-t border-border pt-4">
        <h4 className="font-medium text-foreground mb-2">Add Material</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Material title"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
          <input
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="URL (optional)"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Short note/content (optional)"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={!canAdd}
          className="mt-3 inline-flex items-center gap-2 rounded-lg border border-primary px-3 py-2 text-sm text-primary hover:bg-primary/10 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> Add Material
        </button>
      </div>
    </div>
  );
};

export default OverviewTab;
