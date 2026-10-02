import { BaseApiService } from "@/services/api/baseApi";

export interface CallCardResponse {
  status: boolean;
  data: Data;
  message: string;
  toast: boolean;
}

export interface Data {
  video: Audio;
  audio: Audio;
}

export interface Audio {
  totalCalls: number;
  callsFromStartToOneMonthAgo: number;
}

export interface YearlyCallDataResponse {
  status: boolean;
  data: YearlyCallDataResponseData;
  message: string;
  toast: boolean;
}

export interface YearlyCallDataResponseData {
  videoCallsCount: YearlyCallDataResponseDataCallsCount[];
  audioCallsCount: YearlyCallDataResponseDataCallsCount[];
}

export interface YearlyCallDataResponseDataCallsCount {
  month: string;
  count: string;
}

export type YearlyCallDataParams = {
  year?: number;
};

class CallService extends BaseApiService {
  constructor() {
    super("admin");
  }

  async getCallCard(): Promise<CallCardResponse> {
    return this.get<CallCardResponse, CallCardResponse>("/calls-cnt", {});
  }
  async getYearlyCallData(
    params: YearlyCallDataParams = {}
  ): Promise<YearlyCallDataResponse> {
    return this.post<YearlyCallDataResponse, YearlyCallDataResponse>(
      "/yearly-calls-data",
      {
        year: params.year,
      }
    );
  }

  async getCallsList(params: any): Promise<any> {
    return this.post<any, any>("/calls-list", {
      call_type: params.call_type || "audio",
      page: params.page || 1,
      limit: params.limit || 10,
    });
  }
}

export const callService = new CallService();
