const db = require("../../models");
const { Admin, Config, Language, Avatar, Categories } = db
const { addDefaultEntries } = require("../service/repository/Language.service");
async function createInitialEntries() {
    try {
        // Check if there are any admin entries
        const adminCount = await Admin.count();
        if (adminCount === 0) {
            // Create an initial admin entry
            await Admin.create({
                full_name: "Admin",
                user_name: "admin",
                password: "admin",
                email: "demo@kewoz.com",
            });
            await Admin.create({
                full_name: "Admin",
                user_name: "admin",
                password: "12345678",
                email: "admin@kewoz.com",
            });
        }
        const languageCount = await Language.count();
        if(languageCount ===0){
            await Language.create(
                {
                    language:"English",
                    language_alignment:"LTR",
                    country:"USA",
                    status:true,
                    default_status:true
                }
            )
        }
        // Check if there are any config entries
        const configCount = await Config.count();
        if (configCount === 0) {
            // Create an initial config entry
            await Config.create({
                phone_authentication: true,
                email_authentication: false,
                maximum_members_in_group: 10,
                user_name_flow: false,
                contact_flow: true,
                demo_credential: false,
                app_logo_light: "uploads/default/logo/app_logo_light.png",
                app_logo_dark: "uploads/default/logo/app_logo_dark.png",
                business_app_logo_light: "uploads/default/logo/business_app_logo_light.png",
                business_app_logo_dark: "uploads/default/logo/business_app_logo_dark.png",
                one_signal_app_id: "one_signal_app_id",
                one_signal_api_key: "one_signal_api_key",
                android_channel_id: "android_channel_id",
                one_signal_app_id_business: "one_signal_app_id_business",
                one_signal_api_key_business: "one_signal_api_key_business",
                android_channel_id_business: "android_channel_id_business",
                app_name: "Kewoz Business",
                app_email: "info.primocys@gmail.com",
                app_text: "Let's Chat",
                app_primary_color: "#FDC604",
                app_secondary_color: "#FFFFFF",
                app_ios_link: "https://apps.apple.com/in/app/kewoz-business-chat/id6753002073",
                app_android_link: "https://play.google.com/store/apps/details?id=com.primocysbusiness.chat&pcampaignid=web_share",
                app_tell_a_friend_text: "Let's Connect on Kewoz",
                web_logo_light: "uploads/default/logo/web_logo_light.png",
                web_logo_dark: "uploads/default/logo/web_logo_dark.png",
                business_web_logo_light: "uploads/default/logo/business_web_logo_light.png",
                business_web_logo_dark: "uploads/default/logo/business_web_logo_dark.png",
                twilio_account_sid: "twilio_account_sid",
                twilio_auth_token: "twilio_auth_token",
                twilio_phone_number: "twilio_phone_number",
                is_twilio_enabled: true,
                is_msg91_enabled: false,
                msg91_sender_id: "msg91_sender_id",
                msg91_api_key: "msg91_api_key",
                msg91_template_id: "msg91_template_id",
                email_service: "gmail",
                smtp_host: "smtp_host",
                email: "info@primocys.com",
                password: "password",
                email_title: "email_title",
                copyright_text: "© kewozchat",
                email_banner: "uploads/default/email_banner.png",
                lable_colors: ["#FC474E", "#FEE44E", "#7EFF4F", "#56FF93", "#54E2FF", "#4F7BFF", "#C53EFE", "#FC4494", "#FC4751", "#7EFF4F", "#B1131D", "#5AB71D", "#2179B2", "#A8B61E", "#8500B3", "#672528", "#672349", "#566A26", "#286668", "#282368"],
                privacy_policy: "privacy_policy",
                terms_and_conditions: "terms_and_conditions"
            });
        }

        // Add default categories
        const categoryCount = await Categories.count();


        if (categoryCount <1) {
            const defaultCategories = [
                "E-Commerce & Retail",
                "Information Technology & Software",
                "Education & Training",
                "Travel & Hospitality",
                "Healthcare & Wellness",
                "Finance & Legal",
                "Food & Beverages",
                "Real Estate & Construction",
                "Media & Entertainment",
                "Manufacturing & Industrial",
                "Agriculture & Environment",
                "Science & Research",
                "Software & Technology",

            ]
            const categories = [];

            for (const element of defaultCategories) {
                categories.push({
                    name: element,
                });
            }
            

            await Categories.bulkCreate(categories);
        }
        // Add default Avatar
        const avatarCount = await Avatar.count();

        if (avatarCount < 9) {
            const avatars = [];

            for (let index = 0; index < 9; index++) {
                avatars.push({
                    name: `avatar_${index + 1}`,
                    avatar_media: `uploads/default/avatar/avatar_${index + 1}.png`,
                    avatar_gender: index < 5 ? "male" : "female",
                    status: true,
                });
            }

            await Avatar.bulkCreate(avatars);
        }

        addDefaultEntries();
    } catch (error) {
        console.error("Error creating initial entries:", error);
    }
}

module.exports = {
    createInitialEntries
};

