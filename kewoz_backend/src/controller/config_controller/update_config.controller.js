const config_service = require("../../service/common/config.service");
const { generalResponse } = require("../../helper/response.helper");
const updateFieldsFilter = require("../../helper/updateField.helper");
const updateEnvVariable = require("../../service/common/env.service");

async function updateConfig(req, res) {
    try {
        let filteredData;
        try {
            // Filter incoming request body to allow only specific fields to be updated
            filteredData = updateFieldsFilter(req.body, [
                "phone_authentication",
                "email_authentication",
                "maximum_members_in_group",
                "user_name_flow",
                "contact_flow",
                "is_twilio_enabled",
                "is_msg91_enabled",
                "one_signal_app_id",
                "one_signal_api_key",
                'android_channel_id',
                "one_signal_app_id_business",
                "one_signal_api_key_business",
                'android_channel_id_business',
                "app_name",
                "app_email",
                "app_text",
                "app_primary_color",
                "app_secondary_color",
                "app_ios_link",
                "app_android_link",
                "app_tell_a_friend_text",
                "twilio_account_sid",
                "twilio_auth_token",
                "twilio_phone_number",
                "msg91_sender_id",
                "msg91_api_key",
                "msg91_template_id",
                "email_service",
                "smtp_host",
                "email",
                "password",
                "email_title",
                "copyright_text",
                "privacy_policy",
                "terms_and_conditions",
                "lable_colors"
            ,
                "is_firebase_auth_enabled",
                "firebase_auth_api_key",
                "firebase_auth_project_id",
                "firebase_auth_service_json", "purchase_code",
                "splash_enabled",
                "splash_mode",
                "splash_click_url",
                "splash_duration",
                "splash_title",
                "splash_subtitle",
                "splash_bg_color",
                "splash_bg_color_end",
                "splash_button1_text",
                "splash_button1_url",
                "splash_button2_text",
                "splash_button2_url",
                "splash_buttons",
                "splash_extra",
                "splash_image_mobile",
                "splash_template_mobile",
                "banner_enabled",
                "banner_title",
                "banner_subtitle",
                "banner_image",
                "banner_click_url",
                "banner_active",
                "app_logo_light",
                "app_logo_dark",
                "web_logo_light",
                "web_logo_dark" ], false);
        }
        catch (err) {
            // If invalid fields or filtering error occurs, return error response
            return generalResponse(
                res,
                {},
                err.message,
                false,
                true
            );
        }

        const envUpdateKeys = [
            "twilio_account_sid",
            "twilio_auth_token",
            "twilio_phone_number",
            "is_twilio_enabled",
            "is_msg91_enabled",
            "msg91_sender_id",
            "msg91_api_key",
            "app_name",
            "msg91_template_id",
            "one_signal_app_id",
            "one_signal_api_key",
            "android_channel_id",
            "one_signal_app_id_business",
            "one_signal_api_key_business",
            "android_channel_id_business",
        ,
            "firebase_auth_api_key",
            "firebase_auth_project_id"]
        // Attach uploaded file paths (if provided) to the filtered data
        if (req.app_logo_light?.length > 0) {
            filteredData.app_logo_light = req.app_logo_light[0].path;
        }
        if (req.app_logo_dark?.length > 0) {
            filteredData.app_logo_dark = req.app_logo_dark[0].path;
        }
        if (req.splash_image?.length > 0) {
            filteredData.splash_image = req.splash_image[0].path;
        }
        if (req.splash_image_mobile?.length > 0) {
            filteredData.splash_image_mobile = req.splash_image_mobile[0].path;
        }
        if (req.web_logo_light?.length > 0) {
            filteredData.web_logo_light = req.web_logo_light[0].path;
        }
        if (req.web_logo_dark?.length > 0) {
            filteredData.web_logo_dark = req.web_logo_dark[0].path;
        }

        // Fetch current config from DB
        let config = await config_service.getConfig();

        // Update config in DB with filtered data using config_id as identifier
        config = await config_service.updateConfig(filteredData, { config_id: config.config_id });

        // If config does not exist, return 404
        if (!config) {
            return generalResponse(
                res,
                {},
                "Config not found",
                false,
                true,
                404
            );
        }

        // (Optional) Update .env file with new configuration values (not implemented here)
        for (const [key, value] of Object.entries(filteredData)) {
            if (envUpdateKeys.includes(key) && value !== undefined) {
                updateEnvVariable(key, value);
            }
        }
        return generalResponse(
            res,
            config,
            "Config updated",
            true,
            false,
            200
        );

    }
    catch (error) {
        // Log unexpected error and return 500 response
        console.error("Error in updating Config", error);
        return generalResponse(
            res,
            {},
            error.message,
            false,
            true,
            500
        );
    }
}

module.exports = {
    updateConfig,
};
