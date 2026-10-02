const contacts_service = require("../../service/repository/Contacts.service");
const { generalResponse } = require("../../helper/response.helper");
const updateFieldsFilter = require("../../helper/updateField.helper");
const user_service = require("../../service/repository/user.service");



async function createContacts(req, res) {
  try {
    let filteredData;
    try {
      filteredData = updateFieldsFilter(req.body, ["contact_details"], true);
    } catch (err) {
      return generalResponse(res, {}, "Data is Missing", false, true);
    }

    const user_id = req.authData.user_id;
    const contactDetails = filteredData?.contact_details || [];

    // ✅ Step 1: Extract all mobile numbers at once
    const mobileNumbers = contactDetails.map(item => item.number.toString());

    // ✅ Step 2: ONE single DB query instead of 700!
    const userMap = await user_service.getUsersByMobileNumbers(mobileNumbers, ['user_id', 'mobile_num']);

    // ✅ Step 3: Map contacts using the result Map (O(1) lookup)
    const newContacts = contactDetails
      .filter(item => userMap.has(item.number.toString()))
      .map(item => ({
        name: item.name,
        number: item.number,
        user_id: userMap.get(item.number.toString()).user_id,
      }));

    // ✅ Step 4: Save contacts
    const updatedContacts = await contacts_service.updateContacts(user_id, newContacts);

    return generalResponse(res, updatedContacts, "Contacts replaced successfully.", true, true, 201);
  } catch (error) {
    console.error("Error in replacing Contacts", error);
    return generalResponse(res, {}, error.message, false, true, 500);
  }
}

module.exports = {
  createContacts,
};
 