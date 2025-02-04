const express = require("express");
const router = express.Router();
const Pessoa = require("../models/pessoa");

// Buscar todas as pessoas do tipo "Ator"
router.get("/", async (req, res) => {
  try {
    // Buscar todas as pessoas do tipo "Ator"
    const atores = await Pessoa.findAll({ where: { tipo: "Ator" } });
    res.render("atores", { atores });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao listar atores");
  }
});

// Rota para adicionar um novo ator
router.get("/novo", (req, res) => {
  res.render("ator_form", { ator: null });
});

// Rota para criar uma nova pessoa (ator, diretor, ou produtor)
router.post("/", async (req, res) => {
  try {
    const { nome, data_nascimento, sexo, nacionalidade, tipo } = req.body;

    // Adicionar uma nova pessoa com tipo específico (Ator, Diretor ou Produtor)
    await Pessoa.create({ nome, data_nascimento, sexo, nacionalidade, tipo });
    res.redirect("/atores");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao criar pessoa");
  }
});

// Editar dados de uma pessoa específica
router.get("/editar/:id", async (req, res) => {
  try {
    const pessoa = await Pessoa.findByPk(req.params.id);
    res.render("ator_form", { ator: pessoa });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao carregar pessoa para edição");
  }
});

// Atualizar dados de uma pessoa específica
router.post("/editar/:id", async (req, res) => {
  try {
    const { nome, data_nascimento, sexo, nacionalidade, tipo } = req.body;

    // Atualizar os dados da pessoa com id especificado
    await Pessoa.update(
      { nome, data_nascimento, sexo, nacionalidade, tipo },
      { where: { id: req.params.id } }
    );
    res.redirect("/atores");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao atualizar pessoa");
  }
});

// Deletar uma pessoa específica
router.post("/deletar/:id", async (req, res) => {
  try {
    await Pessoa.destroy({ where: { id: req.params.id } });
    res.redirect("/atores");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao deletar pessoa");
  }
});

module.exports = router;
