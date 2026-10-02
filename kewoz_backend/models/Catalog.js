module.exports = (sequelize, DataTypes) => {
    const Catalog = sequelize.define("Catalog", {
        catalog_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        price: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "",
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: "",
        },
        country_of_origin: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
        },
        
    });
    Catalog.associate = function (models) {
        Catalog.hasMany(models.Catalog_images, {
            foreignKey: "catalog_id",
            allowNull: true,
            defaultValue: 0,
            onDelete: "CASCADE",
        });
        Catalog.belongsTo(models.User, {
            foreignKey: "user_id",
            allowNull: true,
            defaultValue: 0,
            onDelete: "CASCADE",
        });
    };
    return Catalog;
};