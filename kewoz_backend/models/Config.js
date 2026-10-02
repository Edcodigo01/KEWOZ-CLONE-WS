module.exports = (sequelize, DataTypes) => {
    const Config = sequelize.define("Config", {
        config_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        phone_authentication: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        email_authentication: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        maximum_members_in_group: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        user_name_flow: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        contact_flow: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        demo_credential: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        app_logo_light: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
            get() {
                const raw_urls = this.getDataValue("app_logo_light");
                const imageUrls = `${process.env.baseUrl}/${raw_urls}`;
                return imageUrls != process.env.baseUrl ? imageUrls : ``;
            },
        },
        app_logo_dark: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
            get() {
                const raw_urls = this.getDataValue("app_logo_dark");
                const imageUrls = `${process.env.baseUrl}/${raw_urls}`;
                return imageUrls != process.env.baseUrl ? imageUrls : ``;
            },
        },
        business_app_logo_light: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
            get() {
                const raw_urls = this.getDataValue("business_app_logo_light");
                const imageUrls = `${process.env.baseUrl}/${raw_urls}`;
                return imageUrls != process.env.baseUrl ? imageUrls : ``;
            },
        },
        business_app_logo_dark: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
            get() {
                const raw_urls = this.getDataValue("business_app_logo_dark");
                const imageUrls = `${process.env.baseUrl}/${raw_urls}`;
                return imageUrls != process.env.baseUrl ? imageUrls : ``;
            },
        },
        one_signal_app_id: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
        },
        one_signal_api_key: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
            get() {
                const data = this.getDataValue("one_signal_api_key");
                if (!data) return "";
                return data.length > 4
                    ? "*".repeat(data.length - 4) + data.slice(-4)
                    : data;
            }
        },
        android_channel_id: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
        },
        one_signal_app_id_business: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
        },
        one_signal_api_key_business: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
            get() {
                const data = this.getDataValue("one_signal_api_key");
                if (!data) return "";
                return data.length > 4
                    ? "*".repeat(data.length - 4) + data.slice(-4)
                    : data;
            }
        },
        android_channel_id_business: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
        },
        app_name: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
        },
        app_email: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
        },
        app_text: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
        },
        app_primary_color: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
        },
        app_secondary_color: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
        },
        app_ios_link: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
        },
        app_android_link: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
        },
        app_tell_a_friend_text: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
        },
        web_logo_light: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
            get() {
                const raw_urls = this.getDataValue("web_logo_light");
                const imageUrls = `${process.env.baseUrl}/${raw_urls}`;
                return imageUrls != process.env.baseUrl ? imageUrls : ``;
            },
        },
        web_logo_dark: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
            get() {
                const raw_urls = this.getDataValue("web_logo_dark");
                const imageUrls = `${process.env.baseUrl}/${raw_urls}`;
                return imageUrls != process.env.baseUrl ? imageUrls : ``;
            },
        },
        business_web_logo_light: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
            get() {
                const raw_urls = this.getDataValue("business_web_logo_light");
                const imageUrls = `${process.env.baseUrl}/${raw_urls}`;
                return imageUrls != process.env.baseUrl ? imageUrls : ``;
            },
        },
        business_web_logo_dark: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
            get() {
                const raw_urls = this.getDataValue("business_web_logo_dark");
                const imageUrls = `${process.env.baseUrl}/${raw_urls}`;
                return imageUrls != process.env.baseUrl ? imageUrls : ``;
            },
        },
        twilio_account_sid: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
            get() {
                const data = this.getDataValue("twilio_account_sid");
                if (!data) return "";
                return data.length > 4
                    ? "*".repeat(data.length - 4) + data.slice(-4)
                    : data;
            }
        },
        twilio_auth_token: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
            get() {
                const data = this.getDataValue("twilio_auth_token");
                if (!data) return "";
                return data.length > 4
                    ? "*".repeat(data.length - 4) + data.slice(-4)
                    : data;
            }
        },
        twilio_phone_number: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
            get() {
                const data = this.getDataValue("twilio_phone_number");
                if (!data) return "";
                return data.length > 4
                    ? "*".repeat(data.length - 4) + data.slice(-4)
                    : data;
            }
        },
        is_twilio_enabled: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: false,
        },
        is_msg91_enabled: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: false,
        },
        msg91_sender_id: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
            get() {
                const data = this.getDataValue("msg91_sender_id");
                if (!data) return "";
                return data.length > 4
                    ? "*".repeat(data.length - 4) + data.slice(-4)
                    : data;
            }
        },
        msg91_api_key: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
            get() {
                const data = this.getDataValue("msg91_api_key");
                if (!data) return "";
                return data.length > 4
                    ? "*".repeat(data.length - 4) + data.slice(-4)
                    : data;
            }
        },
        msg91_template_id: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
            get() {
                const data = this.getDataValue("msg91_template_id");
                if (!data) return "";
                return data.length > 4
                    ? "*".repeat(data.length - 4) + data.slice(-4)
                    : data;
            }
        },
        email_service: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
        },
        smtp_host: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
        },
        password: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
            get() {
                const data = this.getDataValue("sender_password");
                if (!data) return "";
                return "*".repeat(data.length)
            }
        },
        email_title: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
        },
        copyright_text: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
        },
        email_banner: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
            get() {
                const raw_urls = this.getDataValue("email_banner");
                const imageUrls = `${process.env.baseUrl}${raw_urls}`;
                return imageUrls != process.env.baseUrl ? imageUrls : ``;
            },
        },
        lable_colors: {
            type: DataTypes.ARRAY(DataTypes.STRING), 
            allowNull: true, 
        },
        is_firebase_auth_enabled: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        firebase_auth_api_key: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
            get() {
                const data = this.getDataValue("firebase_auth_api_key");
                if (!data) return "";
                return data.length > 4
                    ? "*".repeat(data.length - 4) + data.slice(-4)
                    : data;
            }
        },
        firebase_auth_project_id: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
        },
        firebase_auth_service_json: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
        },
        purchase_code: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: '',
            get() {
                const data = this.getDataValue('purchase_code');
                if (!data) return '';
                return data.length > 4
                    ? '*'.repeat(data.length - 4) + data.slice(-4)
                    : data;
            }
        },
        masked_purchase_code: {
            type: DataTypes.VIRTUAL,
            get() {
                const data = this.getDataValue('purchase_code');
                if (!data) return '';
                return data.length > 4
                    ? '*'.repeat(data.length - 4) + data.slice(-4)
                    : data;
            }
        },
        privacy_policy: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: "",
        },
        terms_and_conditions: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: "",
        },
        splash_enabled: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        splash_mode: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "template",
        },
        splash_image: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
            get() {
                const raw_urls = this.getDataValue("splash_image");
                if (!raw_urls) return "";
                const imageUrls = `${process.env.baseUrl}/${raw_urls}`;
                return imageUrls != `${process.env.baseUrl}/` ? imageUrls : ``;
            },
        },
        splash_image_mobile: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
            get() {
                const raw_urls = this.getDataValue("splash_image_mobile");
                if (!raw_urls) return "";
                const imageUrls = `${process.env.baseUrl}/${raw_urls}`;
                return imageUrls != `${process.env.baseUrl}/` ? imageUrls : ``;
            },
        },
        splash_template_mobile: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null,
        },
        splash_click_url: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
        },
        splash_duration: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 4,
        },
        splash_title: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "Kewoz Pro",
        },
        splash_subtitle: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
        },
        splash_bg_color: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "#1A0033",
        },
        splash_bg_color_end: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "#3D0066",
        },
        splash_button1_text: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
        },
        splash_button1_url: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
        },
        splash_button2_text: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
        },
        splash_button2_url: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
        },
        splash_buttons: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: "[]",
        },
        splash_extra: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: "{}",
        },
        banner_enabled: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        banner_title: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
        },
        banner_subtitle: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
        },
        banner_image: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
            get() {
                const raw_urls = this.getDataValue("banner_image");
                if (!raw_urls) return "";
                const imageUrls = `${process.env.baseUrl}/${raw_urls}`;
                return imageUrls != process.env.baseUrl ? imageUrls : "";
            },
        },
        banner_click_url: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
        },
        banner_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },

    })
    return Config;
}