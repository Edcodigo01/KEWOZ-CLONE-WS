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
import { groupService } from "@/services/global/groupService";
import { useDemoGuard } from "@/utils/demoGuard";

export default function ReportedGroupsListPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const { checkDemo } = useDemoGuard();

  const [reportDetails, setReportDetails] = useState<ReportDetail[] | null>(
    null
  );
  const fetchReports = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const response = await reportService.getReportedEntities({
        page,
        limit: 10,
        type: "group",
      });

      if (response.status) {
        setReports(response.data.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch reported groups",
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast({
        title: "Error",
        description: "Failed to fetch reported groups",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(1);
  }, []);
  const filteredReports = reports.filter((report) => {
    const searchLower = search.toLowerCase();
    return (
      report.reported_user?.user_name?.toLowerCase().includes(searchLower) ||
      report.reported_group?.group_name?.toLowerCase().includes(searchLower) ||
      report.report_text?.toLowerCase().includes(searchLower) ||
      report.report_id?.toString().includes(searchLower)
    );
  });

  const [viewingReport, setViewingReport] = useState<Report | null>(null);

  const handleViewReport = async (report: Report) => {
    setViewingReport(report);
    if (!report.reported_group?.chat_id) return;
    const reportDetails = await reportService.getReportDetails(
      report.reported_group?.chat_id,
      "group"
    );
    setReportDetails(reportDetails.data);
    console.log(reportDetails);
  };

  const handleCloseViewModal = () => {
    setViewingReport(null);
  };

  const getReportedEntity = (report: Report) => {
    return {
      type: "group",
      name: report.reported_group?.group_name || "Unknown Group",
      image: report.reported_group?.group_icon,
      id: report.reported_group?.chat_id,
      is_blocked: report.reported_group?.is_group_blocked
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
      header: "Reported Group id",
      cell: (report) => {
        const reportedEntity = getReportedEntity(report);
        return (
          <div>
            <div className="text-sm font-medium text-text-muted">
              {reportedEntity.id}
            </div>
          </div>
        );
      },
    },
    {
      header: "Reported Group",
      cell: (report) => {
        const reportedEntity = getReportedEntity(report);
        return (
          <div className="flex items-center">
            {reportedEntity.image && (
              <div className="flex-shrink-0 h-8 w-8 mr-3">
                <img
                  className="h-8 w-8 rounded-full object-cover"
                  src={reportedEntity.image || "/assets/Avatar.png"}
                  alt={reportedEntity.name}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/assets/Avatar.png";
                  }}
                />
              </div>
            )}
            <div>
              <div className="text-sm font-medium text-table-header-text">
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
            <div className="text-sm font-medium text-table-header-text">
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
      checked={report.reported_group?.is_group_blocked || false}
      onChange={async (checked: boolean) => {
        if (checkDemo()) return;

        const reportedEntity = getReportedEntity(report);
        setReports((prev) =>
          prev.map((row) =>
            row.reported_group?.chat_id === reportedEntity.id
              ? {
                  ...row,
                  reported_group: row.reported_group
                    ? { ...row.reported_group, is_group_blocked: checked }
                    : row.reported_group,
                }
              : row
          )
        );
        try {
          await groupService.blockGroupById({ id: reportedEntity.id });
        } catch (err) {
          console.error("Block toggle failed", err);

          // 3. Rollback on error
          setReports((prev) =>
            prev.map((row) =>
              row.report_id === report.report_id
                ? {
                    ...row,
                    reported_group: row.reported_group
                      ? { ...row.reported_group, is_group_blocked: !checked }
                      : row.reported_group,
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
          className="p-2 bg-white"
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
            Reported Groups List
          </h1>
        </div>
        <div className="flex items-center gap-2 relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 font-extrabold text-text-muted" />

          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            // onKeyDown={(e) => {
            //   if (e.key === "Enter") fetchAll(search);
            // }}
            placeholder="Search reports..."
            className="pl-9 bg-secondary/80 text-text-muted w-full min-w-[200px]"
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
          title="Report Details"
          size="md" // will be responsive now
        >

          <div className="space-y-6 overflow-auto w-[100vw] max-h-[80vh] md:w-[30vw]">
            {/* Reported Group */}
            <div>
              <h4 className="text-lg font-medium text-table-header-text mb-3">
                Reported Group
              </h4>
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-5 sm:space-x-4 space-y-3 sm:space-y-0">
                <img
                  className="h-12 w-12 rounded-full object-cover mx-auto sm:mx-0"
                  src={
                    viewingReport.reported_group?.group_icon ||
                    "/assets/Avatar.png"
                  }
                  alt={viewingReport.reported_group?.group_name}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/assets/Avatar.png";
                  }}
                />
                <div className="text-center sm:text-left">
                  <p className="text-sm font-medium text-table-header-text">
                    {viewingReport.reported_group?.group_name}
                  </p>
                  <p className="text-sm text-table-header-text">
                    Group ID: {viewingReport.reported_group?.chat_id}
                  </p>
                  {/* <p className="text-sm text-gray-500">Type: group</p> */}
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
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 sm:gap-5 space-y-3 sm:space-y-0">
                      <img
                        className="h-12 w-12 rounded-full object-cover mx-auto sm:mx-0"
                        src={reportDetail.reporter.profile_pic}
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
                        {/* {reportDetail.reporter.is_admin && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Admin
                          </span>
                        )} */}
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
                      <div>
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
