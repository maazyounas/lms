import { useMemo, useState } from "react";
import { toast } from "sonner";

interface Props {
  classes: string[];
  classSubjects: Record<string, string[]>;
  onAddClass: (value: string) => void;
  onDeleteClass: (value: string) => void;
  onAddSubject: (className: string, value: string) => void;
  onDeleteSubject: (className: string, value: string) => void;
}

const AdminCreateClass = ({
  classes,
  classSubjects,
  onAddClass,
  onDeleteClass,
  onAddSubject,
  onDeleteSubject,
}: Props) => {
  const [newClassName, setNewClassName] = useState("");
  const [newSubjectName, setNewSubjectName] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  const normalizedClasses = useMemo(
    () => classes.map((item) => item.trim()).filter(Boolean),
    [classes]
  );
  const normalizedSubjects = useMemo(() => {
    if (!selectedClass) return [];
    const subjects = classSubjects[selectedClass] ?? [];
    return subjects.map((item) => item.trim()).filter(Boolean);
  }, [classSubjects, selectedClass]);

  const handleAddClass = () => {
    const value = newClassName.trim();
    if (!value) {
      toast.error("Enter a class name.");
      return;
    }
    if (normalizedClasses.some((c) => c.toLowerCase() === value.toLowerCase())) {
      toast.error("Class already exists.");
      return;
    }
    onAddClass(value);
    setNewClassName("");
    setSelectedClass(value);
    toast.success("New class added.");
  };

  const handleAddSubject = () => {
    const value = newSubjectName.trim();
    if (!selectedClass) {
      toast.error("Select a class first.");
      return;
    }
    if (!value) {
      toast.error("Enter a subject name.");
      return;
    }
    if (normalizedSubjects.some((s) => s.toLowerCase() === value.toLowerCase())) {
      toast.error("Subject already exists.");
      return;
    }
    onAddSubject(selectedClass, value);
    setNewSubjectName("");
    toast.success("New subject added.");
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Create Classes & Subjects</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Add new classes and subjects to use in the timetable planner.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <p className="font-semibold text-foreground">Add New Class</p>
          <div className="flex gap-2">
            <input
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="e.g. 12-A"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <button
              onClick={handleAddClass}
              className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
            >
              Add Class
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <p className="font-semibold text-foreground">Add New Subject</p>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">Select Class</option>
            {normalizedClasses.map((item) => (
              <option key={`select-${item}`} value={item}>
                {item}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              placeholder="e.g. Pak Studies"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
              disabled={!selectedClass}
            />
            <button
              onClick={handleAddSubject}
              disabled={!selectedClass}
              className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
            >
              Add Subject
            </button>
          </div>
          {!selectedClass && (
            <p className="text-xs text-muted-foreground">
              Select a class to add subjects.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-foreground">Created Classes</p>
            <span className="text-xs text-muted-foreground">
              {normalizedClasses.length} total
            </span>
          </div>
          {normalizedClasses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No classes created yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {normalizedClasses.map((item) => (
                <div
                  key={`class-${item}`}
                  className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedClass === item) {
                        setSelectedClass("");
                      }
                      onDeleteClass(item);
                    }}
                    className="rounded-full border border-border px-2 py-0.5 text-[10px]"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-foreground">
              {selectedClass ? `Subjects for ${selectedClass}` : "Subjects"}
            </p>
            <span className="text-xs text-muted-foreground">
              {normalizedSubjects.length} total
            </span>
          </div>
          {!selectedClass ? (
            <p className="text-sm text-muted-foreground">Select a class to view subjects.</p>
          ) : normalizedSubjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No subjects created yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {normalizedSubjects.map((item) => (
                <div
                  key={`subject-${item}`}
                  className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => onDeleteSubject(selectedClass, item)}
                    className="rounded-full border border-border px-2 py-0.5 text-[10px]"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCreateClass;
