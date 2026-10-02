const { generalResponse } = require("../../helper/response.helper");
const updateFieldsFilter = require("../../helper/updateField.helper");
const { updateChat } = require("../../service/repository/Chat.service");
const { addLable, getChatLables, updateChatLable, deleteChatLable } = require("../../service/repository/chat_lable.service");
const { isParticipant, updateParticipant, getParticipant } = require("../../service/repository/Participant.service");

async function add_lable(req, res) {
    try {
        const user_id = req.authData.user_id;
        if (!user_id) {
            return generalResponse(res, {}, "User not found", false, true, 404);
        }
        let filteredData;
        try {
            // Filter incoming request body to allow only specific fields to be updated
            filteredData = updateFieldsFilter(req.body, [
                "lable_text",
                "lable_color",

            ], true);
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
        }        // if(!price || !title || !description || !country_of_origin){
        //     return generalResponse(res, {}, "Missing required fields: price, title, description, country_of_origin", false, true, 400);
        // }

        filteredData.user_id = user_id;
        const lable = await addLable(filteredData);
        return generalResponse(res, lable, "Lable added successfully", true, false, 200);
    } catch (error) {
        return generalResponse(res, {}, error.message, false, true, 500);
    }
}
const socket_service = require("../../service/common/socket.service");
const { getUser } = require("../../service/repository/user.service");
const { Chat_lable } = require("../../../models");

async function update_lable(req, res) {
    try {
        const user_id = req.authData.user_id;
        if (!user_id) {
            return generalResponse(res, {}, "User not found", false, true, 404);
        }
        if (!req.body.lable_id) {
            return generalResponse(
                res,
                {},
                "lable_id is required to edit lable",
                false,
                true,
                402
            )
        }
        let filteredData;
        try {
            // Filter incoming request body to allow only specific fields to be updated
            filteredData = updateFieldsFilter(req.body, [
                "lable_text",
                "lable_color",
                "status",
                "lable_id"
            ], false);
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
        }        // if(!price || !title || !description || !country_of_origin){
        //     return generalResponse(res, {}, "Missing required fields: price, title, description, country_of_origin", false, true, 400);
        // }
        const lable = await updateChatLable(filteredData)
        if(filteredData.status == "true" || filteredData.status == true ){
            await deleteChatLable(filteredData.lable_id)
        }
        return generalResponse(res, lable, "Lable added successfully", true, false, 200);
    } catch (error) {
        return generalResponse(res, {}, error.message, false, true, 500);
    }
}
async function get_lable_list(req, res) {
    try {
        const user_id = req.authData.user_id;
        if (!user_id) {
            return generalResponse(res, {}, "User not found", false, true, 404);
        }

        const lable = await getChatLables(
            user_id
        );
        return generalResponse(res, lable, "Lable updated successfully", true, false, 200);
    } catch (error) {

        return generalResponse(res, {}, error.message, false, true, 500);
    }
}

async function apply_lable_to_chat(req, res) {
    try {
        const user_id = req.authData.user_id;
        if (!user_id) {
            return generalResponse(res, {}, "User not found", false, true, 404);
        }
        let filteredData;
        try {
            // Filter incoming request body to allow only specific fields to be updated
            filteredData = updateFieldsFilter(req.body, [
                "chat_id",
                "chat_lable_id_1",
                "chat_lable_id_2",
                "chat_lable_id_3",
                "remove_lable_1",
                "remove_lable_2",
                "remove_lable_3"
            ], false);
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
        }        // if(!price || !title || !description || !country_of_origin){
        //     return generalResponse(res, {}, "Missing required fields: price, title, description, country_of_origin", false, true, 400);
        // }
        if (!filteredData.chat_lable_id_1 && !filteredData.chat_lable_id_2 && !filteredData.chat_lable_id_3) {
            return generalResponse(
                res,
                {},
                "At least one lable is required",
                false,
                true,
                402
            )
        }
        const isParticipant_exists = await isParticipant(user_id, filteredData.chat_id)
        if (!isParticipant_exists || isParticipant_exists == null) {
            return generalResponse(
                res,
                {},
                "You are not the part of this conversation",
                403
            )
        }
        let updateFields = {};
        
        if (filteredData.chat_lable_id_1) updateFields.lable_id_1 = filteredData.chat_lable_id_1
        if (filteredData.chat_lable_id_2) updateFields.lable_id_2 = filteredData.chat_lable_id_2
        if (filteredData.chat_lable_id_3) updateFields.lable_id_3 = filteredData.chat_lable_id_3


        if (filteredData.remove_lable_1 && (filteredData.remove_lable_1 === "true" || filteredData.remove_lable_1 === true)) updateFields.lable_id_1 = null
        if (filteredData.remove_lable_2 && (filteredData.remove_lable_2 === "true" || filteredData.remove_lable_2 === true)) updateFields.lable_id_2 = null
        if (filteredData.remove_lable_3 && (filteredData.remove_lable_3 === "true" || filteredData.remove_lable_3 === true)) updateFields.lable_id_3 = null

        const user = await getUser({
            user_id: user_id
        })
        // Single DB update
        const updated_chat = await updateParticipant(updateFields, {
            chat_id: filteredData.chat_id,
            user_id: user_id
        });

        const participant_data = await getParticipant(
            {
                user_id: user_id,
                chat_id: filteredData.chat_id
            },

            [
                {
                    model: Chat_lable,
                    as: "chat_lable_1"
                },
                {
                    model: Chat_lable,
                    as: "chat_lable_2"
                },
                {
                    model: Chat_lable,
                    as: "chat_lable_3"
                }
            ]
        )
        socket_service.emitEvent(
            user.dataValues.socket_ids,
            "lable_updated",
            participant_data.Records[0]
        )

        return generalResponse(res, participant_data.Records[0], "Chat Edited Successfully ", true, false, 200);
    } catch (error) {

        return generalResponse(res, {}, error.message, false, true, 500);
    }
}

module.exports = {
    add_lable,
    get_lable_list,
    update_lable,
    apply_lable_to_chat
}