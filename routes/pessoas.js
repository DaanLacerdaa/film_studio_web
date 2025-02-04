const express = require("express");
const router = express.Router();
const { Pessoa } = require("../models");
const tiposValidos = ["ATOR", "DIRETOR", "PRODUTOR"]; // Para reutilização

// Listar todas as pessoas agrupadas
router.get("/", async (req, res) => {
  try {
    const pessoas = await Pessoa.findAll({
      attributes: ["id", "nome", "data_nascimento", "sexo", "nacionalidade", "tipo"],
      order: [["tipo", "ASC"], ["nome", "ASC"]],
    });
    
    const pessoasPlain = pessoas.map(p => p.get({ plain: true }));
    // Agrupar usando reduce
    const agrupado = pessoas.reduce((acc, pessoa) => {
      const tipo = pessoa.tipo;
      if (!acc[tipo]) acc[tipo] = [];
      acc[tipo].push(pessoa);
      return acc;
    }, {});

    res.render("pessoas", {
      pessoas: {
        atores: agrupado.ATOR || [],
        diretores: agrupado.DIRETOR || [],
        produtores: agrupado.PRODUTOR || []
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao carregar pessoas");
  }
});

// Formulário para criar/editar pessoa
router.get(["/novo", "/editar/:id"], async (req, res) => {
  try {
    const pessoa = req.params.id 
      ? await Pessoa.findByPk(req.params.id) 
      : null;

    res.render("pessoa_form", { 
      pessoa,
      tiposValidos // Passa os tipos para o template
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao carregar formulário");
  }
});

// Criar/Atualizar pessoa
router.post(["/", "/editar/:id"], async (req, res) => {
  const { nome, data_nascimento, sexo, nacionalidade, tipo } = req.body;
  
  // Validação
  if (!tiposValidos.includes(tipo)) {
    return res.status(400).send("Tipo inválido");
  }

  try {
    const dados = { nome, data_nascimento, sexo, nacionalidade, tipo };
    
    if (req.params.id) {
      await Pessoa.update(dados, { where: { id: req.params.id } });
    } else {
      await Pessoa.create(dados);
    }

    res.redirect("/pessoas");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao salvar pessoa");
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