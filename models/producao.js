const { DataTypes } = require("sequelize");
const sequelize = require("../database/database");

const Producao = sequelize.define(
  "Producao",
  {
    filme_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "filme",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    pessoa_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "pessoa",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    tableName: "producao",
    timestamps: false,
  }
);

// Validação para PRODUTOR
Producao.beforeCreate(async (producao) => {
  const pessoa = await sequelize.models.Pessoa.findByPk(producao.pessoa_id);
  if (!pessoa || pessoa.tipo !== "PRODUTOR") {
    throw new Error("A pessoa deve ser PRODUTOR.");
  }
});

module.exports = Producao;
