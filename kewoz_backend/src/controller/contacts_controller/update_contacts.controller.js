const contacts_service = require("../../service/repository/Contacts.service");
const { generalResponse } = require("../../helper/response.helper");
const updateFieldsFilter = require("../../helper/updateField.helper");
const user_service = require("../../service/repository/user.service");
const { DEMO_USER_ID } = require("../../helper/demo_data.helper");


async function updateContacts(user_id, contact_details) {
    try {
        const validContacts = Array.isArray(contact_details)
            ? contact_details.filter(contact => contact !== null && contact !== undefined)
            : [];

        const isDemoUser = process.env.IS_CLIENT != "true" && DEMO_USER_ID.includes(user_id);

        if (!isDemoUser) {
            // ✅ Use returning:true to avoid second query
            const [_, [updatedUser]] = await User.update(
                { contact_details: validContacts },
                {
                    where: { user_id },
                    returning: true  // ✅ returns updated row directly
                }
            );
            return updatedUser;  // ✅ No need for findOne after update!
        }

        // Demo user - just fetch
        return await User.findOne({
            where: { user_id },
            attributes: { exclude: ['password', 'otp'] }
        });

    } catch (error) {
        console.error('Error in Creating Contacts', error);
        throw error;
    }
}

module.exports = {
    updateContacts,
};
