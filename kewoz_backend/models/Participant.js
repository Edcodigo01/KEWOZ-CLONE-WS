module.exports = (sequelize, DataTypes) => {
    const Participant = sequelize.define("Participant", {
        participant_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        is_admin: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        update_counter: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        is_deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        last_message_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        }, 
        is_creator: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
         is_locked: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },

        lock_pin: {
            type: DataTypes.STRING, // hashed PIN
            allowNull: true,
        },

        locked_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    })

    Participant.associate = function (models) {
        Participant.belongsTo(models.Chat, {
            foreignKey: "chat_id",
            onDelete: 'CASCADE'
        })
        Participant.belongsTo(models.User, {
            foreignKey: "user_id",
            allowNull: true,
            defaultValue: 0,
            onDelete: 'CASCADE'
        })
        Participant.belongsTo(models.Chat_lable, {
            foreignKey: "lable_id_1",
            as: "chat_lable_1",
        });
        Participant.belongsTo(models.Chat_lable, {
            foreignKey: "lable_id_2",
            as: "chat_lable_2",
        });
        Participant.belongsTo(models.Chat_lable, {
            foreignKey: "lable_id_3",
            as: "chat_lable_3",
        });
    }
    return Participant

}
