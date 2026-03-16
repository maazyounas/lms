import { useMemo, useState } from "react";
import { Printer, Search } from "lucide-react";
import type { Student } from "@/data/mockData";
import type { AuditLogEntry, FeeTransaction, PaymentMethod } from "@/components/admin/types";
import { toast } from "sonner";

interface Props {
  students: Student[];
  transactions?: FeeTransaction[];
  onStudentsChange: (next: Student[]) => void;
  onRecordTransaction?: (transaction: FeeTransaction) => void;
  onAuditLog?: (entry: Omit<AuditLogEntry, "id" | "createdAt">) => void;
  currentAdmin?: string;
  showPendingOnly?: boolean;
}

const FeeManagement = ({
  students,
  transactions = [],
  onStudentsChange,
  onRecordTransaction,
  onAuditLog,
  currentAdmin = "Admin User",
  showPendingOnly = false,
}: Props) => {
  const [query, setQuery] = useState("");
  const [paymentMap, setPaymentMap] = useState<Record<number, string>>({});
  const [methodMap, setMethodMap] = useState<Record<number, PaymentMethod>>({});
  const [collectorMap, setCollectorMap] = useState<Record<number, string>>({});
  const [remarksMap, setRemarksMap] = useState<Record<number, string>>({});
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  const pendingStudents = useMemo(
    () => students.filter((s) => s.fees.pending > 0),
    [students]
  );

  const totalPending = pendingStudents.reduce((sum, s) => sum + s.fees.pending, 0);
  const studentCode = (id: number) => `STU-${String(id).padStart(4, "0")}`;

  const getEnrolledCourses = (student: Student) => {
    const fromTests = student.tests.map((test) => test.subject);
    const fromAssignments = student.assignments.map((assignment) => assignment.subject);
    return Array.from(new Set([...fromTests, ...fromAssignments]));
  };

  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = showPendingOnly ? pendingStudents : students;
    if (!q) return base;

    return base.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        String(s.id).includes(q) ||
        studentCode(s.id).toLowerCase().includes(q)
    );
  }, [query, pendingStudents, showPendingOnly, students]);

  const selectedStudent = useMemo(() => {
    if (selectedStudentId !== null) {
      return filteredStudents.find((s) => s.id === selectedStudentId) || null;
    }
    if (filteredStudents.length === 1) return filteredStudents[0];
    return null;
  }, [filteredStudents, selectedStudentId]);

  const generateReceiptNo = () => {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const suffix = Math.floor(1000 + Math.random() * 9000);
    return `RCPT-${datePart}-${suffix}`;
  };

  const viewReceipt = (tx: FeeTransaction) => {
    const receiptHtml = `
      <html>
      <head>
        <title>${tx.receiptNo}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
          h2 { margin-bottom: 12px; }
          .row { margin: 8px 0; }
          .label { font-weight: 700; display: inline-block; width: 150px; }
          .box { border: 1px solid #d1d5db; border-radius: 8px; padding: 16px; max-width: 520px; }
        </style>
      </head>
      <body>
        <div class="box">
          <h2>Fee Receipt</h2>
          <div class="row"><span class="label">Receipt No:</span> ${tx.receiptNo}</div>
          <div class="row"><span class="label">Date:</span> ${new Date(tx.transactionDate).toLocaleString()}</div>
          <div class="row"><span class="label">Student:</span> ${tx.studentName}</div>
          <div class="row"><span class="label">Student ID:</span> STU-${String(tx.studentId).padStart(4, "0")}</div>
          <div class="row"><span class="label">Class:</span> ${tx.className}</div>
          <div class="row"><span class="label">Amount Paid:</span> Rs. ${tx.amount.toLocaleString()}</div>
          <div class="row"><span class="label">Payment Method:</span> ${tx.method}</div>
          <div class="row"><span class="label">Collected By:</span> ${tx.collector}</div>
          <div class="row"><span class="label">Remarks:</span> ${tx.remarks || "-"}</div>
        </div>
      </body>
      </html>
    `;

    const receiptWindow = window.open("", "_blank", "width=700,height=700");
    if (!receiptWindow) return;
    receiptWindow.document.write(receiptHtml);
    receiptWindow.document.close();
    receiptWindow.focus();
    setTimeout(() => {
      receiptWindow.print();
    }, 200);
  };

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
    if (target.fees.pending <= 0) {
      toast.info("Student has no pending fee");
      return;
    }

    const applied = Math.min(amount, target.fees.pending);
    const method = methodMap[studentId] || "Cash";
    const collector = (collectorMap[studentId] || currentAdmin).trim() || currentAdmin;
    const remarks = (remarksMap[studentId] || "").trim();

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
    setRemarksMap((prev) => ({ ...prev, [studentId]: "" }));

    onRecordTransaction?.({
      id: `${Date.now()}-${studentId}`,
      receiptNo: generateReceiptNo(),
      studentId: target.id,
      studentName: target.name,
      className: target.grade,
      amount: applied,
      method,
      collector,
      remarks,
      transactionDate: new Date().toISOString(),
    });
    onAuditLog?.({
      actor: currentAdmin,
      module: "Fee",
      action: "Recorded Fee Payment",
      details: `${target.name} (${studentCode(target.id)}) paid Rs. ${applied.toLocaleString()} via ${method}.`,
    });
    toast.success(`Payment recorded: Rs. ${applied.toLocaleString()}`);
  };

  const markAsPaid = (studentId: number) => {
    const target = students.find((s) => s.id === studentId);
    if (!target || target.fees.pending <= 0) return;
    const fullAmount = target.fees.pending;
    const method = methodMap[studentId] || "Cash";
    const collector = (collectorMap[studentId] || currentAdmin).trim() || currentAdmin;
    const remarks = (remarksMap[studentId] || "").trim();

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
    setPaymentMap((prev) => ({ ...prev, [studentId]: "" }));
    setRemarksMap((prev) => ({ ...prev, [studentId]: "" }));
    onRecordTransaction?.({
      id: `${Date.now()}-${studentId}`,
      receiptNo: generateReceiptNo(),
      studentId: target.id,
      studentName: target.name,
      className: target.grade,
      amount: fullAmount,
      method,
      collector,
      remarks: remarks || "Marked fully paid",
      transactionDate: new Date().toISOString(),
    });
    onAuditLog?.({
      actor: currentAdmin,
      module: "Fee",
      action: "Marked Fee Fully Paid",
      details: `${target.name} (${studentCode(target.id)}) marked paid with Rs. ${fullAmount.toLocaleString()}.`,
    });
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
          <p className="text-2xl font-bold text-foreground">
            {showPendingOnly ? pendingStudents.length : students.length}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by student name or ID"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      {selectedStudent && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{selectedStudent.name}</h2>
            <p className="text-sm text-muted-foreground">
              {studentCode(selectedStudent.id)} | {selectedStudent.grade}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs text-muted-foreground">Fee Status</p>
              <p className="font-semibold text-foreground">{selectedStudent.fees.status}</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs text-muted-foreground">Class</p>
              <p className="font-semibold text-foreground">{selectedStudent.grade}</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs text-muted-foreground">Pending</p>
              <p
                className={`font-semibold ${
                  selectedStudent.fees.pending > 0 ? "text-destructive" : "text-success"
                }`}
              >
                Rs. {selectedStudent.fees.pending.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs text-muted-foreground">Paid</p>
              <p className="font-semibold text-foreground">
                Rs. {selectedStudent.fees.paid.toLocaleString()}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Enrolled Courses</p>
            <div className="flex flex-wrap gap-2">
              {getEnrolledCourses(selectedStudent).length > 0 ? (
                getEnrolledCourses(selectedStudent).map((course) => (
                  <span
                    key={course}
                    className="rounded-full border border-border bg-background px-2 py-1 text-xs"
                  >
                    {course}
                  </span>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No courses available.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {[
                "Student",
                "ID",
                "Class",
                "Courses",
                "Status",
                "Pending",
                "Collect Fee",
                "Actions",
              ].map((head) => (
                <th key={head} className="px-4 py-2 text-left text-xs text-muted-foreground">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-sm text-muted-foreground" colSpan={8}>
                  No student found for this search.
                </td>
              </tr>
            )}

            {filteredStudents.map((student) => (
              <tr
                key={student.id}
                className={`border-b border-border last:border-0 ${
                  selectedStudentId === student.id ? "bg-muted/30" : ""
                }`}
              >
                <td className="px-4 py-2 text-sm">{student.name}</td>
                <td className="px-4 py-2 text-sm">{studentCode(student.id)}</td>
                <td className="px-4 py-2 text-sm">{student.grade}</td>
                <td className="px-4 py-2 text-sm">
                  {getEnrolledCourses(student).slice(0, 2).join(", ")}
                  {getEnrolledCourses(student).length > 2
                    ? ` +${getEnrolledCourses(student).length - 2}`
                    : ""}
                </td>
                <td className="px-4 py-2 text-sm">{student.fees.status}</td>
                <td className="px-4 py-2 text-sm text-destructive">
                  Rs. {student.fees.pending.toLocaleString()}
                </td>
                <td className="px-4 py-2">
                  <div className="space-y-1">
                    <input
                      value={paymentMap[student.id] || ""}
                      onChange={(e) =>
                        setPaymentMap((prev) => ({ ...prev, [student.id]: e.target.value }))
                      }
                      placeholder="Amount"
                      className="w-24 rounded-md border border-border bg-background px-2 py-1 text-sm"
                      disabled={student.fees.pending <= 0}
                    />
                    <select
                      value={methodMap[student.id] || "Cash"}
                      onChange={(e) =>
                        setMethodMap((prev) => ({
                          ...prev,
                          [student.id]: e.target.value as PaymentMethod,
                        }))
                      }
                      className="w-28 rounded-md border border-border bg-background px-2 py-1 text-xs"
                      disabled={student.fees.pending <= 0}
                    >
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="Bank Transfer">Bank</option>
                      <option value="Online">Online</option>
                    </select>
                    <input
                      value={collectorMap[student.id] ?? currentAdmin}
                      onChange={(e) =>
                        setCollectorMap((prev) => ({ ...prev, [student.id]: e.target.value }))
                      }
                      placeholder="Collector"
                      className="w-28 rounded-md border border-border bg-background px-2 py-1 text-xs"
                      disabled={student.fees.pending <= 0}
                    />
                    <input
                      value={remarksMap[student.id] || ""}
                      onChange={(e) =>
                        setRemarksMap((prev) => ({ ...prev, [student.id]: e.target.value }))
                      }
                      placeholder="Remarks"
                      className="w-32 rounded-md border border-border bg-background px-2 py-1 text-xs"
                      disabled={student.fees.pending <= 0}
                    />
                  </div>
                </td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedStudentId(student.id)}
                      className="rounded-md border border-border px-2 py-1 text-xs"
                    >
                      View
                    </button>
                    <button
                      onClick={() => applyPayment(student.id)}
                      className="rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground"
                      disabled={student.fees.pending <= 0}
                    >
                      Apply
                    </button>
                    <button
                      onClick={() => markAsPaid(student.id)}
                      className="rounded-md border border-border px-2 py-1 text-xs"
                      disabled={student.fees.pending <= 0}
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

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">Recent Receipts</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["Date", "Receipt", "Student", "Amount", "Method", "Actions"].map((head) => (
                <th key={head} className="px-4 py-2 text-left text-xs text-muted-foreground">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-sm text-muted-foreground" colSpan={6}>
                  No receipts generated yet.
                </td>
              </tr>
            )}
            {transactions.slice(0, 10).map((tx) => (
              <tr key={tx.id} className="border-b border-border last:border-0">
                <td className="px-4 py-2 text-sm">
                  {new Date(tx.transactionDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 text-sm">{tx.receiptNo}</td>
                <td className="px-4 py-2 text-sm">{tx.studentName}</td>
                <td className="px-4 py-2 text-sm font-semibold">Rs. {tx.amount.toLocaleString()}</td>
                <td className="px-4 py-2 text-sm">{tx.method}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => viewReceipt(tx)}
                    className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    View Receipt
                  </button>
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
