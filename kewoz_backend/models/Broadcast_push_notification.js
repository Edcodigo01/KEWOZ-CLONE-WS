module.exports = (sequelize, DataTypes) => {
    const Broadcast_push_notification = sequelize.define("Broadcast_push_notification", {
      notification_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: "",
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: "",
      },
      users:{
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        allowNull: true,
        defaultValue: [],
      },
      image_url: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "",
      },
      filter_type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "all",
      },
      filter_countries: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue: [],
      },
      target_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      sent_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "sent",
      },

    });



    return Broadcast_push_notification;
  }
