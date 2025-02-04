const express = require("express");
const router = express.Router();
const Filme = require("../models/filme");
const Pessoa = require("../models/pessoa");
const Atuacao = require("../models/atuacao");
const buscarFilme = require("../utils/buscarFilme"); // Função para buscar dados externos

// Listar todos os filmes
router.get("/", async (req, res) => {
  try {
    const filmes = await Filme.findAll({
      attributes: ["id", "titulo", "ano_lancamento", "genero", "duracao", "idioma"],
      include: [
        {
          model: Pessoa,
          as: "diretor",
          attributes: ["nome"],
        },
        {
          model: Pessoa,
          as: "elenco",
          attributes: ["nome"],
          through: { model: Atuacao, attributes: ["is_principal"] }, // Mantendo relacionamento
        },
        {
          model: Pessoa,
          as: "produtores",
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

    // Adicionar produtores ao filme (verificação extra)
    if (produtores && Array.isArray(produtores) && produtores.length > 0) {
      await filme.setProdutores(produtores);
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
    const filme = await Filme.findByPk(req.params.id, {
      include: [
        {
          model: Pessoa,
          as: "elenco",
          attributes: ["id", "nome"],
          through: { model: Atuacao, attributes: ["is_principal"] },
        },
        {
          model: Pessoa,
          as: "produtores",
          attributes: ["id", "nome"],
        },
        {
          model: Pessoa,
          as: "diretor",
          attributes: ["id", "nome"],
        },
      ],
    });

    if (!filme) {
      return res.status(404).send("Filme não encontrado");
    }

    const diretores = await Pessoa.findAll({ where: { tipo: "diretor" } });
    const produtores = await Pessoa.findAll({ where: { tipo: "produtor" } });

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
    const filme = await Filme.findByPk(req.params.id);

    if (!filme) {
      return res.status(404).send("Filme não encontrado");
    }

    await filme.update({ titulo, duracao, idioma, diretor_id });

    // Atualizar produtores (verificação extra)
    if (produtores && Array.isArray(produtores) && produtores.length > 0) {
      await filme.setProdutores(produtores);
    } else {
      await filme.setProdutores([]); // Remove os produtores se não vier nenhum
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
    const filme = await Filme.findByPk(req.params.id);

    if (!filme) {
      return res.status(404).send("Filme não encontrado");
    }

    // Removendo as associações antes de deletar
    await filme.setProdutores([]);
    await filme.setElenco([]);

    await filme.destroy();
    res.redirect("/filmes");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao deletar o filme");
  }
});

// Criar um novo filme com dados externos
router.post("/", async (req, res) => {
  const { titulo, duracao, idioma, diretor_id, produtores } = req.body;
  
  try {
    // Buscar informações externas sobre o filme
    const dadosExternos = await buscarFilme(titulo);

    const filme = await Filme.create({
      titulo,
      duracao,
      idioma,
      diretor_id,
      campo_imagem: dadosExternos.posterPath, // Armazena a URL da imagem
    });

    // Adicionar produtores ao filme (verificação extra)
    if (produtores && Array.isArray(produtores) && produtores.length > 0) {
      await filme.setProdutores(produtores);
    }

    res.redirect("/filmes");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao criar o filme");
  }
});



module.exports = router;
