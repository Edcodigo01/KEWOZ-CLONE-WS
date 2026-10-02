
const { User } = require("../../../models");
const { generalResponse } = require("../../helper/response.helper");
const user_service = require("../../service/repository/user.service");
const { DEMO_USER_ID } = require("../../helper/demo_data.helper");

async function addContact(req, res) {
  try {
    const user_id = req.authData.user_id;
    const { name, number } = req.body;

    if (!name || !number) {
      return generalResponse(res, {}, "Name and number are required", false, true, 400);
    }

    const currentUser = await User.findOne({
      where: { user_id, deleted_at: null },
      attributes: ["user_id", "contact_details"],
    });
    if (!currentUser) {
      return generalResponse(res, {}, "User not found", false, true, 404);
    }

    const contacts = currentUser.contact_details || [];

    // Check if contact already exists
    const exists = contacts.some(c => c.number?.toString() === number.toString());
    if (exists) {
      return generalResponse(res, {}, "Contact already exists", false, true, 409);
    }

    // Look up the user by mobile number to get user_id
    const userMap = await user_service.getUsersByMobileNumbers([number.toString()], ["user_id", "mobile_num"]);
    const matchedUser = userMap.get(number.toString());

    const newContact = {
      name,
      number,
      user_id: matchedUser ? matchedUser.user_id : null,
    };

    contacts.push(newContact);

    const isDemoUser = process.env.IS_CLIENT != "true" && DEMO_USER_ID.includes(user_id);
    if (!isDemoUser) {
      await User.update({ contact_details: contacts }, { where: { user_id } });
    }

    return generalResponse(res, { contact: newContact, total_contacts: contacts.length }, "Contact added successfully", true, false, 200);
  } catch (error) {
    console.error("Error in addContact:", error);
    return generalResponse(res, {}, error.message, false, true, 500);
  }
}

module.exports = { addContact };
