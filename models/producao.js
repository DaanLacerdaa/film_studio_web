const { DataTypes, Model } = require("sequelize");
const sequelize = require("../database/database");
const Pessoa = require("./pessoa"); // Importa Pessoa para validação

class Producao extends Model {}

Producao.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    filme_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "filme",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    produtorId: {
      // Definição no modelo Sequelize
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "produtor_id", // Nome da coluna real no banco de dados
      references: {
        model: "pessoa",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    sequelize,
    modelName: "Producao",
    tableName: "producao",
    timestamps: false,
  }
);

// Garante que a pessoa é um PRODUTOR antes de criar um registro em `producao`
Producao.beforeValidate(async (producao) => {
  const pessoa = await Pessoa.findByPk(producao.produtorId);
  if (!pessoa || pessoa.tipo !== "PRODUTOR") {
    throw new Error(
      "O produtor_id deve pertencer a uma pessoa com tipo 'PRODUTOR'."
    );
  }
});

module.exports = Producao;
