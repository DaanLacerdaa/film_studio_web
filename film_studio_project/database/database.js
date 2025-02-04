// database/database.js

const { Sequelize } = require("sequelize");

// Configurar a conexão
const sequelize = new Sequelize("estudio_filmes", "root", "123456789", {
  host: "localhost",
  dialect: "mysql",
});

module.exports = sequelize;
