const { DataTypes, Model } = require("sequelize");
const sequelize = require("../database/database");  // Certifique-se de que o sequelize está correto
const Filme = require("./filme");  // Certifique-se de que o modelo Filme está sendo importado corretamente
const Pessoa = require("./pessoa");  // Certifique-se de que o modelo Pessoa está sendo importado corretamente

class Atuacao extends Model {}

Atuacao.init(
  {
    filme_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Filme,  // Aqui deve referenciar o modelo Filme, não apenas o nome da tabela
        key: "id",
      },
      primaryKey: true,
    },
    pessoa_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Pessoa,  // Aqui deve referenciar o modelo Pessoa, não apenas o nome da tabela
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
    sequelize,
    modelName: "Atuacao",
    tableName: "atuacao",
    timestamps: false,
  }
);

// Definindo as associações
Atuacao.belongsTo(Filme, {
  foreignKey: "filme_id",
  as: "filme", // Definindo alias para acessar o filme na atuação
});

Atuacao.belongsTo(Pessoa, {
  foreignKey: "pessoa_id",
  as: "pessoa", // Definindo alias para acessar a pessoa na atuação
});

module.exports = Atuacao;