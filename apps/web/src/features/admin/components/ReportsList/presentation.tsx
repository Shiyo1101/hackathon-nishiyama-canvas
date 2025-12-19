import type { ReportStatus, ReportWithDetails } from "@api";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ReportsListPresentationProps = {
  reports: ReportWithDetails[];
  isLoading: boolean;
  selectedStatus: ReportStatus | "all";
  onStatusChange: (status: ReportStatus | "all") => void;
  onUpdateStatus: (reportId: string, status: ReportStatus) => void;
};

const STATUS_LABELS: Record<ReportStatus | "all", string> = {
  all: "すべて",
  pending: "未対応",
  reviewed: "確認済み",
  resolved: "解決済み",
  rejected: "却下",
};

const STATUS_BADGE_VARIANT: Record<
  ReportStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "destructive",
  reviewed: "secondary",
  resolved: "default",
  rejected: "outline",
};

const REASON_LABELS: Record<string, string> = {
  inappropriate_image: "不適切な画像",
  spam: "スパム",
  copyright: "著作権侵害",
  other: "その他",
};

export const ReportsListPresentation = ({
  reports,
  isLoading,
  selectedStatus,
  onStatusChange,
  onUpdateStatus,
}: ReportsListPresentationProps): React.JSX.Element => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(["all", "pending", "reviewed", "resolved", "rejected"] as const).map((status) => (
            <Button
              key={status}
              variant={selectedStatus === status ? "default" : "outline"}
              size="sm"
              onClick={() => onStatusChange(status)}
            >
              {STATUS_LABELS[status]}
            </Button>
          ))}
        </div>
        <p className="text-muted-foreground text-sm">全 {reports.length} 件の通報</p>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>キャンバス</TableHead>
              <TableHead>理由</TableHead>
              <TableHead>詳細</TableHead>
              <TableHead>通報者</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead>通報日</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  読み込み中...
                </TableCell>
              </TableRow>
            ) : reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  通報がありません
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col gap-1">
                      <span>{report.canvas?.title || "不明"}</span>
                      <span className="text-muted-foreground text-xs">
                        作成者: {report.canvas?.user?.name || "不明"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {REASON_LABELS[report.reason] || report.reason}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="line-clamp-2 text-sm">{report.description || "-"}</span>
                  </TableCell>
                  <TableCell>{report.reporter?.name || "不明"}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE_VARIANT[report.status]}>
                      {STATUS_LABELS[report.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(report.createdAt), "yyyy/MM/dd HH:mm")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {report.status === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdateStatus(report.id, "reviewed")}
                          >
                            確認
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => onUpdateStatus(report.id, "resolved")}
                          >
                            解決
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onUpdateStatus(report.id, "rejected")}
                          >
                            却下
                          </Button>
                        </>
                      )}
                      {report.status === "reviewed" && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => onUpdateStatus(report.id, "resolved")}
                          >
                            解決
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onUpdateStatus(report.id, "rejected")}
                          >
                            却下
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
