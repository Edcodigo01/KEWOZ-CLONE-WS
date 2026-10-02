module.exports = (sequelize, DataTypes) => {
    const Catalog_images = sequelize.define("Catalog_images", {
        catalog_image_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        image: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "",
            get() {
                const raw_urls = this.getDataValue("image");
                const imageUrls = `${process.env.baseUrl}/${raw_urls}`;
                return imageUrls != `${process.env.baseUrl}/`
                    ? imageUrls
                    : `${process.env.baseUrl}/uploads/not-found-images/profile-image.png`;
            },  
        },
    });
    Catalog_images.associate = function (models) {
        Catalog_images.belongsTo(models.Catalog, {
            foreignKey: "catalog_id",
            allowNull: true,
            defaultValue: 0,
            onDelete: "CASCADE",
        });
    };
    return Catalog_images;
};