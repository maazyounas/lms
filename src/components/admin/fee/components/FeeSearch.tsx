import { Search } from "lucide-react";

type Props = {
  query: string;
  onQueryChange: (value: string) => void;
};

const FeeSearch = ({ query, onQueryChange }: Props) => {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search by student name or ID"
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>
    </div>
  );
};

export default FeeSearch;
