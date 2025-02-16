const express = require("express");
const router = express.Router();
const { Pessoa, Filme } = require("../models");

// Função para formatar a data de nascimento
function formatarData(data) {
  return data ? new Date(data).toLocaleDateString("pt-BR") : "N/A";
}

// Rota unificada para listar pessoas
router.get("/pessoas", async (req, res) => {
  try {
    const { tipo, categoria } = req.query;
    const whereClause = {};

    if (tipo) whereClause.tipo = tipo;
    if (categoria) whereClause.categoria = categoria;

    const pessoas = await Pessoa.findAll({
      where: whereClause,
      order: [["nome", "ASC"]],
    });

    // Agrupar pessoas por tipo
    const groupedPeople = pessoas.reduce((acc, pessoa) => {
      const tipo = pessoa.tipo?.toLowerCase() || "outros";
      if (!acc[tipo]) acc[tipo] = [];
      acc[tipo].push({
        ...pessoa.toJSON(),
        data_nascimento: formatarData(pessoa.data_nascimento),
      });
      return acc;
    }, {});

    console.log(
      "Enviando JSON para a view:",
      JSON.stringify(groupedPeople, null, 2)
    );

    res.json(groupedPeople); // Agora retorna um JSON para o frontend
  } catch (err) {
    console.error("Erro ao buscar pessoas:", err);
    res.status(500).json({ erro: "Erro ao carregar lista de pessoas" });
  }
});

// Listar filmes
router.get("/filmes", async (req, res) => {
  try {
    const filmes = await Filme.findAll({
      include: [
        {
          model: Pessoa,
          as: "diretor",
          attributes: [
            "id",
            "nome",
            "data_nascimento",
            "sexo",
            "nacionalidade",
          ],
        },
        {
          model: Pessoa,
          as: "produtores",
          attributes: [
            "id",
            "nome",
            "data_nascimento",
            "sexo",
            "nacionalidade",
          ],
          through: { attributes: [] },
        },
        {
          model: Pessoa,
          as: "elenco",
          attributes: [
            "id",
            "nome",
            "data_nascimento",
            "sexo",
            "nacionalidade",
          ],
          through: { attributes: ["is_principal"] },
        },
      ],
      order: [["ano_lancamento", "DESC"]],
    });

    // Formatando a data de nascimento dos diretores, produtores e elenco
    const filmesFormatados = filmes.map((filme) => {
      return {
        ...filme.toJSON(),
        diretor: filme.diretor
          ? {
              ...filme.diretor.toJSON(),
              data_nascimento: formatarData(filme.diretor.data_nascimento),
            }
          : null,
        produtores: filme.produtores.map((prod) => ({
          ...prod.toJSON(),
          data_nascimento: formatarData(prod.data_nascimento),
        })),
        elenco: filme.elenco.map((ator) => ({
          ...ator.toJSON(),
          data_nascimento: formatarData(ator.data_nascimento),
        })),
      };
    });

    res.render("filmes", { filmes: filmesFormatados });
  } catch (err) {
    console.error("Erro ao buscar filmes:", err);
    res
      .status(500)
      .render("erro", { mensagem: "Erro ao carregar lista de filmes" });
  }
});

// Formulário para criar nova pessoa
router.get("/pessoas/novo", (req, res) => {
  res.render("nova-pessoa");
});

// Formulário para criar novo filme
router.get("/filmes/novo", async (req, res) => {
  try {
    const pessoas = await Pessoa.findAll({
      attributes: ["id", "nome", "tipo"],
      order: [["nome", "ASC"]],
    });

    res.render("novo-filme", { pessoas: pessoas.map((p) => p.toJSON()) });
  } catch (err) {
    console.error("Erro ao carregar formulário de filme:", err);
    res.status(500).render("erro", { mensagem: "Erro ao carregar formulário" });
  }
});

module.exports = router;
