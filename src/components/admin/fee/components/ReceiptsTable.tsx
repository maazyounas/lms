import { Printer } from "lucide-react";
import type { FeeTransaction } from "@/components/admin/types";

type Props = {
  transactions: FeeTransaction[];
  onViewReceipt: (tx: FeeTransaction) => void;
};

const ReceiptsTable = ({ transactions, onViewReceipt }: Props) => {
  return (
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
              <td className="px-4 py-2 text-sm font-semibold">
                Rs. {tx.amount.toLocaleString()}
              </td>
              <td className="px-4 py-2 text-sm">{tx.method}</td>
              <td className="px-4 py-2">
                <button
                  onClick={() => onViewReceipt(tx)}
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
  );
};

export default ReceiptsTable;
