const { DataTypes, Model } = require("sequelize");
const sequelize = require("../database/database");

class Atuacao extends Model {}

Atuacao.init(
  {
    filme_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "filme", // Nome da tabela como string
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    pessoa_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "pessoa", // Nome da tabela como string
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    is_principal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "Atuacao",
    tableName: "atuacao",
    timestamps: false,
  }
);

module.exports = Atuacao;