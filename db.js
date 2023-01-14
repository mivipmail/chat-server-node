const {Sequelize} = require('sequelize')
const SQLite = require('sqlite3')

module.exports = new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
        dialect: process.env.DB_CONNECTION,
        storage: process.env.DB_STORAGE,
        dialectOptions: {
            mode: SQLite.OPEN_READWRITE | SQLite.OPEN_CREATE | SQLite.OPEN_FULLMUTEX,
        },
    },
)