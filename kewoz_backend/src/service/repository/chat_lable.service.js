const { Chat_lable } = require("../../../models");

async function addLable(chatLabelData) {
    try {
        const chat_lable = await Chat_lable.create(chatLabelData);


        return chat_lable;
    } catch (error) {
        throw error;
    }
}

async function getChatLables(user_id) {
    try {
        let chat_lables = await Chat_lable.findAll({
            where: {
                user_id: user_id,
                status: true
            },


        });

        return {
            chat_lables,

        };
    } catch (error) {
        throw error;
    }
}

async function updateChatLable(catalogData) {
    try {
        let chat_lable = await Chat_lable.update(catalogData, {
            where: {
                lable_id: catalogData.lable_id
            }
        });
        chat_lable = await Chat_lable.findByPk(chat_lable.lable_id);
        return chat_lable;
    } catch (error) {
        throw error;
    }
}

async function deleteChatLable(lable_id) {
    try {
        // Perform a hard delete
        const deletedCount = await Chat_lable.destroy({
            where: {
                lable_id: lable_id
            }
        });

        if (deletedCount === 0) {
            throw new Error("Label not found or already deleted");
        }

        return { message: "Label deleted successfully" };
    } catch (error) {
        throw error;
    }
}


module.exports = {
    addLable,
    getChatLables,
    updateChatLable,
    deleteChatLable
}
