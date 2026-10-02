module.exports = (sequelize, DataTypes) => {
    const Chat_lable = sequelize.define("Chat_lable", {
        lable_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        lable_text: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
        },
        lable_color: {
            type: DataTypes.STRING,
            allowNull: false,
            
        },
        status:{
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        is_deleted:{
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        }
    })


    Chat_lable.associate = function (models) {
        Chat_lable.belongsTo(models.User, {
            foreignKey: "user_id",
            allowNull: false,
            defaultValue: 0,
            onDelete: 'CASCADE',
            as: "user"
        })
        Chat_lable.hasMany(models.Participant, {
            foreignKey: "lable_id_1",
            as: "chats_label_1",
        });
        Chat_lable.hasMany(models.Participant, {
            foreignKey: "lable_id_2",
            as: "chats_label_2",
        });
        Chat_lable.hasMany(models.Participant, {
            foreignKey: "lable_id_3",
            as: "chats_label_3",
        });
    }

    return Chat_lable;
}