import { useMemo, useState } from "react";
import type { Student } from "@/data/mockData";
import { toast } from "sonner";

interface Props {
  students: Student[];
  onStudentsChange: (next: Student[]) => void;
}

const FeeManagement = ({ students, onStudentsChange }: Props) => {
  const [paymentMap, setPaymentMap] = useState<Record<number, string>>({});

  const pendingStudents = useMemo(
    () => students.filter((s) => s.fees.pending > 0),
    [students]
  );

  const totalPending = pendingStudents.reduce((sum, s) => sum + s.fees.pending, 0);

  const applyPayment = (studentId: number) => {
    const amount = Number(paymentMap[studentId] || 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    const target = students.find((s) => s.id === studentId);
    if (!target) {
      toast.error("Student not found");
      return;
    }

    const applied = Math.min(amount, target.fees.pending);

    const next = students.map((s) => {
      if (s.id !== studentId) return s;

      const pending = Math.max(0, s.fees.pending - applied);
      const paid = s.fees.paid + applied;
      const status = pending === 0 ? "Paid" : "Partial";

      return {
        ...s,
        fees: {
          ...s.fees,
          paid,
          pending,
          status,
        },
      };
    });

    onStudentsChange(next);
    setPaymentMap((prev) => ({ ...prev, [studentId]: "" }));
    toast.success("Payment recorded");
  };

  const markAsPaid = (studentId: number) => {
    const target = students.find((s) => s.id === studentId);
    if (!target || target.fees.pending <= 0) return;

    const next = students.map((s) => {
      if (s.id !== studentId) return s;
      return {
        ...s,
        fees: {
          ...s.fees,
          paid: s.fees.paid + s.fees.pending,
          pending: 0,
          status: "Paid",
        },
      };
    });

    onStudentsChange(next);
    toast.success("Student marked as fully paid");
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-foreground">Fee Management</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Students With Pending Fee</p>
          <p className="text-2xl font-bold text-destructive">{pendingStudents.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Pending</p>
          <p className="text-2xl font-bold text-foreground">Rs. {totalPending.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Students</p>
          <p className="text-2xl font-bold text-foreground">{students.length}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {[
                "Student",
                "ID",
                "Class",
                "Total",
                "Paid",
                "Pending",
                "Pay",
                "Actions",
              ].map((head) => (
                <th key={head} className="px-4 py-2 text-left text-xs text-muted-foreground">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pendingStudents.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-sm text-muted-foreground" colSpan={8}>
                  No pending fee records.
                </td>
              </tr>
            )}

            {pendingStudents.map((student) => (
              <tr key={student.id} className="border-b border-border last:border-0">
                <td className="px-4 py-2 text-sm">{student.name}</td>
                <td className="px-4 py-2 text-sm">{student.id}</td>
                <td className="px-4 py-2 text-sm">{student.grade}</td>
                <td className="px-4 py-2 text-sm">Rs. {student.fees.total.toLocaleString()}</td>
                <td className="px-4 py-2 text-sm">Rs. {student.fees.paid.toLocaleString()}</td>
                <td className="px-4 py-2 text-sm text-destructive">
                  Rs. {student.fees.pending.toLocaleString()}
                </td>
                <td className="px-4 py-2">
                  <input
                    value={paymentMap[student.id] || ""}
                    onChange={(e) =>
                      setPaymentMap((prev) => ({ ...prev, [student.id]: e.target.value }))
                    }
                    placeholder="Amount"
                    className="w-24 rounded-md border border-border bg-background px-2 py-1 text-sm"
                  />
                </td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => applyPayment(student.id)}
                      className="rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground"
                    >
                      Apply
                    </button>
                    <button
                      onClick={() => markAsPaid(student.id)}
                      className="rounded-md border border-border px-2 py-1 text-xs"
                    >
                      Mark Paid
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

export default FeeManagement;