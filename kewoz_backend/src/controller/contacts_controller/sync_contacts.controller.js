const crypto = require("crypto");
const { generalResponse } = require("../../helper/response.helper");
const user_service = require("../../service/repository/user.service");
const { User } = require("../../../models");
const { Op } = require("sequelize");
const { DEMO_USER_ID } = require("../../helper/demo_data.helper");

/**
 * Generates a hash for contacts array for comparison
 * @param {Array} contacts - Array of contact objects
 * @returns {string} - MD5 hash of contacts
 */
function generateContactsHash(contacts) {
  const sortedContacts = [...contacts].sort((a, b) =>
    a.number.localeCompare(b.number)
  );
  return crypto
    .createHash("md5")
    .update(JSON.stringify(sortedContacts))
    .digest("hex");
}

/**
 * Sync contacts API - Optimized for performance with delta sync support
 * POST /contacts/sync-contacts
 */
async function syncContacts(req, res) {
  try {
    const user_id = req.authData.user_id;
    const {
      last_sync_timestamp,
      contacts_hash: client_hash,
      added_contacts = [],
      updated_contacts = [],
      deleted_contacts = [],
    } = req.body;

    // Get current user with existing contacts
    const currentUser = await User.findOne({
      where: { user_id, deleted_at: null },
      attributes: [
        "user_id",
        "contact_details",
        "last_contact_sync",
        "contacts_hash",
      ],
    });

    if (!currentUser) {
      return generalResponse(res, {}, "User not found", false, true, 404);
    }

    let existingContacts = currentUser.contact_details || [];
    const syncTimestamp = new Date().toISOString();

    // Create a map for fast lookup of existing contacts by number only (number is unique identifier)
    const contactsMap = new Map();
    existingContacts.forEach((contact) => {
      contactsMap.set(contact.number.toString(), contact);
    });

    // Collect all mobile numbers that need user lookup
    const numbersToLookup = [];

    // Add numbers from added_contacts
    added_contacts.forEach((contact) => {
      numbersToLookup.push(contact.number.toString());
    });

    // Add numbers from updated_contacts
    updated_contacts.forEach((contact) => {
      numbersToLookup.push(contact.number.toString());
    });

    // Batch lookup all users in a single query
    const userMap = await user_service.getUsersByMobileNumbers(numbersToLookup);

    // Process results for response
    const addedResults = [];
    const updatedResults = [];
    const deletedAcknowledged = [];

    // Process added contacts - only add if user exists in Users table
    for (const contact of added_contacts) {
      const key = contact.number.toString();
      const user = userMap.get(key);

      // Only process if user is registered
      if (!user) {
        addedResults.push({
          number: contact.number,
          country_code: contact.country_code || "",
          status: "not_registered",
          user_id: null,
          is_registered: false,
        });
        continue;
      }

      const newContact = {
        name: contact.name,
        number: contact.number,
        country_code: contact.country_code || "",
        user_id: user.user_id,
      };

      // Only add if not already exists, otherwise update country_code
      if (contactsMap.has(key)) {
        // Contact exists, update country_code if provided
        const existingContact = contactsMap.get(key);
        existingContact.country_code = contact.country_code || existingContact.country_code || "";
        contactsMap.set(key, existingContact);

        addedResults.push({
          number: contact.number,
          country_code: contact.country_code || "",
          status: "already_exists",
          user_id: existingContact.user_id,
          is_registered: true,
        });
      } else {
        contactsMap.set(key, newContact);

        addedResults.push({
          number: contact.number,
          country_code: contact.country_code || "",
          status: "added",
          user_id: user.user_id,
          is_registered: true,
        });
      }
    }

    // Process updated contacts - only update/add if user exists in Users table
    for (const contact of updated_contacts) {
      const key = contact.number.toString();
      const user = userMap.get(key);

      // Only process if user is registered
      if (!user) {
        updatedResults.push({
          number: contact.number,
          country_code: contact.country_code || "",
          status: "not_registered",
          user_id: null,
          is_registered: false,
        });
        continue;
      }

      if (contactsMap.has(key)) {
        const existingContact = contactsMap.get(key);
        existingContact.name = contact.name;
        existingContact.country_code = contact.country_code || existingContact.country_code || "";
        existingContact.user_id = user.user_id;
        contactsMap.set(key, existingContact);

        updatedResults.push({
          number: contact.number,
          country_code: existingContact.country_code,
          status: "updated",
          user_id: user.user_id,
          is_registered: true,
        });
      } else {
        // Contact doesn't exist, treat as add (only if registered)
        const newContact = {
          name: contact.name,
          number: contact.number,
          country_code: contact.country_code || "",
          user_id: user.user_id,
        };
        contactsMap.set(key, newContact);

        updatedResults.push({
          number: contact.number,
          country_code: contact.country_code || "",
          status: "added_as_new",
          user_id: user.user_id,
          is_registered: true,
        });
      }
    }

    // Process deleted contacts
    for (const contact of deleted_contacts) {
      const key = contact.number.toString();

      if (contactsMap.has(key)) {
        contactsMap.delete(key);
        deletedAcknowledged.push({
          number: contact.number,
          country_code: contact.country_code || "",
          status: "deleted",
        });
      } else {
        deletedAcknowledged.push({
          number: contact.number,
          country_code: contact.country_code || "",
          status: "not_found",
        });
      }
    }

    // Convert map back to array
    const updatedContactsList = Array.from(contactsMap.values());

    // Find newly registered users since last sync
    const newlyRegisteredUsers = await findNewlyRegisteredContacts(
      updatedContactsList,
      last_sync_timestamp
    );

    // Generate new hash
    const newHash = generateContactsHash(updatedContactsList);

    // Check if user is demo user
    const isDemoUser =
      process.env.IS_CLIENT != "true" && DEMO_USER_ID.includes(user_id);

    // Update user's contacts and sync info
    if (!isDemoUser) {
      await User.update(
        {
          contact_details: updatedContactsList,
          last_contact_sync: syncTimestamp,
          contacts_hash: newHash,
        },
        { where: { user_id } }
      );
    }

    const response = {
      sync_timestamp: syncTimestamp,
      contacts_hash: newHash,
      added_results: addedResults,
      updated_results: updatedResults,
      deleted_acknowledged: deletedAcknowledged,
      newly_registered_users: newlyRegisteredUsers,
      total_contacts: updatedContactsList.length,
    };

    return generalResponse(
      res,
      response,
      "Contacts synced successfully.",
      true,
      false,
      200
    );
  } catch (error) {
    console.error("Error in syncing Contacts", error);
    return generalResponse(res, {}, error.message, false, true, 500);
  }
}

/**
 * Find contacts that have registered since the last sync
 * @param {Array} contacts - Current contacts list
 * @param {string} lastSyncTimestamp - ISO timestamp of last sync
 * @returns {Array} - Array of newly registered users
 */
async function findNewlyRegisteredContacts(contacts, lastSyncTimestamp) {
  try {
    if (!lastSyncTimestamp || contacts.length === 0) {
      return [];
    }

    // Get contacts without user_id (unregistered contacts)
    const unregisteredNumbers = contacts
      .filter((c) => c.user_id === null)
      .map((c) => c.number.toString());

    if (unregisteredNumbers.length === 0) {
      return [];
    }

    // Find users who registered after last sync with matching numbers
    const newlyRegistered = await User.findAll({
      where: {
        mobile_num: { [Op.in]: unregisteredNumbers },
        createdAt: { [Op.gt]: new Date(lastSyncTimestamp) },
        deleted_at: null,
      },
      attributes: [
        "user_id",
        "mobile_num",
        "user_name",
        "full_name",
        "profile_pic",
        "createdAt",
      ],
    });

    return newlyRegistered.map((user) => {
      const contact = contacts.find(
        (c) => c.number.toString() === user.mobile_num
      );
      return {
        user_id: user.user_id,
        number: user.mobile_num,
        user_name: user.user_name,
        full_name: user.full_name,
        profile_pic: user.profile_pic,
        contact_name: contact ? contact.name : null,
        registered_at: user.createdAt,
      };
    });
  } catch (error) {
    console.error("Error finding newly registered contacts:", error);
    return [];
  }
}

module.exports = {
  syncContacts,
};