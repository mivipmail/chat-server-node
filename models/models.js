const {DataTypes} = require("sequelize")
const sequelize = require('../db')
const {ROLES} = require("../consts");

const User  = sequelize.define('user',
    {
        id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
        name: {type: DataTypes.STRING},
        role: {type: DataTypes.STRING, defaultValue: ROLES.GUEST},
        login: {type: DataTypes.STRING, unique: true},
        password: {type: DataTypes.STRING},
        blockedUp: {type: 'DATETIME', defaultValue: null},
    },
    {
        paranoid: true,
    }
)

const Message = sequelize.define('message',
    {
        id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
        user_id: {type: DataTypes.BIGINT, allowNull: false},
        text: {type: DataTypes.STRING},
    },
)


User.hasMany(Message, {
    foreignKey: 'user_id',
    //onDelete: 'CASCADE',
    as: 'messages',
})
Message.belongsTo(User, {foreignKey: 'user_id'})


module.exports = {
    User,
    Message,
}