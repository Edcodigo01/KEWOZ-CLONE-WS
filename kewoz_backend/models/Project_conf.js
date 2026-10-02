module.exports = (sequelize, DataTypes) => {
  const Project_conf = sequelize.define("Project_conf", {
    conf_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    terms_and_conditions: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
    },
    privacy_policy: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
    }

  });

  return Project_conf;
};
