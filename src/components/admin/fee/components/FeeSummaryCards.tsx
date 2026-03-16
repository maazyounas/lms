type Props = {
  pendingCount: number;
  totalPending: number;
  totalStudents: number;
  onShowPendingOnly?: () => void;
};

const FeeSummaryCards = ({
  pendingCount,
  totalPending,
  totalStudents,
  onShowPendingOnly,
}: Props) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <button
        type="button"
        onClick={onShowPendingOnly}
        className="rounded-xl border border-border bg-card p-4 text-left hover:border-primary/50 hover:bg-primary/5 transition"
      >
        <p className="text-xs text-muted-foreground">Students With Pending Fee</p>
        <p className="text-2xl font-bold text-destructive">{pendingCount}</p>
      </button>
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs text-muted-foreground">Total Pending</p>
        <p className="text-2xl font-bold text-foreground">Rs. {totalPending.toLocaleString()}</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs text-muted-foreground">Total Students</p>
        <p className="text-2xl font-bold text-foreground">{totalStudents}</p>
      </div>
    </div>
  );
};

export default FeeSummaryCards;
