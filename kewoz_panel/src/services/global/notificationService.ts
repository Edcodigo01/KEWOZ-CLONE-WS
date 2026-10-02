import { BaseApiService } from "@/services/api/baseApi";
import { API_CONFIG } from "@/config/api";

export interface IsNotificationAvailableResponse {
    status: boolean;
    data: IsNotificationAvailableResponseData;
    message: string;
    toast: boolean;
}

export interface IsNotificationAvailableResponseData {
    is_available: boolean;
}


export interface NotificationListResponse {
    status: boolean;
    data: NotificationListResponseData;
    message: string;
    toast: boolean;
}

export interface NotificationListResponseData {
    newUsers: NewUser[];
    Pagination: Pagination;
}

export interface Pagination {
    total_pages: number;
    total_records: number;
    current_page: number;
    records_per_page: number;
}

export interface NewUser {
    user_name: string;
    mobile_num: string;
    user_id: number;
    first_name: string;
    last_name: null | string;
    profile_pic:  null | string;
    createdAt:string

}


export interface NotificationListParams{
    page?: number,
    limit?:number
}

// ─── Mass Message types ─────────────────────────────────────────────────────

export interface MassMessageSendParams {
    title: string;
    message: string;
    image?: File | null;
    filter_type: "all" | "countries";
    countries?: string[];
}

export interface MassMessageSendResponse {
    status: boolean;
    data: MassMessageSendData;
    message: string;
    toast: boolean;
}

export interface MassMessageSendData {
    notification_id: number;
    target_count: number;
    sent_count: number;
    image_url: string;
}

export interface MassMessagePreviewCountParams {
    filter_type: "all" | "countries";
    countries?: string[];
}

export interface MassMessagePreviewCountResponse {
    status: boolean;
    data: {
        total: number;
        withToken: number;
        filter_type: "all" | "countries";
        countries: string[];
    };
    message: string;
    toast: boolean;
}

export interface MassMessageListItem {
    notification_id: number;
    title: string;
    message: string;
    image_url: string;
    filter_type: "all" | "countries";
    filter_countries: string[];
    target_count: number;
    sent_count: number;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface MassMessageListResponse {
    status: boolean;
    data: {
        Records: MassMessageListItem[];
        Pagination: Pagination;
    };
    message: string;
    toast: boolean;
}

class NotificationService extends BaseApiService {
    constructor() {
        super("admin");
    }

    async isNotificationAvailable(): Promise<IsNotificationAvailableResponse> {
        return this.get<IsNotificationAvailableResponse, IsNotificationAvailableResponse>("/is-notification-available" );
    }

    async notificationList(params: NotificationListParams = {}): Promise<NotificationListResponse> {
        return this.post<NotificationListResponse, NotificationListResponse>("/new-user-notifications", {
          page: params.page ?? API_CONFIG.PAGINATION.DEFAULT_PAGE,
          limit: params.limit ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
        });
      }

    async sendMassMessage(params: MassMessageSendParams): Promise<MassMessageSendResponse> {
        const formData = new FormData();
        formData.append("title", params.title);
        formData.append("message", params.message);
        formData.append("filter_type", params.filter_type);
        if (params.filter_type === "countries" && params.countries && params.countries.length > 0) {
            formData.append("countries", JSON.stringify(params.countries));
        }
        if (params.image) {
            formData.append("pictureType", "mass_message_image");
            formData.append("image", params.image);
        }

        return this.post<MassMessageSendResponse, MassMessageSendResponse, FormData>(
            "/mass-message/send",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
    }

    async previewMassMessageCount(
        params: MassMessagePreviewCountParams
    ): Promise<MassMessagePreviewCountResponse> {
        return this.post<MassMessagePreviewCountResponse, MassMessagePreviewCountResponse>(
            "/mass-message/preview-count",
            params
        );
    }

    async getMassMessages(
        page: number = 1,
        pageSize: number = 10
    ): Promise<MassMessageListResponse> {
        return this.post<MassMessageListResponse, MassMessageListResponse>(
            "/list-broadcast-notification",
            { page, pageSize }
        );
    }
}

export const notificationService = new NotificationService();
