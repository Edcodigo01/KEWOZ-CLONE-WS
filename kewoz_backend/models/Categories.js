    module.exports = (sequelize, DataTypes) => {
        const Categories = sequelize.define("Categories", {
            category_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: "",
            },
            is_deleted: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
        });
        Categories.associate = function (models) {
            Categories.hasMany(models.User, {
                foreignKey: "category_id",
                onDelete: "CASCADE",
            });
        }
        return Categories;

    }