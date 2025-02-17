const { DataTypes, Model } = require("sequelize");
const sequelize = require("../database/database");

class Filme extends Model {}

Filme.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ano_lancamento: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    genero: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    duracao: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    idioma: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    diretor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "pessoa",
        key: "id",
      },
    },
  },
  {
    sequelize, // Certifique-se de que está recebendo corretamente o Sequelize
    modelName: "Filme",
    tableName: "filme",
    timestamps: false,
  }
);
Filme.beforeCreate(async (filme) => {
  const pessoa = await Pessoa.findByPk(filme.diretor_id);
  if (!pessoa || pessoa.tipo !== "DIRETOR") {
    throw new Error("O diretor_id deve pertencer a um DIRETOR.");
  }
});

module.exports = Filme;
