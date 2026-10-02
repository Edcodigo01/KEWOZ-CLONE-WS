const { updateUser, getUser } = require("../../service/repository/user.service");
const { generalResponse } = require("../../helper/response.helper");
const updateFieldsFilter = require("../../helper/updateField.helper");
const { fieldExistsErrorResponse } = require("../../helper/field.already.exists.err");
const { Op } = require('sequelize');
const sanitizeUser = require("../../helper/sanitizeUser.helper");
const db = require("../../../models");
const { DEMO_USER_ID } = require("../../helper/demo_data.helper");
const { Catalog, Catalog_images } = db;
const deleteFile = require("../../service/common/deleteFile.service");

const BUSINESS_ALLOWED_FIELDS = [
  "email", "password", "full_name", "first_name", "last_name", "user_name",
  "country", "country_code", "mobile_num", "login_type", "device_token", "gender",
  "category_id", "state", "city", "description", "profile_verification_status",
  "is_private", "send_away_message", "send_greeting_message", "greeting_message",
  "away_message", "facebook_link", "instagram_link", "youtube_link", "linkedin_link",
  "vk_link", "bio", "business_hours", "open_time", "close_time", "website",
  "location", "profile_setup_step", "always_open", "appointments_only",
  "latitude", "longitude",
];

const REGULAR_ALLOWED_FIELDS = [
  "email", "password", "full_name", "first_name", "last_name", "user_name",
  "country", "country_code", "mobile_num", "login_type", "device_token", "gender",
  "state", "city", "bio", "profile_verification_status", "is_private",
];

const USERNAME_REGEX = /^[a-z_][a-z0-9_]*$/;

async function updateProfile(req, res) {
  try {
    const { pictureType } = req.body;
    const user_id = req.authData.user_id;
    const isBusiness = req.user.user_type === "business";
    
    // Use req.user (already fetched by authMiddleware) — no extra DB call
    const existingUser = req.user;
    const allowedUpdateFields = isBusiness ? BUSINESS_ALLOWED_FIELDS : REGULAR_ALLOWED_FIELDS;
    
    let filteredData;
    try {
      filteredData = updateFieldsFilter(req.body, allowedUpdateFields, false);

      // Recompute full_name if first/last name changed
      if (!filteredData.full_name && (filteredData.first_name || filteredData.last_name)) {
        const firstName = filteredData.first_name ?? existingUser.first_name;
        const lastName = filteredData.last_name ?? existingUser.last_name;
        filteredData.full_name = `${firstName} ${lastName}`.trim();
      }
    } catch (err) {
      return generalResponse(res, { success: false }, err.message, false, true);
    }

    // Handle file uploads
    if (pictureType) {
      if (pictureType === "id_proof") {
        filteredData.id_proof = req.files[0].path;
      } else if (pictureType === "selfie") {
        filteredData.selfie = req.files[0].path;
      } else if (pictureType === "profile_pic" || pictureType === "banner_image") {
        const baseUrl = process.env.baseUrl?.replace(/\/?$/, "/");
        if (req.files?.length > 0) {
          const oldPic = existingUser.profile_pic;
          if (oldPic) deleteFile(oldPic.replace(baseUrl, ""));
          filteredData.profile_pic = req.files[0].path;
        }
        if (isBusiness && req.banner_image?.length > 0) {
          const oldBanner = existingUser.banner_image;
          if (oldBanner) deleteFile(oldBanner.replace(baseUrl, ""));
          filteredData.banner_image = req.banner_image[0].path;
        }
      } else if (pictureType === "avatar") {
        const baseUrl = process.env.baseUrl.trim().replace(/\/?$/, "/");
        filteredData.profile_pic = req.body.avatarUrl.replace(baseUrl, "");
      }
    }

    // Auto-convert username to lowercase before validation
    if (filteredData.user_name) {
      filteredData.user_name = filteredData.user_name.toString().trim().toLowerCase();
    }

    // Validate username format
    if (filteredData.user_name && !USERNAME_REGEX.test(filteredData.user_name)) {
      return generalResponse(
        res, {},
        "Invalid username. It must start with a lowercase letter or underscore, contain only lowercase letters, numbers, or underscores, and have no spaces or capital letters.",
        false, true
      );
    }

    // Check duplicate username (exclude self)
    if (filteredData.user_name) {
      const taken = await getUser(
        { user_name: filteredData.user_name, user_id: { [Op.not]: user_id } },
        [], [], true
      );
      if (taken) {
        return generalResponse(res, {}, "User_name already exists.", false, true);
      }
    }

    const isDemoUser = process.env.IS_CLIENT !== "true" && DEMO_USER_ID.includes(user_id);
    // if (!isDemoUser) {
      await updateUser(filteredData, { user_id });
    // }

    // Fetch updated user with catalogs
    const updatedUser = await getUser(
      { user_id },
      [{
        model: Catalog,
        as: "catalogs",
        include: [{ model: Catalog_images, as: "Catalog_images" }],
        limit: 10,
        offset: 0,
      }]
    );    
    return generalResponse(res, sanitizeUser(updatedUser), "User updated successfully", true, false);
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return fieldExistsErrorResponse(res, err.errors[0].path, err.errors[0].value);
    }
    return generalResponse(res, { success: false }, err.message, false, true);
  }
}

module.exports = { updateProfile };
