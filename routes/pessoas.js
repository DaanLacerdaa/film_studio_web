const express = require("express");
const router = express.Router();
const { Pessoa } = require("../models");

// Rota para listar todas as pessoas
router.get("/", async (req, res) => {
  try {
    const pessoas = await Pessoa.findAll({
      attributes: ["id", "nome"],
    });

    res.render("pessoas", { pessoas });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao carregar pessoas");
  }
});

router.get("/", async (req, res) => {
  // Usando router.get ao invés de app.get
  try {
    const pessoas = await Pessoa.findAll(); // Lê todas as pessoas do banco de dados
    res.render("pessoas", { pessoas });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao carregar a lista de pessoas");
  }
});

// Rota para exibir o formulário de criação
router.get("/novo", (req, res) => {
  res.render("pessoa_form", { pessoa: null });
});

// Rota para adicionar uma nova pessoa
router.post("/", async (req, res) => {
  const { nome, data_nascimento, sexo, nacionalidade, tipo } = req.body;
  try {
    await Pessoa.create({ nome, data_nascimento, sexo, nacionalidade, tipo });
    res.redirect("/pessoas");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao adicionar pessoa");
  }
});

// Rota para editar uma pessoa existente
router.get("/editar/:id", async (req, res) => {
  try {
    const pessoa = await Pessoa.findByPk(req.params.id);

    if (!pessoa) {
      return res.status(404).send("Pessoa não encontrada");
    }

    res.render("pessoa_form", { pessoa });
  } catch (err) {
    console.error("Erro ao carregar a pessoa para edição:", err);
    res.status(500).send("Erro ao carregar o formulário de edição");
  }
});

// Rota para atualizar uma pessoa
router.post("/editar/:id", async (req, res) => {
  const { nome, data_nascimento, sexo, nacionalidade, tipo } = req.body;
  try {
    await Pessoa.update(
      { nome, data_nascimento, sexo, nacionalidade, tipo },
      { where: { id: req.params.id } }
    );
    res.redirect("/pessoas");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao atualizar pessoa");
  }
});

// Rota para deletar uma pessoa
router.post("/deletar/:id", async (req, res) => {
  try {
    await Pessoa.destroy({ where: { id: req.params.id } });
    res.redirect("/pessoas");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao deletar pessoa");
  }
});

module.exports = router; // Exportando o router para uso em app.js

// Rotas para tipos específicos (Novo!)
router.get("/atores", async (req, res) => {
  try {
    const atores = await Pessoa.findAll({ where: { tipo: "Ator" } });
    res.render("atores", { atores }); // Certifique-se de ter a view atores.ejs
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao carregar atores");
  }
});

router.get("/diretores", async (req, res) => {
  try {
    const diretores = await Pessoa.findAll({ where: { tipo: "Diretor" } });
    res.render("diretores", { diretores }); // Crie a view diretores.ejs
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao carregar diretores");
  }
});

router.get("/produtores", async (req, res) => {
  try {
    const produtores = await Pessoa.findAll({ where: { tipo: "Produtor" } });
    res.render("produtores", { produtores }); // Crie a view produtores.ejs
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao carregar produtores");
  }
});

module.exports = router;
