const { Op } = require("sequelize");
const path = require("path");
const fs = require("fs");
const { Broadcast_push_notification, User } = require("../../../models");
const { generalResponse } = require("../../helper/response.helper");
const { sendPushNotification } = require("../../service/common/oneSignal.service");

// Helper: build absolute URL for an uploaded image
const buildImageUrl = (req, filePath) => {
  if (!filePath) return "";
  const normalized = filePath.replace(/\\/g, "/");
  const baseUrl = process.env.baseUrl || `${req.protocol}://${req.get("host")}`;
  return `${baseUrl}/${normalized}`;
};

// Helper: base where clause (no device_token filter)
const buildBaseFilter = (filter_type, countries) => {
  const where = {
    is_demo: false,
    blocked_by_admin: false,
  };
  if (filter_type === "countries" && Array.isArray(countries) && countries.length > 0) {
    where.country_short_name = { [Op.in]: countries };
  }
  return where;
};

/**
 * POST /admin/mass-message/send
 */
async function send(req, res) {
  try {
    const admin_id = req.authData?.admin_id;
    if (!admin_id) {
      return generalResponse(res, {}, "Solo los administradores pueden acceder.", false, true, 403);
    }

    const { title, message, filter_type, countries } = req.body;

    if (!title || !message) {
      return generalResponse(res, {}, "Título y mensaje son obligatorios", false, true, 400);
    }
    if (!filter_type || !["all", "countries"].includes(filter_type)) {
      return generalResponse(res, {}, "filter_type debe ser 'all' o 'countries'", false, true, 400);
    }

    let countriesArray = [];
    if (filter_type === "countries") {
      try {
        countriesArray = typeof countries === "string" ? JSON.parse(countries) : countries;
      } catch (e) {
        return generalResponse(res, {}, "Formato de países inválido", false, true, 400);
      }
      if (!Array.isArray(countriesArray) || countriesArray.length === 0) {
        return generalResponse(res, {}, "Debes seleccionar al menos un país", false, true, 400);
      }
    }

    let imageUrl = "";
    if (req.file) {
      imageUrl = buildImageUrl(req, path.join("uploads/mass_messages", req.file.filename));
    }

    // Find ALL matching users (for target_count)
    const baseFilter = buildBaseFilter(filter_type, countriesArray);
    const totalUsers = await User.count({ where: baseFilter });

    // Find users WITH device token (the ones who actually receive push)
    const pushFilter = { ...baseFilter };
    pushFilter.device_token = {
      [Op.and]: [
        { [Op.ne]: null },
        { [Op.ne]: "" },
      ],
    };
    const usersWithToken = await User.findAll({
      where: pushFilter,
      attributes: ["user_id", "device_token"],
    });

    const playerIds = usersWithToken
      .map((u) => u.device_token)
      .filter((t) => t && t.trim() !== "");

    if (playerIds.length === 0) {
      // Still save record so admin can see it in history
      await Broadcast_push_notification.create({
        title,
        message,
        image_url: imageUrl,
        filter_type,
        filter_countries: countriesArray,
        target_count: totalUsers,
        sent_count: 0,
        status: "no_tokens",
      });
      return generalResponse(
        res,
        { sent_count: 0, target_count: totalUsers, with_token: 0 },
        "No se encontraron usuarios con token de dispositivo para los filtros seleccionados",
        true,
        false,
        200
      );
    }

    // OneSignal supports up to 2000 player_ids per request
    const CHUNK_SIZE = 2000;
    const chunks = [];
    for (let i = 0; i < playerIds.length; i += CHUNK_SIZE) {
      chunks.push(playerIds.slice(i, i + CHUNK_SIZE));
    }

    let errors = [];
    for (const chunk of chunks) {
      try {
        await sendPushNotification({
          playerIds: chunk,
          title,
          message,
          big_picture: imageUrl || undefined,
          data: { type: "mass_message" },
        });
      } catch (err) {
        console.error("OneSignal chunk error:", err);
        errors.push(err.message || String(err));
      }
    }

    const record = await Broadcast_push_notification.create({
      title,
      message,
      image_url: imageUrl,
      filter_type,
      filter_countries: countriesArray,
      target_count: totalUsers,
      sent_count: playerIds.length,
      status: errors.length === chunks.length ? "failed" : "sent",
    });

    return generalResponse(
      res,
      {
        notification_id: record.notification_id,
        target_count: totalUsers,
        sent_count: playerIds.length,
        image_url: imageUrl,
      },
      errors.length > 0
        ? `Mensaje enviado a ${playerIds.length} de ${totalUsers} usuarios (con ${errors.length} chunks fallidos)`
        : `Mensaje enviado a ${playerIds.length} de ${totalUsers} usuarios`,
      true,
      false,
      200
    );
  } catch (error) {
    console.error("Error in send mass message:", error);
    return generalResponse(res, {}, error.message, false, true, 500);
  }
}

/**
 * POST /admin/mass-message/preview-count
 * Returns: total users matching filter + how many have device token
 */
async function previewCount(req, res) {
  try {
    const admin_id = req.authData?.admin_id;
    if (!admin_id) {
      return generalResponse(res, {}, "Solo los administradores pueden acceder.", false, true, 403);
    }

    const { filter_type, countries } = req.body || {};
    if (!filter_type || !["all", "countries"].includes(filter_type)) {
      return generalResponse(res, {}, "filter_type debe ser 'all' o 'countries'", false, true, 400);
    }

    let countriesArray = [];
    if (filter_type === "countries") {
      countriesArray = Array.isArray(countries) ? countries : [];
      if (countriesArray.length === 0) {
        return generalResponse(res, {}, "Debes seleccionar al menos un país", false, true, 400);
      }
    }

    const baseFilter = buildBaseFilter(filter_type, countriesArray);

    // Total users matching filter
    const total = await User.count({ where: baseFilter });

    // Users with device token
    const pushFilter = { ...baseFilter };
    pushFilter.device_token = {
      [Op.and]: [
        { [Op.ne]: null },
        { [Op.ne]: "" },
      ],
    };
    const withToken = await User.count({ where: pushFilter });

    return generalResponse(
      res,
      {
        total,
        withToken,
        filter_type,
        countries: countriesArray,
      },
      "Conteo calculado",
      true,
      false,
      200
    );
  } catch (error) {
    console.error("Error in preview-count:", error);
    return generalResponse(res, {}, error.message, false, true, 500);
  }
}

module.exports = {
  send,
  previewCount,
};
