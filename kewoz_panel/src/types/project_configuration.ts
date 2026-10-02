export interface ProjectConfiguration {
    status:  boolean;
    data:    Data;
    message: string;
    toast:   boolean;
}

interface Data {
    app_logo_light:           string;
    app_logo_dark:            string;
    one_signal_api_key:       string;
    web_logo_light:           string;
    web_logo_dark:            string;
    twilio_account_sid:       string;
    twilio_auth_token:        string;
    twilio_phone_number:      string;
    password:                 string;
    email_banner:             string;
    config_id:                number;
    phone_authentication:     boolean;
    email_authentication:     boolean;
    maximum_members_in_group: number;
    user_name_flow:           boolean;
    contact_flow:             boolean;
    one_signal_app_id:        string;
    android_channel_id:       string;
    app_name:                 string;
    app_email:                string;
    app_text:                 string;
    app_primary_color:        string;
    app_secondary_color:      string;
    app_ios_link:             string;
    app_android_link:         string;
    app_tell_a_friend_text:   string;
    favicon_light:           string;
    favicon_dark:            string;
    email_service:            string;
    smtp_host:                string;
    email:                    string;
    email_title:              string;
    copyright_text:           string;
    privacy_policy:           string;
    terms_and_conditions:     string;
    createdAt:                Date;
    updatedAt:                Date;
}


/**
 * Auth store actions
 */
export interface AuthActions {
  getConfiguration: () => Promise<void>;

}

/**
 * Combined auth store type
 */
export type AuthStore = AuthState & AuthActions;
