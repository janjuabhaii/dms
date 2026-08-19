import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportToCsv } from "@/lib/exportCsv";

const ExportButton = ({ filename, rows, columns }) => (
  <Button
    variant="outline"
    size="sm"
    onClick={() => exportToCsv(filename, rows, columns)}
    disabled={!rows || rows.length === 0}
    className="print:hidden"
  >
    <Download className="h-3.5 w-3.5" />
    Export CSV
  </Button>
);

export default ExportButton;
