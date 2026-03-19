import { useEffect, useMemo, useState } from "react";
import type { Student } from "@/data/mockData";
import type { FeeTransaction, PaymentMethod } from "@/components/admin/types";
import { toast } from "sonner";
import FeeSearch from "./components/FeeSearch";
import FeeSummaryCards from "./components/FeeSummaryCards";
import FeeTable from "./components/FeeTable";
import ReceiptsTable from "./components/ReceiptsTable";
import StudentOverviewCard from "./components/StudentOverviewCard";
import type { FeeManagementProps } from "./types/fee";
import { generateReceiptNo, getEnrolledCourses, studentCode, viewReceipt } from "./utils/feeUtils";

const FeeManagement = ({
  students,
  transactions = [],
  onStudentsChange,
  onRecordTransaction,
  onTransactionsChange,
  onAuditLog,
  currentAdmin = "Admin User",
  showPendingOnly = false,
}: FeeManagementProps) => {
  const [query, setQuery] = useState("");
  const [receiptQuery, setReceiptQuery] = useState("");
  const [paymentMap, setPaymentMap] = useState<Record<number, string>>({});
  const [methodMap, setMethodMap] = useState<Record<number, PaymentMethod>>({});
  const [collectorMap, setCollectorMap] = useState<Record<number, string>>({});
  const [remarksMap, setRemarksMap] = useState<Record<number, string>>({});
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [pendingOnly, setPendingOnly] = useState(showPendingOnly);

  useEffect(() => {
    setPendingOnly(showPendingOnly);
  }, [showPendingOnly]);

  const pendingStudents = useMemo(
    () => students.filter((s) => s.fees.pending > 0),
    [students]
  );

  const totalPending = pendingStudents.reduce((sum, s) => sum + s.fees.pending, 0);

  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = pendingOnly ? pendingStudents : students;
    if (!q) return base;

    return base.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        String(s.id).includes(q) ||
        studentCode(s.id).toLowerCase().includes(q)
    );
  }, [query, pendingStudents, pendingOnly, students]);

  const selectedStudent = useMemo(() => {
    if (selectedStudentId !== null) {
      return filteredStudents.find((s) => s.id === selectedStudentId) || null;
    }
    if (filteredStudents.length === 1) return filteredStudents[0];
    return null;
  }, [filteredStudents, selectedStudentId]);

  const filteredTransactions = useMemo(() => {
    const q = receiptQuery.trim().toLowerCase();
    if (!q) return transactions;
    return transactions.filter(
      (tx) =>
        tx.receiptNo.toLowerCase().includes(q) ||
        tx.id.toLowerCase().includes(q)
    );
  }, [receiptQuery, transactions]);

  const selectedStudentTransactions = useMemo(() => {
    if (!selectedStudent) return [];
    return filteredTransactions.filter((tx) => tx.studentId === selectedStudent.id);
  }, [filteredTransactions, selectedStudent]);

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

  const isCurrentMonth = (dateString: string) => {
    const date = new Date(dateString);
    if (!Number.isFinite(date.getTime())) return false;
    const now = new Date();
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  };

  const updateTransaction = (
    txId: string,
    updates: { amount: number; method: PaymentMethod; collector: string; remarks: string }
  ) => {
    const existing = transactions.find((tx) => tx.id === txId);
    if (!existing) return;
    if (!isCurrentMonth(existing.transactionDate)) {
      toast.error("Only current month transactions can be edited.");
      return;
    }

    const target = students.find((s) => s.id === existing.studentId);
    if (!target) {
      toast.error("Student not found for this transaction.");
      return;
    }

    const delta = updates.amount - existing.amount;
    const nextPaid = target.fees.paid + delta;
    const nextPending = target.fees.pending - delta;
    if (nextPaid < 0 || nextPending < 0 || nextPaid > target.fees.total) {
      toast.error("Updated amount is out of allowed range.");
      return;
    }

    const nextStudents = students.map((s) => {
      if (s.id !== target.id) return s;
      const status = nextPending === 0 ? "Paid" : nextPaid > 0 ? "Partial" : "Pending";
      return {
        ...s,
        fees: {
          ...s.fees,
          paid: nextPaid,
          pending: nextPending,
          status,
        },
      };
    });
    onStudentsChange(nextStudents);

    const nextTransactions = transactions.map((tx) =>
      tx.id === txId
        ? {
            ...tx,
            amount: updates.amount,
            method: updates.method,
            collector: updates.collector,
            remarks: updates.remarks,
          }
        : tx
    );
    onTransactionsChange?.(nextTransactions);
    onAuditLog?.({
      actor: currentAdmin,
      module: "Fee",
      action: "Edited Fee Transaction",
      details: `${existing.studentName} transaction edited. Amount: Rs. ${existing.amount.toLocaleString()} -> Rs. ${updates.amount.toLocaleString()}.`,
    });
    toast.success("Transaction updated.");
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

      <FeeSummaryCards
        pendingCount={pendingStudents.length}
        totalPending={totalPending}
        totalStudents={pendingOnly ? pendingStudents.length : students.length}
        onShowPendingOnly={() => setPendingOnly(true)}
      />

      <FeeSearch
        query={query}
        receiptQuery={receiptQuery}
        onQueryChange={setQuery}
        onReceiptQueryChange={setReceiptQuery}
      />

      {selectedStudent && (
        <>
          <StudentOverviewCard student={selectedStudent} />

          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Fee Form</h3>
                <p className="text-sm text-muted-foreground">
                  Collect fee for {selectedStudent.name} ({studentCode(selectedStudent.id)})
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                Pending: Rs. {selectedStudent.fees.pending.toLocaleString()}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Amount</label>
                <input
                  value={paymentMap[selectedStudent.id] || ""}
                  onChange={(e) => onPaymentChange(selectedStudent.id, e.target.value)}
                  placeholder="Amount"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Method</label>
                <select
                  value={methodMap[selectedStudent.id] || "Cash"}
                  onChange={(e) =>
                    onMethodChange(selectedStudent.id, e.target.value as PaymentMethod)
                  }
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank</option>
                  <option value="Online">Online</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Collector</label>
                <input
                  value={collectorMap[selectedStudent.id] ?? currentAdmin}
                  onChange={(e) => onCollectorChange(selectedStudent.id, e.target.value)}
                  placeholder="Collector"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Remarks</label>
                <input
                  value={remarksMap[selectedStudent.id] || ""}
                  onChange={(e) => onRemarksChange(selectedStudent.id, e.target.value)}
                  placeholder="Remarks"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-end">
              <button
                onClick={() => onApplyPayment(selectedStudent.id)}
                className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
                disabled={selectedStudent.fees.pending <= 0}
              >
                Submit Fee
              </button>
              <button
                onClick={() => onMarkPaid(selectedStudent.id)}
                className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-50"
                disabled={selectedStudent.fees.pending <= 0}
              >
                Mark Paid
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Past Transactions
                </h3>
                <p className="text-sm text-muted-foreground">
                  {selectedStudent.name} · {studentCode(selectedStudent.id)}
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                Courses:{" "}
                {getEnrolledCourses(selectedStudent).length > 0
                  ? getEnrolledCourses(selectedStudent).join(", ")
                  : "No courses available"}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {["Date", "Receipt #", "Amount", "Method", "Collector", "Remarks"].map(
                      (head) => (
                        <th
                          key={head}
                          className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                        >
                          {head}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {selectedStudentTransactions.length === 0 ? (
                    <tr>
                      <td
                        className="px-3 py-4 text-sm text-muted-foreground text-center"
                        colSpan={6}
                      >
                        No transactions found for this student.
                      </td>
                    </tr>
                  ) : (
                    selectedStudentTransactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-border last:border-0">
                        <td className="px-3 py-2 text-sm">
                          {new Date(tx.transactionDate).toLocaleDateString("en-PK", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-3 py-2 text-sm font-mono">{tx.receiptNo}</td>
                        <td className="px-3 py-2 text-sm font-semibold">
                          Rs. {tx.amount.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 text-sm">{tx.method}</td>
                        <td className="px-3 py-2 text-sm">{tx.collector}</td>
                        <td className="px-3 py-2 text-sm">
                          {tx.remarks || "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <FeeTable
        students={filteredStudents}
        selectedStudentId={selectedStudentId}
        paymentMap={paymentMap}
        methodMap={methodMap}
        collectorMap={collectorMap}
        remarksMap={remarksMap}
        currentAdmin={currentAdmin}
        showInlineControls={false}
        onSelectStudent={setSelectedStudentId}
        onPaymentChange={(studentId, value) =>
          setPaymentMap((prev) => ({ ...prev, [studentId]: value }))
        }
        onMethodChange={(studentId, value) =>
          setMethodMap((prev) => ({ ...prev, [studentId]: value }))
        }
        onCollectorChange={(studentId, value) =>
          setCollectorMap((prev) => ({ ...prev, [studentId]: value }))
        }
        onRemarksChange={(studentId, value) =>
          setRemarksMap((prev) => ({ ...prev, [studentId]: value }))
        }
        onApplyPayment={applyPayment}
        onMarkPaid={markAsPaid}
      />

      <ReceiptsTable
        transactions={filteredTransactions}
        students={students}
        onViewReceipt={viewReceipt}
        canEditTransaction={isCurrentMonth}
        onEditTransaction={updateTransaction}
      />
    </div>
  );
};

export default FeeManagement;
