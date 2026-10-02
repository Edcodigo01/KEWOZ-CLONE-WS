import { useState, useEffect } from "react";
import {
  Button,
  DataTable,
  Input,
  Modal,
  Toggle,
  type DataTableColumn,
} from "@/components/ui";
import {
  reportService,
  type Report,
  type ReportDetail,
  type ReportDetails,
} from "@/services/global/reportService";
import { Breadcrumb } from "@/layouts";
import { useToast } from "@/components/ui/Toast";
import { Eye, Search } from "lucide-react";
import { userService } from "@/services/global/userService";
import { useDemoGuard } from "@/utils/demoGuard";

export default function ReportedUsersListPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const [reportDetails, setReportDetails] = useState<ReportDetail[]>([]);
  const [viewingReport, setViewingReport] = useState<Report | null>(null);
  const { checkDemo } = useDemoGuard();

  const fetchReports = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const response = await reportService.getReportedEntities({
        page,
        limit: 10,
        type: "user",
      });

      if (response.status) {
        setReports(response.data.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch reported users",
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast({
        title: "Error",
        description: "Failed to fetch reported users",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(1);
  }, []);

  const handleViewReport = async (report: Report) => {
    setViewingReport(report);
    if (!report.reported_user?.user_id) return;
    const reportDetails = await reportService.getReportDetails(
      report.reported_user?.user_id,
      "user"
    );
    setReportDetails(reportDetails.data);
  };

  const handleCloseViewModal = () => {
    setViewingReport(null);
  };

  const getReportedEntity = (report: Report) => {
    return {
      type: "User",
      name: report.reported_user?.user_name || "Unknown User",
      image: report.reported_user?.profile_pic,
      id: report.reported_user?.user_id,
      is_blocked: report.reported_user?.blocked_by_admin ?? false,
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const columns: DataTableColumn<Report>[] = [
    {
      header: "Reported user id",
      cell: (report) => {
        const reportedEntity = getReportedEntity(report);
        return (
          <div>
            <div className="text-sm font-medium ">
              {reportedEntity.id}
            </div>
          </div>
        );
      },
    },
    {
      header: "Reported User",
      cell: (report) => {
        const reportedEntity = getReportedEntity(report);
        return (
          <div className="flex items-center">
            {reportedEntity.image && (
              <div className="flex-shrink-0 h-8 w-8 mr-3">
                <img
                  className="h-8 w-8 rounded-full object-cover"
                  src={reportedEntity.image}
                  alt={reportedEntity.name}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/assets/Avatar.png";
                  }}
                />
              </div>
            )}
            <div>
              <div className="text-sm font-medium ">
                {reportedEntity.name}
              </div>
              <div className="text-sm text-text-muted">{reportedEntity.type}</div>
            </div>
          </div>
        );
      },
    },
    {
      header: "Report Counts",
      cell: (report) => (
        <div className="flex items-center">
          <div className="ml-4">
            <div className="text-sm font-medium ">
              {report.report_count}
            </div>
          </div>
        </div>
      ),
    },
   {
  header: "Block",
  cell: (report) => (
    <Toggle
      checked={report.reported_user?.blocked_by_admin || false}
      onChange={async (checked: boolean) => {
        if (checkDemo()) return;

        const reportedEntity = getReportedEntity(report);

        // 1. Update UI immediately (optimistic update)
        setReports((prev: any) =>
          prev.map((row: any) =>
            row.reported_user?.user_id == report.reported_user?.user_id              ? {
                  ...row,
                  reported_user: row.reported_user
                    ? {
                        ...row.reported_user,
                        blocked_by_admin: checked,
                      }
                    : row.reported_user, // handle null case
                }
              : row
          )
        );

        // 2. Call API
        try {
          await userService.blockUserByAdmin({ id: reportedEntity.id });
        } catch (err) {
          console.error("Block toggle failed", err);

          // 3. Revert on error
          setReports((prev: any) =>
            prev.map((row: any) =>
              row.id === report.reported_user?.user_id
                ? {
                    ...row,
                    reported_user: row.reported_user
                      ? {
                          ...row.reported_user,
                          blocked_by_admin: !checked,
                        }
                      : row.reported_user,
                  }
                : row
            )
          );
        }
      }}
      className="p-2"
    />
  ),
},

    {
      header: "Actions",
      cell: (report) => (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => handleViewReport(report)}
          className="p-2 text-primary-dark bg-primary-dark/20"
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mt-2">
        <Breadcrumb />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-table-header-text">
            Reported Users List
          </h1>
          {/* <p className="text-sm text-gray-500 mt-1"></p> */}
        </div>
        <div className="flex items-center gap-2 relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 font-extrabold text-text-muted" />

          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            
            placeholder="Search reports..."
            className="pl-9 bg-secondary/80 text-text-muted border border-table-divider w-full min-w-[200px]"
          />
        </div>
        {/* <div className="flex items-center gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reports..."
            className="w-64"
          />
        </div> */}
      </div>

      <DataTable data={reports} columns={columns} defaultPageSize={10} />

      {/* View Report Details Modal */}
      {viewingReport && (
        <Modal
          isOpen={!!viewingReport}
          onClose={handleCloseViewModal}
          title={`Report Details (${viewingReport?.report_count})`}
          size="md" // responsive
        >
          <div className="space-y-6 overflow-auto w-[100vw] max-h-[80vh] md:w-[30vw]">
            {/* Reported User */}
            <div>
              <h4 className="text-lg font-medium text-table-header-text mb-3">
                Reported User
              </h4>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 sm:gap-5 space-y-3 sm:space-y-0">
                <img
                  className="h-12 w-12 rounded-full object-cover mx-auto sm:mx-0"
                  src={viewingReport.reported_user?.profile_pic || "/assets/Avatar.png"}
                  alt={viewingReport.reported_user?.user_name}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/assets/Avatar.png";
                  }}
                />
                <div className="text-center sm:text-left">
                  <p className="text-sm font-medium text-table-header-text">
                    {viewingReport.reported_user?.user_name}
                  </p>
                  <p className="text-sm text-table-header-text">
                    User ID: {viewingReport.reported_user?.user_id}
                  </p>
                  <p className="text-sm text-table-header-text">Type: User</p>
                </div>
              </div>
            </div>

            {/* Reports */}
            <div>
              <h4 className="text-lg font-medium text-table-header-text mb-3">
                Reports
              </h4>

              {reportDetails &&
                reportDetails.map((reportDetail) => (
                  <div
                    key={reportDetail.report_id}
                    className="space-y-6 border-t pt-4 mt-4"
                  >
                    {/* Reporter */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 sm:space-x-4 space-y-3 sm:space-y-0">
                      <img
                        className="h-12 w-12 rounded-full object-cover mx-auto sm:mx-0"
                        src={reportDetail.reporter.profile_pic || "/assets/Avatar.png"}
                        alt={reportDetail.reporter.user_name}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/assets/Avatar.png";
                        }}
                      />
                      <div className="text-center sm:text-left">
                        <p className="text-sm font-medium text-table-header-text">
                          {reportDetail.reporter.user_name || "Anonymous"}
                        </p>
                        <p className="text-sm text-table-header-text">
                          User ID: {reportDetail.reporter.user_id}
                        </p>
                      </div>
                    </div>

                    {/* Report details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-table-header-text mb-1">
                          Report ID
                        </label>
                        <p className="text-sm text-text-muted">
                          #{reportDetail.report_id}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-table-header-text mb-1">
                          Report Type
                        </label>
                        <p className="text-sm text-text-muted">
                          {reportDetail.Report_type?.report_text || "Unknown"}
                        </p>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-table-header-text mb-1">
                          Report Text
                        </label>
                        <p className="text-sm text-text-muted capitalize break-words">
                          {reportDetail.report_text || "Unknown"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-table-header-text mb-1">
                          Created
                        </label>
                        <p className="text-sm text-text-muted">
                          {formatDate(reportDetail.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <div className="mb-7"></div>
          </div>
        </Modal>
      )}


    </div>
  );
}
