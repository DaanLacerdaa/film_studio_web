// sync.js

const { sequelize, Pessoa, Atuacao, Filme, Producao } = require("./models"); // Importando todos os modelos

(async () => {
  try {
    // Testando a conexão com o banco de dados
    await sequelize.authenticate();
    console.log("Conexão com o banco de dados bem-sucedida.");

    // Sincronizar modelos - use { alter: true } para evitar perda de dados
    await sequelize.sync({ alter: true }); // Mantém os dados existentes// use { alter: true } para preservar dados existentes nas tabelas
    console.log("Tabelas criadas com sucesso.");

    process.exit();
  } catch (error) {
    console.error("Erro ao conectar ao banco de dados:", error);
    process.exit(1);
  }
})();
