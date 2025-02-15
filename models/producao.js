const { DataTypes, Model } = require("sequelize");
const sequelize = require("../database/database");

class Producao extends Model {}

Producao.init(
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
    produtor_id: {
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
    sequelize,
    modelName: "Producao",
    tableName: "producao",
    timestamps: false,
  }
);

// Garante que a pessoa é um PRODUTOR antes de criar um registro em `producao`
Producao.beforeCreate(async (producao) => {
  const pessoa = await sequelize.models.Pessoa.findByPk(producao.produtor_id);
  if (!pessoa || pessoa.tipo !== "PRODUTOR") {
    throw new Error("A pessoa deve ser PRODUTOR.");
  }
});

module.exports = Producao;
