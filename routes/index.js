const express = require("express");
const router = express.Router();
const { Pessoa, Filme } = require("../models");

// Rota unificada para listar todas as pessoas
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

    // Agrupar pessoas por tipo para a view
    const groupedPeople = pessoas.reduce((acc, pessoa) => {
      const tipo = pessoa.tipo.toLowerCase();
      if (!acc[tipo]) acc[tipo] = [];
      acc[tipo].push(pessoa);
      return acc;
    }, {});

    res.render("pessoas", {
      pessoas: groupedPeople,
    });
  } catch (err) {
    console.error("Erro ao buscar pessoas:", err);
    res
      .status(500)
      .render("erro", { mensagem: "Erro ao carregar lista de pessoas" });
  }
});

// Rota para listar filmes
router.get("/filmes", async (req, res) => {
  try {
    const filmes = await Filme.findAll({
      include: [
        {
          model: Pessoa,
          as: "diretor",
          attributes: ["id", "nome"],
        },
        {
          model: Pessoa,
          as: "produtores",
          attributes: ["id", "nome"],
          through: { attributes: [] },
        },
        {
          model: Pessoa,
          as: "atores",
          attributes: ["id", "nome"],
          through: { attributes: ["is_principal"] },
        },
      ],
      order: [["ano_lancamento", "DESC"]],
    });

    res.render("filmes", {
      filmes: filmes.map((filme) => filme.toJSON()),
    });
  } catch (err) {
    console.error("Erro ao buscar filmes:", err);
    res
      .status(500)
      .render("erro", { mensagem: "Erro ao carregar lista de filmes" });
  }
});

// Rotas de criação
router.get("/pessoas/novo", (req, res) => {
  res.render("nova-pessoa");
});

router.get("/filmes/novo", async (req, res) => {
  try {
    const pessoas = await Pessoa.findAll({
      attributes: ["id", "nome", "tipo"],
      order: [["nome", "ASC"]],
    });

    res.render("novo-filme", {
      pessoas: pessoas.map((p) => p.toJSON()),
    });
  } catch (err) {
    console.error("Erro ao carregar formulário de filme:", err);
    res.status(500).render("erro", { mensagem: "Erro ao carregar formulário" });
  }
});

module.exports = router;
