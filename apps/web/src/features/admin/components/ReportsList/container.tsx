"use client";

import type { ReportStatus, ReportWithDetails } from "@api";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ReportsListPresentation } from "./presentation";

export const ReportsListContainer = (): React.JSX.Element => {
  const [reports, setReports] = useState<ReportWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus | "all">("pending");

  const fetchReports = async (status?: ReportStatus) => {
    try {
      setIsLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const url = new URL(`${baseUrl}/api/admin/reports`);

      if (status) {
        url.searchParams.set("status", status);
      }
      url.searchParams.set("limit", "100");
      url.searchParams.set("offset", "0");

      const response = await fetch(url.toString(), {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("通報の取得に失敗しました");
      }

      const data = await response.json();
      setReports(data.data.reports);
    } catch (error) {
      console.error("通報取得エラー:", error);
      toast.error("通報の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchReports is stable
  useEffect(() => {
    if (selectedStatus === "all") {
      fetchReports();
    } else {
      fetchReports(selectedStatus);
    }
  }, [selectedStatus]);

  const handleStatusChange = (status: ReportStatus | "all") => {
    setSelectedStatus(status);
  };

  const handleUpdateStatus = async (reportId: string, newStatus: ReportStatus) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/admin/reports/${reportId}`;
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("ステータスの更新に失敗しました");
      }

      toast.success("ステータスを更新しました");

      // リフレッシュ
      if (selectedStatus === "all") {
        await fetchReports();
      } else {
        await fetchReports(selectedStatus);
      }
    } catch (error) {
      console.error("ステータス更新エラー:", error);
      toast.error("ステータスの更新に失敗しました");
    }
  };

  return (
    <ReportsListPresentation
      reports={reports}
      isLoading={isLoading}
      selectedStatus={selectedStatus}
      onStatusChange={handleStatusChange}
      onUpdateStatus={handleUpdateStatus}
    />
  );
};
