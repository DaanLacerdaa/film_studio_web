const { DataTypes } = require("sequelize");
const sequelize = require("../database/database");

const Atuacao = sequelize.define(
  "Atuacao",
  {
    filme_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "filme",
        key: "id",
      },
      primaryKey: true,
    },
    pessoa_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "pessoa",
        key: "id",
      },
      primaryKey: true,
    },
    is_principal: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "atuacao",
    timestamps: false,
  }
);


// Relacionamentos
Atuacao.belongsTo(Pessoa, { foreignKey: "pessoa_id", as: "pessoa" });
Atuacao.belongsTo(Filme, { foreignKey: "filme_id", as: "filme" });

module.exports = Atuacao;
