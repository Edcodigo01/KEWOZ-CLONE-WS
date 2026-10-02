const { User } = require('../../../models');
const { generalResponse } = require('../../helper/response.helper');
const { DEMO_USER_ID } = require('../../helper/demo_data.helper');

async function clearContacts(req, res) {
  try {
    const user_id = req.authData.user_id;

    const isDemoUser = process.env.IS_CLIENT != 'true' && DEMO_USER_ID.includes(user_id);

    if (!isDemoUser) {
      await User.update(
        {
          contact_details: [],
          last_contact_sync: null,
          contacts_hash: null,
        },
        { where: { user_id } },
      );
    }

    return generalResponse(res, {}, 'All synced contacts cleared successfully.', true, false, 200);
  } catch (error) {
    console.error('Error in clearing Contacts', error);
    return generalResponse(res, {}, error.message, false, true, 500);
  }
}

module.exports = { clearContacts };
