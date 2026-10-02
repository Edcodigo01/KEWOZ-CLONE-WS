import { BaseApiService } from "@/services/api/baseApi";

// Types for Report API
export interface Reporter {
  user_name: string;
  profile_pic: string;
  user_id: number;
  is_admin: boolean;
}

export interface ReportedUser {
  user_name: string;
  profile_pic: string;
  user_id: number;
  blocked_by_admin: boolean;
}

export interface ReportType {
  report_type_id: number;
  report_text: string;
  report_for: string;
}

export interface ReportedGroup {
  group_icon: string;
  chat_id: number;
  group_name: string;
  is_group_blocked: boolean;
}

export interface Report {
  report_id: number;
  report_type: string | null;
  report_text: string | null;
  createdAt: string;
  updatedAt: string;
  report_by: number;
  report_to_user: number | null;
  report_to_group: number | null;
  report_type_id: number;
  report_to: string | null;
  report_count: number;
  reporter: Reporter;
  reported_user: ReportedUser | null;
  Report_type: ReportType;
  reported_group: ReportedGroup | null;
}

export interface ReportDetails {
  data: ReportDetail[];
  message: string;
  stats: string;
  toast: boolean;
}

export interface ReportDetail {
  report_id: number;
  report_type: string | null;
  report_text: string | null;
  createdAt: string;
  updatedAt: string;
  report_by: number;
  report_to_user: number | null;
  report_to_group: number | null;
  report_type_id: number;
  report_to: string | null;
  report_count: number;
  reporter: Reporter;
  reported_user: ReportedUser | null;
  Report_type: ReportType;
  reported_group: ReportedGroup | null;
}

export interface ReportsPagination {
  totalPages: number;
  currentPage: string;
  pageSize: number;
}

export interface ReportedEntitiesResponse {
  status: boolean;
  data: ReportedEntity;
  message: string;
  toast: boolean;
}

export interface ReportedEntity {
  data: Report[];
}

export interface ReportsData {
  ReportTypes: ReportType[];
}

export interface ReportsResponse {
  status: boolean;
  data: ReportsData;
  message: string;
  toast: boolean;
}

export interface ReportsListParams {
  page?: number;
  limit?: number;
  type?: string;
}

export interface ReportTypeParams {
  report_text?: string;
  report_for?: string;
}

export interface ReportTypeResponse {
  status: boolean;
  data: ReportType;
  message: string;
  toast: boolean;
}

class ReportService extends BaseApiService {
  constructor() {
    super("report");
  }

  async getReportedEntities(
    params: ReportsListParams = {}
  ): Promise<ReportedEntitiesResponse> {
    const { page = 1, limit = 10, type = "user" } = params;

    return this.post<ReportedEntitiesResponse>(`/reported-entities`, {
      page,
      limit,
      type,
    });
  }

  async addReportType(
    params: ReportTypeParams = {}
  ): Promise<ReportTypeResponse> {
    return this.post<ReportTypeResponse, ReportTypeResponse>(
      `/add-reports`,
      params
    );
  }

  async getReportTypes(
    params: ReportsListParams = {}
  ): Promise<ReportsResponse> {
    const { page = 1, limit = 10 } = params;

    return this.post<ReportsResponse>(`/reported-entities`, { page, limit });
  }

  async getReportTypesList(): Promise<ReportsResponse> {
    return this.post<ReportsResponse>(`/report-types`, {});
  }

  async deleteReportType({
    id,
    shouldDelete,
  }: {
    id: number;
    shouldDelete: boolean;
  }): Promise<ReportsResponse> {
    return this.post<ReportsResponse>(`/delete-report-type`, {
      report_type_id: id,
      delete: shouldDelete, // backend still expects "delete"
    });
  }

  async getReportDetails(id: number, type: string): Promise<ReportDetails> {
    return this.post<ReportDetails>(`/report-details`, {
      id,
      type,
    });
  }
}

export const reportService = new ReportService();
