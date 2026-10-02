const { Categories, User, Sequelize, } = require("../../../models");

async function getAllCategories() {
    const categories = await Categories.findAll(
        {
            order: [['createdAt', 'ASC']],
        }
    );
    return categories;
}

async function addCategory(category) {
    const newCategory = await Categories.create(category);
    return newCategory;
}

async function categoryInsights() {
    try {
        // Step 1: Total users across all categories
        const totalUsers = await User.count({
            where: {
                deleted_at: null,
                user_type: 'business'
            } // if you have this column
        });

        // Step 2: Fetch category-wise user counts
        const categoryData = await Categories.findAll({
            where: { is_deleted: false },
            attributes: [
                "category_id",
                "name",
                "is_deleted",
                [
                    Sequelize.fn("COUNT", Sequelize.col("Users.user_id")),
                    "total_users"
                ]
            ],
            include: [
                {
                    model: User,
                    attributes: [],
                    required: false, // include even if no users exist
                }
            ],
            group: ["Categories.category_id"],
            raw: true
        });

        // Step 3: Add percentage calculation
        const finalData = categoryData.map(cat => {
            const total = parseInt(cat.total_users) || 0;

            return {
                category_id: cat.category_id,
                name: cat.name,
                is_deleted: cat.is_deleted,
                total_users: total,
                percentage: totalUsers > 0 ? Number(((total / totalUsers) * 100).toFixed(2)) : 0
            };
        });

        return finalData;

    } catch (error) {
        console.error("Error in categoryInsights Service:", error);
        throw error;
    }
}

async function updateCategory(category_id, updateData) {
    try {
        // Step 1: Find the category
        const category = await Categories.findOne({
            where: { category_id }
        });

        if (!category) {
            throw new Error("Category not found");
        }

        // Step 2: Update the category
        await category.update(updateData);

        // Step 3: Return updated category
        return category;

    } catch (error) {
        console.error("Error in updateCategory Service:", error);
        throw error;
    }
}

async function categoryInsights_with_deleted() {
    try {
        // Step 1: Total users across all categories
        const totalUsers = await User.count({
            where: {
                deleted_at: null,
                user_type: 'business'
            } // if you have this column
        });

        // Step 2: Fetch category-wise user counts
        const categoryData = await Categories.findAll({
            // where: { is_deleted: false },
            attributes: [
                "category_id",
                "name",
                "is_deleted",
                [
                    Sequelize.fn("COUNT", Sequelize.col("Users.user_id")),
                    "total_users"
                ]
            ],
            include: [
                {
                    model: User,
                    attributes: [],
                    required: false, // include even if no users exist
                }
            ],
            group: ["Categories.category_id"],
            raw: true
        });

        // Step 3: Add percentage calculation
        const finalData = categoryData.map(cat => {
            const total = parseInt(cat.total_users) || 0;

            return {
                category_id: cat.category_id,
                name: cat.name,
                is_deleted: cat.is_deleted,
                total_users: total,
                percentage: totalUsers > 0 ? Number(((total / totalUsers) * 100).toFixed(2)) : 0
            };
        });

        return finalData;

    } catch (error) {
        console.error("Error in categoryInsights Service:", error);
        throw error;
    }
}
module.exports = {
    getAllCategories,
    addCategory,
    categoryInsights,
    categoryInsights_with_deleted,
    updateCategory
}
