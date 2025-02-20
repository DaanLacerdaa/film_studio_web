// database/database.js

const { Sequelize } = require("sequelize");

// Configurar a conexão
const sequelize = new Sequelize("estudio_filmes", "root", "#C4r4muru", {
  host: "localhost",
  dialect: "mysql",
});

module.exports = sequelize;
