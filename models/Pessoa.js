const { DataTypes, Model } = require("sequelize");
const sequelize = require("../database/database"); // Correto!

class Pessoa extends Model {}

Pessoa.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING, allowNull: false },
    data_nascimento: { type: DataTypes.DATE, allowNull: false },
    sexo: {
      type: DataTypes.ENUM("Masculino", "Feminino", "Outro"),
      allowNull: false,
    },
    nacionalidade: { type: DataTypes.STRING, allowNull: false },
    tipo: {
      type: DataTypes.ENUM("ATOR", "DIRETOR", "PRODUTOR"),
      allowNull: false,
    },
  },
  {
    sequelize, // Certifique-se de que está recebendo corretamente o Sequelize
    modelName: "Pessoa",
    tableName: "pessoa",
    timestamps: false,
  }
);

module.exports = { Pessoa };
