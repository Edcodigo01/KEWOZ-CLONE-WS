import { BaseApiService } from "@/services/api/baseApi";

export type NotificationParams = {
  title: string;
  message: string;
  // pictureType: "avatar" | "profile" | "custom";
  // files: File;
};



export interface SendNotificationResponse {
  status: boolean;
  data: null;
  message: string;
  toast: boolean;
}


export interface NotificationListResponse {
  status: boolean;
  data: Data;
  message: string;
  toast: boolean;
}

export interface Data {
  Records: Record[];
  Pagination: Pagination;
}

export interface Pagination {
  total_pages: number;
  total_records: number;
  current_page: number;
  records_per_page: number;
}

export interface Record {
  notification_id: number;
  title: string;
  message: string;
  users: number[];
  createdAt: Date;
  updatedAt: Date;
}




class PushNotificationService extends BaseApiService {
  constructor() {
    super("admin");
  }

  async sendNotification(
    params: NotificationParams
  ): Promise<SendNotificationResponse> {
    const formData = new FormData();
    formData.append("title", params.title);
    formData.append("message", params.message);
    

    return this.post<SendNotificationResponse, SendNotificationResponse, FormData>(
      "/notification",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  }

  async notificationList(
  ): Promise<NotificationListResponse> {

    return this.post<NotificationListResponse, NotificationListResponse>(
      "list-broadcast-notification",
     
    );
  }


  // async getAvatarList(): Promise<AvatarListResponse> {
  //   return this.get<AvatarListResponse>("/get-all-avatars");
  // }



  
}

export const pushNotificationService = new PushNotificationService();
