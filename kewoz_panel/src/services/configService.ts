import { BaseApiService } from "@/services/api/baseApi";

export interface ConfigData {
  app_logo_light: string;
  app_logo_dark: string;
  one_signal_api_key: string;
  web_logo_light: string;
  web_logo_dark: string;
  twilio_account_sid: string;
  twilio_auth_token: string;
  twilio_phone_number: string;
  password: string;
  email_banner: string;
  config_id: number;
  phone_authentication: boolean;
  email_authentication: boolean;
  maximum_members_in_group: number;
  user_name_flow: boolean;
  contact_flow: boolean;
  one_signal_app_id: string;
  android_channel_id: string;
  app_name: string;
  app_email: string;
  app_text: string;
  app_primary_color: string;
  app_secondary_color: string;
  app_ios_link: string;
  app_android_link: string;
  app_tell_a_friend_text: string;
  email_service: string;
  smtp_host: string;
  email: string;
  email_title: string;
  copyright_text: string;
  privacy_policy: string;
  terms_and_conditions: string;
  createdAt: string;
  updatedAt: string;
  picture_type?:string;
  is_twilio_enabled:string,
  is_msg91_enabled:string,
  is_firebase_auth_enabled:boolean,
  firebase_auth_api_key:string,
  firebase_auth_project_id:string,
  firebase_auth_service_json:string,
  msg91_sender_id:string,
  msg91_api_key:string,
  msg91_template_id:string,
  masked_purchase_code:string,
  splash_enabled: boolean,
  splash_mode: string,
  splash_image: string,
  splash_image_mobile: string,
  splash_click_url: string,
  splash_duration: number,
  splash_title: string,
  splash_subtitle: string,
  splash_bg_color: string,
  splash_bg_color_end: string,
  splash_button1_text: string,
  splash_button1_url: string,
  splash_button2_text: string,
  splash_button2_url: string,
  splash_buttons: string,
  splash_extra: string,
  splash_template_mobile: string,

}

export interface ConfigResponse {
  status: boolean;
  data: ConfigData;
  message: string;
  toast: boolean;
}

class ConfigService extends BaseApiService {
  constructor() {
    super("");
  }

  async getConfig(): Promise<ConfigResponse> {
    return this.get<ConfigResponse, ConfigResponse>("/config");
  }

  async updateConfig(data: Partial<ConfigData> | FormData): Promise<ConfigResponse> {
    if (data instanceof FormData) {
      // For FormData, we need to bypass TypeScript's type checking
      // since we know the backend expects FormData for file uploads
      return this.put<any, ConfigResponse, any>(
        "/config",
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
    } else {
      // Create a properly typed payload
      const payload: Record<string, any> = {};
      
      // Copy only defined values to the payload
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          payload[key] = value;
        }
      });

      return this.put<ConfigResponse, ConfigResponse, Record<string, any>>(
        "/config",
        payload
      );
    }
  }
  async deactivate(): Promise<ConfigResponse> {
      // For FormData, we need to bypass TypeScript's type checking
      // since we know the backend expects FormData for file uploads
      return this.post<any, ConfigResponse, any>(
        "/config/deactivate",
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
   
  }
}

export const configService = new ConfigService();
