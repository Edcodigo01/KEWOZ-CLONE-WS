import { BaseApiService } from "@/services/api/baseApi";
import { API_CONFIG } from "@/config/api";

export type UsersListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  filter?: string;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
};

export type DailyActiveUserParams = {
  month?: number;
  year?: number;
};
export type UsersListItem = {
  user_id: number;
  blocked: {
    user_id: number;
    user_name: string;
    email: string;
    first_name: string;
    last_name: string;
    profile_pic: string;
  };
  blocker: {
    user_id: number;
    user_name: string;
    email: string;
    first_name: string;
    last_name: string;
    profile_pic: string;
  };
  country: string;
  country_short_name: string;
  platforms: string[];
  createdAt: string;
  status?: string;
  blocked_by_admin: boolean;
};

export type UsersListResponse = {
  status: boolean;
  data: {
    users: UsersListItem[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      total_pages: number;
    };
  };
  message: string;
  toast?: boolean;
};

export type CountryUsersCount = {
  country: string;
  count: string | number;
};

export type CountryUsersCountResponse = {
  status: boolean;
  data: CountryUsersCount[];
  message?: string;
  toast?: boolean;
};

export interface UserCardResponse {
  status: boolean;
  data: Data;
  message: string;
  toast: boolean;
}

export interface Data {
  totalUsers: number;
  usersFromStartToOneMonthAgo: number;
}

export interface PlatformUserCountResponse {
  status: boolean;
  data: PlatformUserCountResponseData;
  message: string;
  toast: boolean;
}

export interface PlatformUserCountResponseData {
  web: Android;
  android: Android;
  ios: Ios;

}

export interface Android {
  totalUsers: number;
  usersFromStartToOneMonthAgo: number;
}
export interface Ios {
  totalUsers: number;
  usersFromStartToOneMonthAgo: number;
}

export interface WeeklyUserCountResponse {
  status: boolean;
  data: WeeklyUserCountResponseData;
  message: string;
  toast: boolean;
}

export interface WeeklyUserCountResponseData {
  newUsers: NewUser[];
}

export interface NewUser {
  day: string;
  count: number;
}
export interface DailyActiveUserResposne {
  status: boolean;
  data: DailyActiveUserResposneData[];
  message: string;
  toast: boolean;
}

export interface DailyActiveUserResposneData {
  date: string;
  count: number;
}

class UserService extends BaseApiService {
  constructor() {
    super("");
  }

  async getUsersList(params: UsersListParams = {}): Promise<UsersListResponse> {
    return this.post<UsersListResponse, UsersListResponse>("/admin/users", {
      page: params.page ?? API_CONFIG.PAGINATION.DEFAULT_PAGE,
      pageSize: params.pageSize ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
      ...(params.filter !== undefined ? { filter: params.filter } : {}),
      ...(params.search && { search: params.search }),
      ...(params.orderBy && { orderBy: params.orderBy }),
      ...(params.orderDirection && { orderDirection: params.orderDirection }),
    });
  }

  async getDailyactiveUsers(
    params: DailyActiveUserParams = {}
  ): Promise<DailyActiveUserResposne> {
    return this.post<DailyActiveUserResposne, DailyActiveUserResposne>(
      "/admin/get-daily-active-users",
      {
        month: params.month,
        year: params.year,
      }
    );
  }
  async getUsersByCountry(): Promise<CountryUsersCountResponse> {
    return this.get<CountryUsersCountResponse, CountryUsersCountResponse>(
      "/admin/users-cnt-country-wise"
    );
  }
  async getUsersByCountryLast30mins(): Promise<CountryUsersCountResponse> {
    return this.get<CountryUsersCountResponse, CountryUsersCountResponse>(
      "/admin/users-cnt-country-wise-last-30-mins"
    );
  }
  async getUsersCard(): Promise<UserCardResponse> {
    return this.get<UserCardResponse, UserCardResponse>("/admin/users-cnt");
  }
  async getPlatformUserCounts(): Promise<PlatformUserCountResponse> {
    return this.get<PlatformUserCountResponse, PlatformUserCountResponse>(
      "/admin/users-list-by-platform"
    );
  }
  async getWeeklyUsers(): Promise<WeeklyUserCountResponse> {
    return this.get<WeeklyUserCountResponse, WeeklyUserCountResponse>(
      "/admin/new-users-of-week"
    );
  }

  async getBlockedUserList(
    params: UsersListParams = {}
  ): Promise<UsersListResponse> {
    return this.post<UsersListResponse, UsersListResponse>(
      "/admin/get-block-list",
      {
        page: params.page ?? API_CONFIG.PAGINATION.DEFAULT_PAGE,
        pageSize: params.pageSize ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
        filter: "user",
      }
    );
  }

  async blockUserByAdmin(params: any) {
    return this.put<UserCardResponse>("/admin/block-user", {
      user_id: params.id,
    });
  }

  async checkUsername(user_name: string) {
    return this.post<any, any>("/admin/check-username", { user_name });
  }

  async checkPhone(mobile_num: string, country_code?: string) {
    return this.post<any, any>("/admin/check-phone", { mobile_num, country_code });
  }

  async createUserByAdmin(data: Record<string, any> | FormData) {
    if (data instanceof FormData) {
      const response = await this.apiClient.post("/admin/add-user", data);
      return response.data;
    }
    return this.post<any, any>("/admin/add-user", data);
  }

  async deleteSingleUser(user_id: number) {
    return this.post<any, any>("/admin/delete-user", { user_id });
  }

  async getAvatars() {
    return this.get<any, any>("/avatar/get-all-avatars");
  }
}

export const userService = new UserService();
