const express = require("express");
const router = express.Router();
const { Pessoa } = require("../models");

// Listar todas as pessoas (agrupadas por tipo)
router.get("/", async (req, res) => {
  try {
    const pessoas = await Pessoa.findAll({
      attributes: [
        "id",
        "nome",
        "tipo",
        "data_nascimento",
        "sexo",
        "nacionalidade",
      ],
      order: [
        ["tipo", "ASC"],
        ["nome", "ASC"],
      ],
    });

    const agrupado = pessoas.reduce((acc, pessoa) => {
      if (!acc[pessoa.tipo]) acc[pessoa.tipo] = [];
      acc[pessoa.tipo].push(pessoa);
      return acc;
    }, {});

    const atores = agrupado.Ator || []; // Obtém os atores do objeto agrupado ou um array vazio
    const diretores = agrupado.Diretor || []; // Obtém os diretores ou um array vazio
    const produtores = agrupado.Produtor || []; // Obtém os produtores ou um array vazio

    res.render("pessoas", {
      pessoasAgrupadas: agrupado,
      atores: atores, // Passa os atores para a view
      diretores: diretores, // Passa os diretores para a view
      produtores: produtores, // Passa os produtores para a view
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao carregar pessoas");
  }
});

// Formulário para criar nova pessoa
router.get("/novo", (req, res) => {
  res.render("pessoa_form", { pessoa: null });
});

// Criar nova pessoa
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

// Formulário para editar pessoa
router.get("/editar/:id", async (req, res) => {
  try {
    const pessoa = await Pessoa.findByPk(req.params.id);
    if (!pessoa) return res.status(404).send("Pessoa não encontrada");

    res.render("pessoa_form", { pessoa });
  } catch (err) {
    console.error("Erro ao carregar a pessoa para edição:", err);
    res.status(500).send("Erro ao carregar o formulário de edição");
  }
});

// Atualizar pessoa
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

// Deletar pessoa
router.post("/deletar/:id", async (req, res) => {
  try {
    const pessoa = await Pessoa.findByPk(req.params.id);
    if (!pessoa) return res.status(404).send("Pessoa não encontrada");

    await pessoa.destroy();
    res.redirect("/pessoas");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao deletar pessoa");
  }
});

module.exports = router;
