const { getUsers } = require("../../service/repository/user.service");
const { generalResponse } = require("../../helper/response.helper");
const updateFieldsFilter = require("../../helper/updateField.helper");
const { getblock } = require("../../service/repository/Block.service");
const { Catalog, Catalog_images, Categories } = require("../../../models");

const USER_ATTRIBUTES = [
  "updatedAt", "profile_pic", "banner_image", "user_id", "full_name",
  "user_name", "email", "country_code", "country", "gender", "description",
  "profile_verification_status", "login_verification_status", "first_name",
  "last_name", "mobile_num", "latitude", "longitude", "send_greeting_message",
  "send_away_message", "greeting_message", "away_message", "facebook_link",
  "instagram_link", "youtube_link", "linkedin_link", "vk_link", "business_hours",
  "open_time", "close_time", "appointments_only", "always_open", "website",
  "location", "by_appointments_only", "profile_setup_step", "bio", "createdAt", "user_type",
];

const USER_INCLUDE_OPTIONS = [
  {
    model: Catalog,
    as: "catalogs",
    separate: true,
    order: [["createdAt", "DESC"]],
    include: [{ model: Catalog_images, as: "Catalog_images", required: false }],
  },
  { model: Categories, as: "categories" },
];

const USERNAME_REGEX = /^[a-z_][a-z0-9_]*$/;

async function _fetchUsers(req, res, excludeBlocked) {
  const filteredData = updateFieldsFilter(req.body, ["user_id", "user_name", "user_check", "mobile_num"], false);
  const pagination = updateFieldsFilter(req.body, ["page", "pageSize"], false);

  // Username availability check
  if (filteredData.user_check) {
    if (filteredData.user_name) {
      filteredData.user_name = filteredData.user_name.toString().trim().toLowerCase();
    }
    if (!filteredData.user_name || !USERNAME_REGEX.test(filteredData.user_name)) {
      return generalResponse(res, { Records: [], Pagination: {} }, "UserName Unavailable", false, true);
    }
    const isUser = await getUsers(filteredData, pagination);
    if (isUser?.Records?.length <= 0) {
      return generalResponse(res, { Records: [], Pagination: {} }, "UserName Available", true, true);
    }
    return generalResponse(res, { Records: [], Pagination: {} }, "UserName Unavailable", false, true);
  }

  let excludedUserIds = [];

  if (excludeBlocked) {
    const user_id = req.authData.user_id;
    // Fetch both block lists in parallel
    const [block1, block2] = await Promise.all([
      getblock({ user_id }),
      getblock({ blocked_id: user_id }),
    ]);

    if (block1?.Records?.length > 0 || block2?.Records?.length > 0) {
      const uniqueIds = new Set();
      block1?.Records?.forEach((b) => uniqueIds.add(b?.dataValues?.blocked_id));
      block2?.Records?.forEach((b) => uniqueIds.add(b?.dataValues?.user_id));
      excludedUserIds = Array.from(uniqueIds);
    }

    if (excludedUserIds.includes(req.body?.user_id)) {
      return generalResponse(res, { Records: [], Pagination: {} }, "User Not found", true, true);
    }
  }

  const isUser = await getUsers(filteredData, pagination, USER_ATTRIBUTES, excludedUserIds, USER_INCLUDE_OPTIONS);

  if (!isUser?.Records?.length) {
    return generalResponse(res, { Records: [], Pagination: {} }, "User Not found", true, true);
  }

  const updatedRecords = isUser.Records.map((record) => record.get());

  return generalResponse(res, { Records: updatedRecords, Pagination: isUser.Pagination }, "User Found", true, false);
}

async function findUser(req, res) {
  try {
    return await _fetchUsers(req, res, true);
  } catch (error) {
    console.error("Error in Finding User", error);
    return generalResponse(res, {}, "Something went wrong while Finding User!", false, true);
  }
}

async function findUserAdmin(req, res) {
  try {
    return await _fetchUsers(req, res, false);
  } catch (error) {
    console.error("Error in Finding User", error);
    return generalResponse(res, {}, "Something went wrong while Finding User!", false, true);
  }
}

module.exports = { findUser, findUserAdmin };