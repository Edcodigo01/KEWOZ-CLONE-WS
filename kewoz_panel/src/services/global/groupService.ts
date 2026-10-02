import { BaseApiService } from "@/services/api/baseApi";
import { API_CONFIG } from "@/config/api";

export type groupListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  filter?: string;
  sortBy?: string;
  sortOrder?: string;
};

export type YearlyUserAndGroupsParams = {
  year: number;
};
export interface GroupDataResponse {
  status: boolean;
  data: Data;
  message: string;
  toast: boolean;
}

export interface Data {
  chats: Chat[];
  pagination: Pagination;
}

export interface Chat {
  group_icon: string;
  chat_id: number;
  chat_type: ChatType;
  group_name: string;
  group_description: string;
  deleted_at: null;
  is_group_blocked: boolean;
  archived_for: string[];
  blocked_by: string[];
  cleared_for: string[];
  deleted_for: any[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: null;
  participants: Participant[];
}

export enum ChatType {
  Private = "private",
}

export interface Participant {
  participant_id: number;
  is_creator: Boolean;
  User: User;
}

export interface User {
  user_name: string;
  profile_pic: string;
  user_id: number;
  full_name: string;
  country: Country;
}

export enum Country {
  India = "India",
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  total_pages: number;
}

export interface GroupCardResponse {
  status: boolean;
  data: Data;
  message: string;
  toast: boolean;
}

export interface Data {
  totalGroupChats: number;
  groupChatsFromStartToOneMonthAgo: number;
}
export interface YearlyUsersGroupResponse {
  status: boolean;
  data: Data;
  message: string;
  toast: boolean;
}

export interface Data {
  newUsersCount: NewSCount[];
  newGroupsCount: NewSCount[];
}

export interface NewSCount {
  month: string;
  count: string;
}

class GroupService extends BaseApiService {
  constructor() {
    super("admin");
  }

  async getGroupList(params: groupListParams = {}): Promise<GroupDataResponse> {
    return this.post<GroupDataResponse, GroupDataResponse>("/group-chats", {
      page: params.page ?? API_CONFIG.PAGINATION.DEFAULT_PAGE,
      pageSize: params.pageSize ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
      ...(params.filter !== undefined ? { filter: params.filter } : {}),
      ...(params.search && { search: params.search }),
      sortOrder: params.sortOrder,
      sortBy: params.sortBy,
    });
  }

  async getGroupCard(): Promise<GroupCardResponse> {
    return this.get<GroupCardResponse, GroupCardResponse>("/groups-cnt", {});
  }
  async getYearlyUserAndGroups(
    params: YearlyUserAndGroupsParams
  ): Promise<YearlyUsersGroupResponse> {
    return this.post<YearlyUsersGroupResponse, YearlyUsersGroupResponse>(
      "/yearly-new-users-and-grps",
      {
        year: params.year,
        // year:params.year
      }
    );
  }

  async blockGroupById(params: any) {
    return this.put<GroupDataResponse>("/block-group", {
      chat_id: params.id,
    });
  }

  async deleteGroupById(chatId: number) {
    return this.post<GroupDataResponse>("/delete-group", {
      chat_id: chatId,
    });
  }

  async updateGroup(chatId: number, data: { group_name: string; group_description: string }) {
    return this.put<GroupDataResponse>("/update-group", { chat_id: chatId, ...data });
  }
}

export const groupService = new GroupService();
