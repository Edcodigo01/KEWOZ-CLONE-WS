
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    user_name: {
      type: DataTypes.STRING,
      unique: true, // This will ensure only one unique index is created
      allowNull: true,
      get() {
        const data = this.getDataValue("user_name");
        if (!data) {
          return "";
        }

        return data;
      },
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true, // This will ensure only one unique index is created
      get() {
        const data = this.getDataValue("email");
        if (!data) {
          return "";
        }

        return data;
      },
    },
    country_code: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    socket_ids: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    mobile_num: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true, // This will ensure only one unique index is created
      get() {
        const data = this.getDataValue("mobile_num");
        if (!data) {
          return "";
        }

        return data;
      },
    },
    otp: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: " ",
    },
    login_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    profile_pic: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
      get() {
        const raw_urls = this.getDataValue("profile_pic");
        if (raw_urls == null) {
          return `${process.env.baseUrl}/uploads/not-found-images/profile-image.png`;
        }
        const imageUrls = `${process.env.baseUrl}/${raw_urls}`;

        return imageUrls != `${process.env.baseUrl}/`
          ? imageUrls
          : `${process.env.baseUrl}/uploads/not-found-images/profile-image.png`;
      },
    },    
    banner_image: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
      get() { 
        const raw_urls = this.getDataValue("banner_image");
        if (raw_urls == null) {
          return `${process.env.baseUrl}/uploads/not-found-images/profile-image.png`;
        }
        const imageUrls = `${process.env.baseUrl}/${raw_urls}`;

        return imageUrls != `${process.env.baseUrl}/`
          ? imageUrls
          : `${process.env.baseUrl}/uploads/not-found-images/profile-image.png`;
      },
    },
    selfie: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
      get() {
        const raw_urls = this.getDataValue("selfie");
        const imageUrls = `${process.env.baseUrl}${raw_urls}`;
        return imageUrls != process.env.baseUrl ? imageUrls : ``;
      },
    },
    dob: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      get() {
        const data = this.getDataValue("dob");
        if (!data) {
          return "";
        }
        return data;
      },
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Male",
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    country_short_name: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "Available",
    },
    device_token: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    profile_verification_status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    login_verification_status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_private: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_admin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    platforms: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
      set(value) {
        if (Array.isArray(value)) {
          const cleaned = value.filter(
            (item) => typeof item === "string" && item.trim() !== ""
          );
          this.setDataValue("platforms", cleaned);
        } else {
          this.setDataValue("platforms", []);
        }
      },
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    blocked_by_admin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    viewed_by_admin: { //for admin panel new user's notification
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    contact_details: {
      type: DataTypes.JSONB, // Using JSONB to store array of objects
      allowNull: false,
      defaultValue: [],
    },

    send_greeting_message: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    send_away_message: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    greeting_message: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    away_message:{
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    facebook_link:{
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    instagram_link:{
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    youtube_link:{
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    linkedin_link:{
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    vk_link:{
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    // company_name:{
    //     type: DataTypes.STRING,
    //     allowNull: false,
    //     defaultValue: "",
    // },
    business_hours:{
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    open_time:{
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: null,
    },
    close_time:{
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: null,
    },
    appointments_only:{
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    always_open:{
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      },
    website:{
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    location:{
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    always_open:{
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    by_appointments_only:{
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    profile_setup_step:{
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    latitude:{
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    longitude:{
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    bio:{
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "Available",
    },
    user_type:{
      type:DataTypes.STRING,
      allowNull:false,
      defaultValue:"regular"
    },
    is_demo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    is_admin_otp_user: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    mobile_num_is_test: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    catalog_views: {
      type: DataTypes.JSON, 
      allowNull: true,
      defaultValue: [], 
    },
    last_contact_sync: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    contacts_hash: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
  },{
    timestamps: true,
  });
  User.associate = function (models) {

    User.hasMany(models.Message_seen, {
      foreignKey: "user_id",
      allowNull: true,
      defaultValue: 0,
      onDelete: "CASCADE",
    });
    User.hasMany(models.Participant, {
      foreignKey: "user_id",
      allowNull: true,
      defaultValue: 0,
      onDelete: "CASCADE",
    });
    User.hasMany(models.Message, {
      foreignKey: "sender_id",
      allowNull: true,
      defaultValue: 0,
      onDelete: "CASCADE",
    });
    User.hasMany(models.Message, {
      foreignKey: "peer_user",
      as: "ActionedUser",
      allowNull: true,
      defaultValue: 0,
      onDelete: "CASCADE",
    });
    User.belongsToMany(models.User, {
      through: models.Block,
      foreignKey: "user_id",
      as: "blocker",
      onDelete: "CASCADE",
    });
    User.belongsToMany(models.User, {
      through: models.Block,
      foreignKey: "blocked_id",
      as: "blocked",
      onDelete: "CASCADE",
    });
    User.hasMany(models.Report, {
      foreignKey: "report_by",
      as: "reportsMade",
      onDelete: "CASCADE",
    });

    User.hasMany(models.Report, {
      foreignKey: "report_to",
      as: "reportsReceived",
      onDelete: "CASCADE",
    });


    User.hasMany(models.Story, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
      as: "stories"
    });

    User.hasMany(models.Catalog, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
      as: "catalogs"
    });
    User.belongsTo(models.Categories, {
      foreignKey: "category_id",
      onDelete: "CASCADE",
      as: "categories"
    });
    User.hasMany(models.Chat_lable, {
      foreignKey: "user_id",
      allowNull: false,
      defaultValue: 0,
      onDelete: 'CASCADE',
      as: "user"
    });
  };

return User;
};
