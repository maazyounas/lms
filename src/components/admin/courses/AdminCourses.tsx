import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { TIMETABLE, type TimetableEntry } from "@/data/mockData";
import { toast } from "sonner";

type TimetableSlot = TimetableEntry & { id: number };

const emptyForm: TimetableEntry = { time: "", mon: "", tue: "", wed: "", thu: "", fri: "" };

const AdminCourses = () => {
  const [timetable, setTimetable] = useState<TimetableSlot[]>(
    TIMETABLE.map((x, i) => ({ ...x, id: i + 1 }))
  );
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [slotForm, setSlotForm] = useState<TimetableEntry>(emptyForm);

  const saveSlot = () => {
    if (!slotForm.time || !slotForm.mon || !slotForm.tue || !slotForm.wed || !slotForm.thu || !slotForm.fri) {
      toast.error("Fill all timetable fields.");
      return;
    }

    if (editingSlot) {
      setTimetable((prev) => prev.map((x) => (x.id === editingSlot ? { ...x, ...slotForm } : x)));
      toast.success("Timetable updated.");
    } else {
      const nextId = timetable.length ? Math.max(...timetable.map((x) => x.id)) + 1 : 1;
      setTimetable((prev) => [...prev, { id: nextId, ...slotForm }]);
      toast.success("Timetable slot added.");
    }
    setEditingSlot(null);
    setSlotForm(emptyForm);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-5">Courses & Schedule</h1>
      <div className="rounded-xl border border-border bg-card p-4 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(["time", "mon", "tue", "wed", "thu", "fri"] as (keyof TimetableEntry)[]).map((k) => (
            <input
              key={k}
              placeholder={k.toUpperCase()}
              value={slotForm[k]}
              onChange={(e) => setSlotForm((p) => ({ ...p, [k]: e.target.value }))}
              className="border border-border rounded-lg px-3 py-2 text-sm bg-muted/30"
            />
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={saveSlot}
            className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm flex items-center gap-2"
          >
            {editingSlot ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editingSlot ? "Update" : "Create"}
          </button>
          {editingSlot && (
            <button
              onClick={() => {
                setEditingSlot(null);
                setSlotForm(emptyForm);
              }}
              className="px-3 py-2 rounded-lg border border-border text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["Time", "Mon", "Tue", "Wed", "Thu", "Fri", "Actions"].map((h) => (
                <th key={h} className="px-4 py-2 text-left text-xs text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timetable.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0">
                <td className="px-4 py-2 text-sm">{r.time}</td>
                <td className="px-4 py-2 text-sm">{r.mon}</td>
                <td className="px-4 py-2 text-sm">{r.tue}</td>
                <td className="px-4 py-2 text-sm">{r.wed}</td>
                <td className="px-4 py-2 text-sm">{r.thu}</td>
                <td className="px-4 py-2 text-sm">{r.fri}</td>
                <td className="px-4 py-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingSlot(r.id);
                        setSlotForm({
                          time: r.time,
                          mon: r.mon || "",
                          tue: r.tue || "",
                          wed: r.wed || "",
                          thu: r.thu || "",
                          fri: r.fri || "",
                        });
                      }}
                      className="px-2 py-1 rounded bg-info text-info-foreground"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setTimetable((p) => p.filter((x) => x.id !== r.id))}
                      className="px-2 py-1 rounded bg-destructive text-destructive-foreground"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCourses;
