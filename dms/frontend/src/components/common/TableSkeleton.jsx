import { Skeleton } from "@/components/ui/skeleton";
import { TableRow, TableCell } from "@/components/ui/table";

const TableSkeleton = ({ rows = 5, columns = 5 }) => (
  <>
    {Array.from({ length: rows }).map((_, r) => (
      <TableRow key={r}>
        {Array.from({ length: columns }).map((_, c) => (
          <TableCell key={c}>
            <Skeleton className="h-4 w-full max-w-[140px]" />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
);

export default TableSkeleton;
