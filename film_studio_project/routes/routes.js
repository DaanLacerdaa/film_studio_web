const express = require("express");
const router = express.Router();
const { Pessoa } = require("../models"); // A referência ao modelo Pessoa

// Rota para listar todas as pessoas
router.get("/pessoas", async (req, res) => {
  try {
    const pessoas = await Pessoa.findAll(); // Lê todas as pessoas do banco de dados
    res.render("pessoas", { pessoas });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao carregar a lista de pessoas");
  }
});

// Rota para exibir o formulário de criação
router.get("/pessoas/novo", (req, res) => {
  res.render("pessoa_form", { pessoa: null });
});

// Rota para adicionar uma nova pessoa
router.post("/pessoas", async (req, res) => {
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
router.get("/pessoas/editar/:id", async (req, res) => {
  try {
    const pessoa = await Pessoa.findByPk(req.params.id);
    res.render("pessoa_form", { pessoa });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao carregar a pessoa para edição");
  }
});

// Rota para atualizar uma pessoa
router.post("/pessoas/editar/:id", async (req, res) => {
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
router.post("/pessoas/deletar/:id", async (req, res) => {
  try {
    await Pessoa.destroy({ where: { id: req.params.id } });
    res.redirect("/pessoas");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao deletar pessoa");
  }
});

module.exports = router;
