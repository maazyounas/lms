import { useMemo } from "react";
import type { Student } from "@/data/mockData";
import type { PaymentMethod } from "@/components/admin/types";
import { getEnrolledCourses, studentCode } from "../utils/feeUtils";

type Props = {
  students: Student[];
  selectedStudentId: number | null;
  paymentMap: Record<number, string>;
  methodMap: Record<number, PaymentMethod>;
  collectorMap: Record<number, string>;
  remarksMap: Record<number, string>;
  currentAdmin: string;
  showInlineControls?: boolean;
  onSelectStudent: (studentId: number) => void;
  onPaymentChange: (studentId: number, value: string) => void;
  onMethodChange: (studentId: number, value: PaymentMethod) => void;
  onCollectorChange: (studentId: number, value: string) => void;
  onRemarksChange: (studentId: number, value: string) => void;
  onApplyPayment: (studentId: number) => void;
  onMarkPaid: (studentId: number) => void;
};

const FeeTable = ({
  students,
  selectedStudentId,
  paymentMap,
  methodMap,
  collectorMap,
  remarksMap,
  currentAdmin,
  showInlineControls = true,
  onSelectStudent,
  onPaymentChange,
  onMethodChange,
  onCollectorChange,
  onRemarksChange,
  onApplyPayment,
  onMarkPaid,
}: Props) => {
  const rows = useMemo(() => {
    return students.map((student) => {
      const courses = getEnrolledCourses(student);
      return {
        student,
        courses,
        pending: student.fees.pending,
        hasPending: student.fees.pending > 0,
      };
    });
  }, [students]);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px]">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            {[
              "Student",
              "ID",
              "Class",
              "Courses",
              "Status",
              "Pending",
              "Actions",
              ...(showInlineControls ? ["Collect Fee"] : []),
            ].map((head) => (
              <th
                key={head}
                className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground ${
                  head === "Pending" ? "text-right" : ""
                }`}
              >
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td
                className="px-4 py-8 text-sm text-muted-foreground text-center"
                colSpan={showInlineControls ? 8 : 7}
              >
                No student found for this search.
              </td>
            </tr>
          )}

          {rows.map(({ student, courses, pending, hasPending }, index) => (
            <tr
              key={student.id}
              className={`border-b border-border last:border-0 ${
                selectedStudentId === student.id ? "bg-muted/30" : ""
              } ${index % 2 === 1 ? "bg-muted/10" : ""} hover:bg-muted/30 transition-colors`}
            >
              <td className="px-4 py-3 text-sm">
                <button
                  onClick={() => onSelectStudent(student.id)}
                  className="text-left font-medium text-foreground hover:text-primary"
                >
                  {student.name}
                </button>
                <p className="text-xs text-muted-foreground">Guardian: {student.guardian || "N/A"}</p>
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {studentCode(student.id)}
              </td>
              <td className="px-4 py-3 text-sm">{student.grade}</td>
              <td className="px-4 py-3 text-sm">
                {courses.slice(0, 2).join(", ")}
                {courses.length > 2 ? ` +${courses.length - 2}` : ""}
              </td>
              <td className="px-4 py-3 text-sm">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    student.fees.status === "Paid"
                      ? "bg-success/10 text-success"
                      : student.fees.status === "Partial"
                        ? "bg-warning/10 text-warning"
                        : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {student.fees.status}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-right">
                <span className={pending > 0 ? "text-destructive font-semibold" : "text-success"}>
                  Rs. {pending.toLocaleString()}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => onSelectStudent(student.id)}
                    className="rounded-md border border-border px-2 py-1 text-xs hover:border-primary/60 hover:text-primary"
                  >
                    View
                  </button>
                  <button
                    onClick={() => onApplyPayment(student.id)}
                    className="rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground disabled:opacity-50"
                    disabled={!hasPending}
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => onMarkPaid(student.id)}
                    className="rounded-md border border-border px-2 py-1 text-xs disabled:opacity-50"
                    disabled={!hasPending}
                  >
                    Mark Paid
                  </button>
                </div>
              </td>
              {showInlineControls && (
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <input
                      value={paymentMap[student.id] || ""}
                      onChange={(e) => onPaymentChange(student.id, e.target.value)}
                      placeholder="Amount"
                      className="w-24 rounded-md border border-border bg-background px-2 py-1 text-sm"
                      disabled={!hasPending}
                    />
                    <select
                      value={methodMap[student.id] || "Cash"}
                      onChange={(e) =>
                        onMethodChange(student.id, e.target.value as PaymentMethod)
                      }
                      className="w-28 rounded-md border border-border bg-background px-2 py-1 text-xs"
                      disabled={!hasPending}
                    >
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="Bank Transfer">Bank</option>
                      <option value="Online">Online</option>
                    </select>
                    <input
                      value={collectorMap[student.id] ?? currentAdmin}
                      onChange={(e) => onCollectorChange(student.id, e.target.value)}
                      placeholder="Collector"
                      className="w-28 rounded-md border border-border bg-background px-2 py-1 text-xs"
                      disabled={!hasPending}
                    />
                    <input
                      value={remarksMap[student.id] || ""}
                      onChange={(e) => onRemarksChange(student.id, e.target.value)}
                      placeholder="Remarks"
                      className="w-32 rounded-md border border-border bg-background px-2 py-1 text-xs"
                      disabled={!hasPending}
                    />
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default FeeTable;
