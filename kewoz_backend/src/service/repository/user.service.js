const { Op } = require('sequelize');
const db = require("../../../models");
const { User } = db;

const getUsers = async (filterPayload = {}, pagination = { page: 1, pageSize: 10 }, attributes = [], excludedUserIds, includeOptions = []) => {
    try {
        // Destructure and ensure proper types for pagination values
        const { page = 1, pageSize = 10 } = pagination;
        const offset = (Number(page) - 1) * Number(pageSize);
        const limit = Number(pageSize);

        // Initialize the where condition object
        const whereCondition = {};
        const include = [];

        // Dynamically add conditions to the where clause based on the provided filterPayload
        if (filterPayload.user_name) {
            if (!filterPayload.user_check) {

                whereCondition.user_name = { [Op.like]: `${filterPayload.user_name}%` }; // Search by username starting with the provided value
            }
            else {
                whereCondition.user_name = filterPayload.user_name
            }
        }
        if (filterPayload.email) {
            whereCondition.email = filterPayload.email; // Exact match for email
        }
        if (filterPayload.mobile_num) {
            whereCondition.mobile_num = { [Op.like]: `${filterPayload.mobile_num}%` }; // LIKE search for mobile number
        }
        if (filterPayload.user_id) {
            whereCondition.user_id = filterPayload.user_id; // Exact match for user ID
        }
        if (!filterPayload.user_id && excludedUserIds?.length > 0) {
            whereCondition.user_id = {
                [Op.notIn]: excludedUserIds, // Exclude user_ids from the list
            };
        }
        if (filterPayload.country) {
            whereCondition.country = { [Op.like]: `${filterPayload.country}%` }; // Search by username starting with the provided value
        }
        
        // Use findAndCountAll to retrieve users and count for pagination
        let { rows, count } = await User.findAndCountAll({
            where: whereCondition,
            attributes: attributes.length ? attributes : undefined, // Ensure all columns are selected if `attributes` is empty
            limit,
            offset,
            include: [...include, ...includeOptions],
            order: [['createdAt', 'DESC']], // Order by most recently created
        });
        return {
            Records: rows,
            Pagination: {
                total_pages: Math.ceil(count / pageSize),
                total_records: Number(count),
                current_page: Number(page),
                records_per_page: Number(pageSize),
            },
        };
    } catch (error) {
        console.error('Error fetching Users:', error);
        throw new Error('Could not retrieve users');
    }
};

async function getUser(userPayload, includeOptions = [], excludeFields = [], basic=false) {

    if(basic){
        const isUser = await User.findOne({
          where: userPayload,
        });
        return isUser;

    }
    // Create an array to store the conditions for the "OR" query  
    const orConditions = [];

    // Dynamically add conditions based on the provided payload
    if (userPayload?.mobile_num) {
        orConditions.push({ mobile_num: userPayload.mobile_num });
    }
    if (userPayload?.user_name) {
        orConditions.push({
            user_name: { [Op.like]: `${userPayload.user_name}%` } // Search for names starting with the given string
        });
    }
    if (userPayload?.email) {
        orConditions.push({ email: userPayload.email });
    }
    if (userPayload?.user_id) {
        orConditions.push({ user_id: userPayload.user_id });
    }
    if (userPayload?.country) {
        orConditions.push({ country: userPayload.country });
    }

    // If no conditions are provided, return null (or handle it as needed)
    if (orConditions.length === 0) {
        return null;
    }
    
    // Perform the query with the "OR" conditions
    const isUser = await User.findOne({
        where: {
            [Op.or]: orConditions
        },
        include: includeOptions,
        attributes: excludeFields.length > 0 ? { exclude: excludeFields } : undefined

    });
    return isUser;
}



async function getLast7DaysCatalogViews(user_id) {
    if (!user_id) {
        throw new Error("user_id is required");
    }

    // 1. Get the user
    const user = await getUser({ user_id }, [], [], true);
    if (!user) {
        throw new Error("User not found");
    }

    const catalogViews = user.catalog_views || [];

    // 2. Calculate the date 7 days ago
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6); // last 7 days including today

    // 3. Filter catalog_views within last 7 days
    const last7DaysViews = catalogViews.filter(v => {
        const viewDate = new Date(v.date);
        return viewDate >= sevenDaysAgo && viewDate <= today;
    });

    // 4. Sum total views
    const totalViews = last7DaysViews.reduce((sum, v) => sum + v.views, 0);

    return {
        totalViews,
        last7DaysViews, // optional: return array of last 7 days data
    };
}



async function createUser(userPayload) {
    try {
        const newUser = await User.create(userPayload);
        return newUser;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}
async function updateUser(userPayload, condition) {
    try {
        const newUser = await User.update(userPayload, { where: condition, returning: true });

        return newUser;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}

async function isPrivate(userPayload) {
    try {
        const isUser = await getUser(userPayload)

        if (isUser?.is_private) {
            return true
        }
        else {
            return false
        }
    }
    catch (err) {
        console.error('Error finding private user:', error);
        throw error;
    }
}
async function isAdmin(userPayload) {
    try {
        const isUser = await getUser(userPayload)

        if (isUser?.is_admin) {
            return isUser
        }
        else {
            return false
        }
    }
    catch (err) {
        console.error('Error finding private user:', err);
        throw err;
    }
}

async function isOnline(user_id) {
    try {
        const user = await getUser({ user_id });
        if (user?.dataValues?.socket_ids?.length > 0) return { isOnline: true, udatedAt: user?.updatedAt };
        return { isOnline: false, udatedAt: user?.updatedAt };

    } catch (error) {
        throw error;
    }
}

async function getUsersByMobileNumbers(mobileNumbers, additionalAttributes = []) {
    try {
        if (!mobileNumbers || mobileNumbers.length === 0) {
            return new Map();
        }

        // Convert all to strings and remove duplicates
        const uniqueNumbers = [...new Set(mobileNumbers.map(num => num.toString()))];

        const baseAttributes = ['user_id', 'mobile_num'];
        const attributes = [...new Set([...baseAttributes, ...additionalAttributes])];

        const users = await User.findAll({
            where: {
                mobile_num: {
                    [Op.in]: uniqueNumbers
                },
                deleted_at: null
            },
            attributes
        });

        // Create a Map for O(1) lookup
        const userMap = new Map();
        users.forEach(user => {
            const userData = { user_id: user.dataValues.user_id, mobile_num: user.dataValues.mobile_num };
            // Add any additional attributes that were requested
            additionalAttributes.forEach(attr => {
                if (user.dataValues[attr] !== undefined) {
                    userData[attr] = user.dataValues[attr];
                }
            });
            userMap.set(user.dataValues.mobile_num, userData);
        });

        return userMap;
    } catch (error) {
        console.error('Error fetching users by mobile numbers:', error);
        throw error;
    }
}


async function getUsersByIds(userIds, attributes = []) {
    try {
        if (!userIds || userIds.length === 0) return new Map();

        const uniqueIds = [...new Set(userIds)];
        const users = await User.findAll({
            where: { user_id: { [Op.in]: uniqueIds }, deleted_at: null },
            attributes: attributes.length ? attributes : undefined,
        });

        const userMap = new Map();
        users.forEach(user => userMap.set(user.user_id, user));
        return userMap;
    } catch (error) {
        console.error('Error fetching users by ids:', error);
        throw error;
    }
}

module.exports = {
    getUser,
    getUsers,
    createUser,
    updateUser,
    isPrivate,
    isAdmin,
    isOnline,
    getLast7DaysCatalogViews,
    getUsersByMobileNumbers,
    getUsersByIds
};
