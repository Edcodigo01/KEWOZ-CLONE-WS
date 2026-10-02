const contacts_service = require("../../service/repository/Contacts.service");
const { generalResponse } = require("../../helper/response.helper");
const user_service = require("../../service/repository/user.service");
const { Participant, Sequelize } = require("../../../models");
const { Op } = require("sequelize");

async function getContacts(req, res) {
    try {
        const user_id = req.authData.user_id;

        const isContacts = await contacts_service.getContacts(user_id);

        if (!isContacts || !isContacts.contact_details?.length) {
            return generalResponse(res, [], "Contacts not found", false, true, 404);
        }

        const contactList = isContacts.contact_details;

        const final_details = (
            await Promise.all(
                contactList.map(async (element) => {

                    // 🔹 Get user details
                    const user = await user_service.getUser({
                        user_id: element.user_id
                    });

                    if (!user) return null;

                    const updated_user = user.toJSON();
                    if (updated_user.bloked_by_admin) return null;

                    // 🔥 FIND COMMON CHAT BETWEEN 2 USERS
                    const participant = await Participant.findOne({
                        where: {
                            user_id: user_id,
                            chat_id: {
                                [Op.in]: Sequelize.literal(`(
                                    SELECT chat_id FROM "Participants"
                                    WHERE user_id = ${element.user_id}
                                )`)
                            }
                        },
                        attributes: ["is_locked" ,"chat_id"]
                    });

                    return {
                        ...element,
                        user_name: updated_user.user_name,
                        updatedAt: updated_user.updatedAt,
                        profile_pic: updated_user.profile_pic,
                        banner_image: updated_user.banner_image,

                        // ✅ FIXED FIELD
                        is_chat_lock: participant ? participant.is_locked : false,
                        chat_id: participant ? participant.chat_id : null
                    };
                })
            )
        ).filter(Boolean);

        return generalResponse(
            res,
            final_details,
            "Contacts found",
            true,
            false,
            200
        );

    } catch (error) {
        console.error("Error in fetching Contacts", error);

        return generalResponse(
            res,
            {},
            "Something went wrong while fetching Contacts!",
            false,
            true,
            500
        );
    }
}

module.exports = {
    getContacts
};