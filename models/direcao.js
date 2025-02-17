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
    diretorId: {
      // Definição no modelo Sequelize
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "diretor_id", // Nome da coluna real no banco de dados
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
    modelName: "Direcao",
    tableName: "Direcao",
    timestamps: false,
  }
);

// Garante que a pessoa é um DIRETOR antes de criar um registro em `direcao`
Direcao.beforeValidate(async (direcao) => {
  const pessoa = await Pessoa.findByPk(direcao.diretorId);
  if (!pessoa || pessoa.tipo !== "DIRETOR") {
    throw new Error(
      "O diretor_id deve pertencer a uma pessoa com tipo 'DIRETOR'."
    );
  }
});

module.exports = Direcao;
