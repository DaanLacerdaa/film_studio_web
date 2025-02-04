const express = require("express");
const router = express.Router();
const Filme = require("../models/filme"); // Modelo do filme
const Pessoa = require("../models/pessoa"); // Modelo de pessoa (atores, produtores)
const Atuacao = require("../models/atuacao"); // Relacionamento de atuação

// Listar todos os filmes

router.get("/", async (req, res) => {
  try {
    const filmes = await Filme.findAll({
      attributes: [
        "id",
        "titulo",
        "ano_lancamento",
        "genero",
        "duracao",
        "idioma",
      ],
      include: [
        {
          model: Pessoa,
          as: "diretor", // Relacionamento com Diretor
          attributes: ["nome"], // Inclui o nome do diretor
        },
        {
          model: Pessoa,
          as: "elenco", // Relacionamento com Atores (Elenco)
          attributes: ["nome"],
          through: {
            model: Atuacao,
            attributes: ["is_principal"],
            where: { is_principal: true }, // Somente atores principais
          },
        },
        {
          model: Pessoa,
          as: "produtores", // Relacionamento com Produtores
          attributes: ["nome"],
        },
      ],
    });

    res.render("filmes", { filmes: filmes || [] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao carregar filmes");
  }
});

// Formulário para criar um novo filme
router.get("/novo", async (req, res) => {
  try {
    const diretores = await Pessoa.findAll({ where: { tipo: "diretor" } });
    const produtores = await Pessoa.findAll({ where: { tipo: "produtor" } });
    res.render("filme_form", { filme: null, diretores, produtores });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao carregar o formulário de novo filme");
  }
});

// Criar um novo filme
router.post("/", async (req, res) => {
  const { titulo, duracao, idioma, diretor_id, produtores } = req.body;
  try {
    const filme = await Filme.create({ titulo, duracao, idioma, diretor_id });

    // Adicionar produtores ao filme (caso haja)
    if (produtores && Array.isArray(produtores)) {
      await filme.setProdutores(produtores); // Relacionamento entre filme e produtores
    }

    res.redirect("/filmes");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao criar o filme");
  }
});

// Formulário para editar um filme
router.get("/editar/:id", async (req, res) => {
  try {
    const filme = await Filme.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Pessoa,
          as: "elenco",
          attributes: ["nome"],
          through: {
            model: Atuacao,
            attributes: ["is_principal"],
            where: { is_principal: true },
          },
        },
        {
          model: Pessoa,
          as: "produtores",
          attributes: ["nome"],
        },
        {
          model: Pessoa,
          as: "diretor", // Diretor
          attributes: ["nome"],
        },
      ],
    });

    const diretores = await Pessoa.findAll({ where: { tipo: "diretor" } });
    const produtores = await Pessoa.findAll({ where: { tipo: "produtor" } });

    if (!filme) {
      return res.status(404).send("Filme não encontrado");
    }

    res.render("filme_form", { filme, diretores, produtores });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao carregar o filme para edição");
  }
});

// Atualizar um filme
router.post("/editar/:id", async (req, res) => {
  const { titulo, duracao, idioma, diretor_id, produtores } = req.body;
  try {
    await Filme.update(
      { titulo, duracao, idioma, diretor_id },
      { where: { id: req.params.id } }
    );

    const filme = await Filme.findByPk(req.params.id);

    // Atualizar relacionamento com produtores
    if (produtores && Array.isArray(produtores)) {
      await filme.setProdutores(produtores); // Atualiza a relação com os produtores
    }

    res.redirect("/filmes");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao atualizar o filme");
  }
});

// Deletar um filme
router.post("/deletar/:id", async (req, res) => {
  try {
    await Filme.destroy({ where: { id: req.params.id } });
    res.redirect("/filmes");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao deletar o filme");
  }
});

module.exports = router;
