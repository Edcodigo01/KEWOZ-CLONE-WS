const { generalResponse } = require("../../helper/response.helper");
const updateFieldsFilter = require("../../helper/updateField.helper");
const {
  getChats,
  getChat,
  updateChat,
} = require("../../service/repository/Chat.service");
const {
  updateUser,
  getUser,
  createUser,
} = require("../../service/repository/user.service");
const { User: UserModel } = require("../../../models");
const admin_cnt_service = require("../../service/repository/admin_counts.service");
const admin_service = require("../../service/repository/Admin.service");
const { Chat, User } = require("../../../models");
const path = require("path");
const fs = require("fs");
const getmac = require("getmac").default;
const os = require("os");
const axios = require("axios");
const category_service = require("../../service/repository/category.service");
const { Op } = require("sequelize");
const {Catalog} = require("../../../models");
function getMacAddress() {

  try {
    const mac = getmac();
    return mac
  } catch (err) {
    console.error('Error fetching MAC address:', err);
    return null
  }

}

function getServerIP() {
  const networkInterfaces = os.networkInterfaces();

  for (const interfaceName in networkInterfaces) {
    for (const interface of networkInterfaces[interfaceName]) {
      // Check for IPv4 and non-internal addresses (to exclude localhost)
      if (interface.family === "IPv4" && !interface.internal) {
        return interface.address;
      }
    }
  }

  return "IP address not found";
}
/**
 * 🔒 Block or unblock a user by admin
 */
async function blockUser(req, res) {
  try {
    // ✅ Extract admin ID from auth data
    let admin_id = req.authData.admin_id;

    // ❌ Deny access if requester is not an admin
    if (!admin_id) {
      return generalResponse(res, {}, "Only admins can access.", true, true);
    }

    let filteredData;
    try {
      // ✅ Validate required "user_id" field
      filteredData = updateFieldsFilter(req.body, ["user_id"], true);
    } catch (err) {
      return generalResponse(res, {}, err.message, false, true);
    }

    // ✅ Check if user exists in DB
    const isUser = await getUser({ user_id: filteredData.user_id });
    if (!isUser) {
      return generalResponse(res, {}, "User not found", false, true, 404);
    }

    // 🔄 Toggle user's blocked status
    await updateUser(
      { blocked_by_admin: !isUser.blocked_by_admin },
      { user_id: filteredData.user_id }
    );

    // ✅ Respond with updated block status
    return generalResponse(
      res,
      {},
      `User blocked: ${!isUser.blocked_by_admin}`, // fixed typo (was "bloked_by_admin")
      true,
      false,
      200
    );
  } catch (error) {
    // ❌ Handle unexpected errors
    console.error("Error in blocking user", error);
    return generalResponse(res, {}, error.message, false, true, 500);
  }
}

/**
 * 🔒 Block or unblock a group chat by admin
 */
async function blockGroup(req, res) {
  try {
    // ✅ Extract admin ID
    let admin_id = req.authData.admin_id;

    // ❌ Deny access if not admin
    if (!admin_id) {
      return generalResponse(res, {}, "Only admins can access.", true, true);
    }

    let filteredData;
    try {
      // ✅ Validate required "chat_id" field
      filteredData = updateFieldsFilter(req.body, ["chat_id"], true);
    } catch (err) {
      return generalResponse(res, {}, err.message, false, true);
    }

    // ✅ Check if group chat exists
    const isGroup = await getChat({
      chat_id: filteredData.chat_id,
      chat_type: "group",
    });
    if (!isGroup) {
      return generalResponse(res, {}, "Chat not found", false, true, 404);
    }

    // 🔄 Toggle group's blocked status
    const chat = await updateChat(
      { is_group_blocked: !isGroup.is_group_blocked },
      { chat_id: filteredData.chat_id, chat_type: "group" }
    );

    // ✅ Respond with updated block status
    return generalResponse(
      res,
      chat,
      `Chat blocked: ${!isGroup.is_group_blocked}`,
      true,
      false,
      200
    );
  } catch (error) {
    console.error("Error in blocking chat", error);
    return generalResponse(res, {}, error.message, false, true, 500);
  }
}

/**
 * 👥 Fetch all users with pagination
 *    Optionally group users by country
 */
async function usersList(req, res) {
  try {
    let admin_id = req.authData.admin_id;

    // ❌ Deny access if not admin
    if (!admin_id) {
      return generalResponse(res, {}, "Only admins can access.", true, true);
    }

    let filteredData;
    try {
      // ✅ Validate optional "filter" field
      filteredData = updateFieldsFilter(req.body, ["filter"], false);
    } catch (err) {
      return generalResponse(res, {}, err.message, false, true);
    }

    // ✅ Fetch paginated users
    let users = await admin_cnt_service.usersList({
      page: req.body.page,
      pageSize: req.body.pageSize,
      search: req.body.search,
      orderBy: req.body.orderBy || "updatedAt",
      orderDirection: req.body.orderDirection || "DESC",
      whereCondition: {
        user_type: req.body.user_type
          ? req.body.user_type
          : { [Op.in]: ["business", "regular"] },
      },
      include:[
        {
          model:Catalog,
          as: "catalogs"

        }
      ]
    });


    // 📌 If filter = "country", group users by country
    if (filteredData?.filter == "country") {
      const usersByCountry = {};
      users.users.forEach((user) => {
        const country = user.country || "Unknown";
        if (!usersByCountry[country]) {
          usersByCountry[country] = [];
        }
        usersByCountry[country].push(user);
      });
      users = usersByCountry;
    }

    // ❌ No users found
    if (!users) {
      return generalResponse(res, {}, "Users not found", false, true, 404);
    }

    // ✅ Send response
    return generalResponse(res, users, "Users found", true, false, 200);
  } catch (error) {
    console.error("Error in fetching all users", error);
    return generalResponse(res, {}, error.message, false, true, 500);
  }
}


/**
 * 💬 Fetch all group chats with pagination
 */
async function getGroupChats(req, res) {
  try {
    let admin_id = req.authData.admin_id;
    // ❌ Deny access if not admin
    if (!admin_id) {
      return generalResponse(res, {}, "Only admins can access.", true, true);
    }

    // ✅ Fetch paginated group chats
    let chats = await admin_cnt_service.getGroupChats(
      {
        page: Number(req.body.page || 1),
        pageSize: Number(req.body.pageSize || 10),
        sortBy: req.body.sortBy,
        sortOrder: req.body.sortOrder,
        search: req.body.search
      }
    );

    if (!chats) {
      return generalResponse(res, {}, "Chats not found", false, true, 404);
    }

    // ✅ Send response
    return generalResponse(res, chats, "Chats found", true, false, 200);
  } catch (error) {
    console.error("Error in fetching all chats", error);
    return generalResponse(res, {}, error.message, false, true, 500);
  }
}

/**
 * 🚫 Fetch list of blocked users/groups with optional filter
 */
async function getBlockList(req, res) {
  try {
    let admin_id = req.authData.admin_id;

    // ❌ Deny access if not admin
    if (!admin_id) {
      return generalResponse(res, {}, "Only admins can access.", true, true);
    }

    let filteredData;
    try {
      // ✅ Validate optional "filter" (values: user, group)
      filteredData = updateFieldsFilter(req.body, ["filter"], false);
    } catch (err) {
      return generalResponse(res, {}, err.message, false, true);
    }

    // ✅ Fetch block list from service
    const blockList = await admin_service.getBlockList(
      req.body.filter,
      req.body.page,
      req.body.pageSize
    );

    if (!blockList) {
      return generalResponse(res, {}, "Block list not found", false, true, 404);
    }

    // ✅ Send response
    return generalResponse(
      res,
      blockList,
      "Block list found",
      true,
      false,
      200
    );
  } catch (error) {
    console.error("Error in fetching block list", error);
    return generalResponse(res, {}, error.message, false, true, 500);
  }
}

async function newUserNotifications(req, res) {
  try {
    const { page = 1, limit = 10 } = req.body;
    const newUsers = await admin_service.newUserNotifications(page, limit);
    return generalResponse(
      res,
      newUsers,
      'Notifications fetched.',
      true,
      false,
      200
    )
  } catch (error) {
    console.error("Error in fetching notifications", error);
    return generalResponse(res, {}, error.message, false, true, 500);
  }
}

async function newNotifications(req, res) {
  try {
    const new_notifications_available = await admin_service.newNotifications();
    return generalResponse(
      res,
      { is_available: new_notifications_available },
      'Data fetched successfully.',
      true,
      false
    )
  } catch (error) {
    console.error("Error in fetching notifications", error);
    return generalResponse(res, {}, error.message, false, true, 500);
  }
}

async function getCallList(req, res) {
  try {
    const { call_type, page, limit } = req.body
    const calls = await admin_service.getCalls(
      {
        call_type,
      },
      [
        {
          model: Chat,
          as: 'Chat',
          attributes: [
            'chat_id',
            'chat_type',
            'group_name',
            'group_icon',
          ]
        },
        {
          model: User,
          as: 'caller',
          attributes: [
            'user_id',
            'user_name',
            'first_name',
            'last_name',
            'profile_pic',
            'banner_image',
          ]
        }
      ],
      page,
      limit)
    return generalResponse(
      res,
      calls,
      'Call list fetched successfully.',
      true,
      false,
      200
    )
  }
  catch (error) {
    console.error("Error in fetching notifications", error);
    return generalResponse(res, {}, error.message, false, true, 500);
  }
}
async function deactivate(req, res) {
  try {


    token = await readToken()
    // Prepare data to send to the third-party API
    const requestData = {
      server_ip: getServerIP(), // Example data
      mac_address: getMacAddress(),
      token: token,
    };

    // Make the third-party API request
    const apiResponse = await axios.post(
      "http://62.72.36.245:1142/de-activate",
      requestData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer YOUR_API_TOKEN`, // Replace with actual token if required
        },
      }
    );

    if (apiResponse?.data?.success) {

      return res.status(200).json({
        message: apiResponse.data.message,
        status: true,
      });
    }
    // Handle the API response
    return res.status(200).json({
      message: apiResponse.data.message,
      status: false,
    });

  }
  catch (err) {
    console.error(err);
    res.status(501).json({ error: "Error in Deactivation" });
  }
}

async function addCategory(req, res) {
  try {
    let admin_id = req.authData.admin_id;
    if (!admin_id) {
      return generalResponse(res, {}, "Only admins can access.", true, true);
    }
    let filteredData;
    try {
      // ✅ Validate required "user_id" field
      filteredData = updateFieldsFilter(req.body, ["name"], true);
    } catch (err) {
      return generalResponse(res, {}, err.message, false, true);
    }

    const category = await category_service.addCategory(filteredData);
    return generalResponse(
      res,
      category,
      "Category added successfully.",
      true,
      false,
      200
    );
  } catch (error) {
    console.error("Error in adding category", error);
    return generalResponse(res, {}, error.message, false, true, 500);
  }
}
async function editCategory(req, res) {
  try {
    let admin_id = req.authData.admin_id;
    if (!admin_id) {
      return generalResponse(res, {}, "Only admins can access.", true, true);
    }
    let filteredData;
    try {
      // ✅ Validate required "user_id" field
      filteredData = updateFieldsFilter(req.body, ["category_id", 'is_deleted'], true);
    } catch (err) {
      return generalResponse(res, {}, err.message, false, true);
    }

    const category = await category_service.updateCategory(filteredData.category_id, { is_deleted: filteredData.is_deleted });
    return generalResponse(
      res,
      {},
      "Category updated successfully.",
      true,
      false,
      200
    );
  } catch (error) {
    console.error("Error in updating category", error);
    return generalResponse(res, {}, error.message, false, true, 500);
  }
}
async function getCategoryInsights(req, res) {
  try {
    const data = await category_service.categoryInsights();

    return res.status(200).json({
      status: true,
      message: "Category insights fetched successfully",
      data
    });

  } catch (error) {
    console.error("Error in getCategoryInsights:", error);

    return res.status(500).json({
      status: false,
      message: "Failed to fetch category insights",
    });
  }
}
async function getCategoryInsightsWithDelted(req, res) {
  try {
    const data = await category_service.categoryInsights_with_deleted();

    return res.status(200).json({
      status: true,
      message: "Category insights fetched successfully",
      data
    });

  } catch (error) {
    console.error("Error in getCategoryInsights:", error);

    return res.status(500).json({
      status: false,
      message: "Failed to fetch category insights",
    });
  }
}

// 📦 Export all functions
// ─── Admin create user ───────────────────────────────────────────────────────

async function checkUsername(req, res) {
  try {
    const { user_name } = req.body;
    if (!user_name) {
      return generalResponse(res, {}, "El nombre de usuario es obligatorio", false, true, 400);
    }
    const user = await getUser({ user_name }, [], [], true);
    return generalResponse(res, { available: !user }, user ? "El usuario ya existe" : "Usuario disponible", true, false, 200);
  } catch (error) {
    console.error("Error checking username:", error);
    return generalResponse(res, {}, error.message, false, true, 500);
  }
}

async function checkPhone(req, res) {
  try {
    const { mobile_num, country_code } = req.body;
    if (!mobile_num) {
      return generalResponse(res, {}, "El número de teléfono es obligatorio", false, true, 400);
    }
    const where = country_code ? { mobile_num, country_code } : { mobile_num };
    const user = await getUser(where, [], [], true);
    return generalResponse(res, { available: !user }, user ? "El número ya está registrado" : "Número disponible", true, false, 200);
  } catch (error) {
    console.error("Error checking phone:", error);
    return generalResponse(res, {}, error.message, false, true, 500);
  }
}

const COUNTRY_MAP = {
  "+93": { name: "Afghanistan", code: "AF" }, "+355": { name: "Albania", code: "AL" },
  "+213": { name: "Algeria", code: "DZ" }, "+376": { name: "Andorra", code: "AD" },
  "+244": { name: "Angola", code: "AO" }, "+54": { name: "Argentina", code: "AR" },
  "+374": { name: "Armenia", code: "AM" }, "+61": { name: "Australia", code: "AU" },
  "+43": { name: "Austria", code: "AT" }, "+994": { name: "Azerbaijan", code: "AZ" },
  "+973": { name: "Bahrain", code: "BH" }, "+880": { name: "Bangladesh", code: "BD" },
  "+375": { name: "Belarus", code: "BY" }, "+32": { name: "Belgium", code: "BE" },
  "+591": { name: "Bolivia", code: "BO" }, "+387": { name: "Bosnia", code: "BA" },
  "+55": { name: "Brazil", code: "BR" }, "+359": { name: "Bulgaria", code: "BG" },
  "+855": { name: "Cambodia", code: "KH" }, "+237": { name: "Cameroon", code: "CM" },
  "+1": { name: "Canada", code: "CA" }, "+56": { name: "Chile", code: "CL" },
  "+86": { name: "China", code: "CN" }, "+57": { name: "Colombia", code: "CO" },
  "+506": { name: "Costa Rica", code: "CR" }, "+385": { name: "Croatia", code: "HR" },
  "+53": { name: "Cuba", code: "CU" }, "+357": { name: "Cyprus", code: "CY" },
  "+420": { name: "Czech Republic", code: "CZ" }, "+45": { name: "Denmark", code: "DK" },
  "+1-809": { name: "Dominican Republic", code: "DO" }, "+593": { name: "Ecuador", code: "EC" },
  "+20": { name: "Egypt", code: "EG" }, "+503": { name: "El Salvador", code: "SV" },
  "+372": { name: "Estonia", code: "EE" }, "+251": { name: "Ethiopia", code: "ET" },
  "+358": { name: "Finland", code: "FI" }, "+33": { name: "France", code: "FR" },
  "+995": { name: "Georgia", code: "GE" }, "+49": { name: "Germany", code: "DE" },
  "+233": { name: "Ghana", code: "GH" }, "+30": { name: "Greece", code: "GR" },
  "+502": { name: "Guatemala", code: "GT" }, "+509": { name: "Haiti", code: "HT" },
  "+504": { name: "Honduras", code: "HN" }, "+36": { name: "Hungary", code: "HU" },
  "+354": { name: "Iceland", code: "IS" }, "+91": { name: "India", code: "IN" },
  "+62": { name: "Indonesia", code: "ID" }, "+98": { name: "Iran", code: "IR" },
  "+964": { name: "Iraq", code: "IQ" }, "+353": { name: "Ireland", code: "IE" },
  "+972": { name: "Israel", code: "IL" }, "+39": { name: "Italy", code: "IT" },
  "+81": { name: "Japan", code: "JP" }, "+962": { name: "Jordan", code: "JO" },
  "+7": { name: "Kazakhstan", code: "KZ" }, "+254": { name: "Kenya", code: "KE" },
  "+965": { name: "Kuwait", code: "KW" }, "+856": { name: "Laos", code: "LA" },
  "+371": { name: "Latvia", code: "LV" }, "+961": { name: "Lebanon", code: "LB" },
  "+218": { name: "Libya", code: "LY" }, "+423": { name: "Liechtenstein", code: "LI" },
  "+370": { name: "Lithuania", code: "LT" }, "+352": { name: "Luxembourg", code: "LU" },
  "+389": { name: "Macedonia", code: "MK" }, "+60": { name: "Malaysia", code: "MY" },
  "+960": { name: "Maldives", code: "MV" }, "+356": { name: "Malta", code: "MT" },
  "+52": { name: "Mexico", code: "MX" }, "+373": { name: "Moldova", code: "MD" },
  "+377": { name: "Monaco", code: "MC" }, "+976": { name: "Mongolia", code: "MN" },
  "+382": { name: "Montenegro", code: "ME" }, "+212": { name: "Morocco", code: "MA" },
  "+95": { name: "Myanmar", code: "MM" }, "+264": { name: "Namibia", code: "NA" },
  "+977": { name: "Nepal", code: "NP" }, "+31": { name: "Netherlands", code: "NL" },
  "+64": { name: "New Zealand", code: "NZ" }, "+505": { name: "Nicaragua", code: "NI" },
  "+234": { name: "Nigeria", code: "NG" }, "+47": { name: "Norway", code: "NO" },
  "+968": { name: "Oman", code: "OM" }, "+92": { name: "Pakistan", code: "PK" },
  "+507": { name: "Panama", code: "PA" }, "+595": { name: "Paraguay", code: "PY" },
  "+51": { name: "Peru", code: "PE" }, "+63": { name: "Philippines", code: "PH" },
  "+48": { name: "Poland", code: "PL" }, "+351": { name: "Portugal", code: "PT" },
  "+974": { name: "Qatar", code: "QA" }, "+40": { name: "Romania", code: "RO" },
  "+7": { name: "Russia", code: "RU" }, "+966": { name: "Saudi Arabia", code: "SA" },
  "+221": { name: "Senegal", code: "SN" }, "+381": { name: "Serbia", code: "RS" },
  "+65": { name: "Singapore", code: "SG" }, "+421": { name: "Slovakia", code: "SK" },
  "+386": { name: "Slovenia", code: "SI" }, "+27": { name: "South Africa", code: "ZA" },
  "+82": { name: "South Korea", code: "KR" }, "+34": { name: "Spain", code: "ES" },
  "+94": { name: "Sri Lanka", code: "LK" }, "+249": { name: "Sudan", code: "SD" },
  "+46": { name: "Sweden", code: "SE" }, "+41": { name: "Switzerland", code: "CH" },
  "+963": { name: "Syria", code: "SY" }, "+886": { name: "Taiwan", code: "TW" },
  "+992": { name: "Tajikistan", code: "TJ" }, "+255": { name: "Tanzania", code: "TZ" },
  "+66": { name: "Thailand", code: "TH" }, "+228": { name: "Togo", code: "TG" },
  "+216": { name: "Tunisia", code: "TN" }, "+90": { name: "Turkey", code: "TR" },
  "+993": { name: "Turkmenistan", code: "TM" }, "+256": { name: "Uganda", code: "UG" },
  "+380": { name: "Ukraine", code: "UA" }, "+971": { name: "UAE", code: "AE" },
  "+44": { name: "United Kingdom", code: "GB" }, "+1": { name: "United States", code: "US" },
  "+598": { name: "Uruguay", code: "UY" }, "+998": { name: "Uzbekistan", code: "UZ" },
  "+58": { name: "Venezuela", code: "VE" }, "+84": { name: "Vietnam", code: "VN" },
  "+967": { name: "Yemen", code: "YE" }, "+260": { name: "Zambia", code: "ZM" },
  "+263": { name: "Zimbabwe", code: "ZW" },
};

async function addUser(req, res) {
  try {
    const { first_name, last_name, user_name, mobile_num, country_code, country_short_name, profile_pic } = req.body;

    if (!first_name || !user_name || !mobile_num) {
      return generalResponse(res, {}, "Nombre, usuario y teléfono son obligatorios", false, true, 400);
    }

    // Handle profile_pic: either from file upload or string path
    let profilePicPath = '';
    if (req.files && Array.isArray(req.files['profile_pic']) && req.files['profile_pic'].length > 0) {
      // Extract relative path from full filesystem path
      const fullPath = req.files['profile_pic'][0].path;
      const uploadsIdx = fullPath.indexOf('uploads');
      if (uploadsIdx !== -1) {
        profilePicPath = fullPath.substring(uploadsIdx).replace(/\\/g, '/');
      } else {
        profilePicPath = fullPath.replace(/^\.[\\/]/, '').replace(/\\/g, '/');
      }
    } else if (typeof profile_pic === 'string' && profile_pic) {
      profilePicPath = profile_pic;
    }

    // Final safeguard: profile_pic must ALWAYS be a string
    if (typeof profilePicPath !== 'string') profilePicPath = '';

    // Check username exists
    const existingUser = await getUser({ user_name }, [], [], true);
    if (existingUser) {
      return generalResponse(res, {}, "El usuario ya existe", false, true, 409);
    }

    // Check phone exists
    const existingPhone = await getUser(
      country_code ? { mobile_num, country_code } : { mobile_num },
      [], [], true
    );
    if (existingPhone) {
      return generalResponse(res, {}, "El número de teléfono ya está registrado", false, true, 409);
    }

    // Use frontend values or fallback to COUNTRY_MAP lookup
    const countryInfo = COUNTRY_MAP[country_code] || { name: "", code: "" };

    // Final safeguard: profile_pic must ALWAYS be a string, not array or object
    if (typeof profilePicPath !== 'string') {
      profilePicPath = '';
    }

    const userData = {
      first_name,
      last_name: last_name || "",
      user_name,
      full_name: `${first_name} ${last_name || ""}`.trim(),
      mobile_num,
      country_code: country_code || "",
      country: countryInfo.name,
      country_short_name: country_short_name || countryInfo.code,
      profile_pic: profilePicPath,
      otp: 123456,
      login_verification_status: true,
      login_type: "phone",
      platforms: ["android"],
      is_admin_otp_user: true,
      mobile_num_is_test: true,
    };

    const user = await createUser(userData);

    return generalResponse(res, {
      user_id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
      user_name: user.user_name,
      mobile_num: user.mobile_num,
      country_code: user.country_code,
      profile_pic: user.profile_pic,
    }, "Usuario creado exitosamente", true, false, 201);

  } catch (error) {
    console.error("Error creating user by admin:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      const field = error.errors[0].path;
      if (field === "user_name") {
        return generalResponse(res, {}, "El usuario ya existe", false, true, 409);
      }
      return generalResponse(res, {}, `${field} ya está en uso`, false, true, 409);
    }
    return generalResponse(res, {}, error.message, false, true, 500);
  }
}

async function deleteGroup(req, res) {
  try {
    let admin_id = req.authData.admin_id;
    if (!admin_id) {
      return generalResponse(res, {}, "Only admins can access.", true, true);
    }

    let filteredData;
    try {
      filteredData = updateFieldsFilter(req.body, ["chat_id"], true);
    } catch (err) {
      return generalResponse(res, {}, err.message, false, true);
    }

    const isGroup = await getChat({
      chat_id: filteredData.chat_id,
      chat_type: "group",
    });
    if (!isGroup) {
      return generalResponse(res, {}, "Chat not found", false, true, 404);
    }

    const chat = await updateChat(
      { deleted_at: new Date() },
      { chat_id: filteredData.chat_id, chat_type: "group" }
    );

    return generalResponse(
      res,
      chat,
      "Group deleted successfully",
      true,
      false,
      200
    );
  } catch (error) {
    console.error("Error deleting group", error);
    return generalResponse(res, {}, error.message, false, true, 500);
  }
}

async function updateGroup(req, res) {
  try {
    let admin_id = req.authData.admin_id;
    if (!admin_id) {
      return generalResponse(res, {}, "Only admins can access.", true, true);
    }

    let filteredData;
    try {
      filteredData = updateFieldsFilter(req.body, ["chat_id", "group_name", "group_description"], true);
    } catch (err) {
      return generalResponse(res, {}, err.message, false, true);
    }

    const isGroup = await getChat({
      chat_id: filteredData.chat_id,
      chat_type: "group",
    });
    if (!isGroup) {
      return generalResponse(res, {}, "Chat not found", false, true, 404);
    }

    const updatePayload = {};
    if (filteredData.group_name !== undefined) updatePayload.group_name = filteredData.group_name;
    if (filteredData.group_description !== undefined) updatePayload.group_description = filteredData.group_description;

    const chat = await updateChat(
      updatePayload,
      { chat_id: filteredData.chat_id, chat_type: "group" }
    );

    return generalResponse(
      res,
      chat,
      "Group updated successfully",
      true,
      false,
      200
    );
  } catch (error) {
    console.error("Error updating group", error);
    return generalResponse(res, {}, error.message, false, true, 500);
  }
}

// ─── Protected user_ids (cannot be deleted by admin) ─────────────────────────
const PROTECTED_USER_IDS = [26];

/**
 * 🗑️ Delete a single user by ID (admin only, hard delete).
 * Protected user_ids (26, 27) cannot be deleted.
 */
async function deleteSingleUser(req, res) {
  try {
    const admin_id = req.authData?.admin_id;
    if (!admin_id) {
      return generalResponse(res, {}, "Only admins can access.", false, true, 403);
    }

    const { user_id } = req.body;
    if (!user_id) {
      return generalResponse(res, {}, "user_id es obligatorio", false, true, 400);
    }

    if (PROTECTED_USER_IDS.includes(Number(user_id))) {
      return generalResponse(res, {}, "Este usuario está protegido y no puede ser eliminado", false, true, 403);
    }

    const user = await getUser({ user_id: Number(user_id) }, [], [], true);
    if (!user) {
      return generalResponse(res, {}, "Usuario no encontrado", false, true, 404);
    }

    await UserModel.destroy({ where: { user_id: Number(user_id) } });

    return generalResponse(
      res,
      { user_id: Number(user_id), deleted: true },
      `Usuario #${user_id} eliminado correctamente`,
      true,
      false,
      200
    );
  } catch (error) {
    console.error("Error in deleteSingleUser:", error);
    return generalResponse(res, {}, error.message, false, true, 500);
  }
}

module.exports = {
  blockUser,
  blockGroup,
  deleteGroup,
  updateGroup,
  usersList,
  getGroupChats,
  getBlockList,
  newUserNotifications,
  newNotifications,
  getCallList,
  deactivate,
  addCategory,
  getCategoryInsights,
  getCategoryInsightsWithDelted,
  editCategory,
  checkUsername,
  checkPhone,
  addUser,
  deleteSingleUser,
};
