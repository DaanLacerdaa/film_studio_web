const express = require("express");
const router = express.Router();
const Filme = require("../models/filme");
const Pessoa = require("../models/pessoa");
const Atuacao = require("../models/atuacao");
const Producao = require("../models/producao");

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
router.post("/novo", async (req, res) => {
  try {
    const { titulo, ano, genero, duracao, idioma, diretor_id, produtores } = req.body;

    // Cria o filme base
    const filme = await Filme.create({
      titulo,
      ano_lancamento: ano,
      genero,
      duracao: parseInt(duracao),
      idioma,
      diretor_id: diretor_id || null
    });

    // Associa os produtores via tabela de junção
    if (produtores && produtores.length > 0) {
      await filme.addProdutores(produtores);
    }

    res.redirect('/filmes');
  } catch (error) {
    console.error('Erro ao criar filme:', error);
    res.status(500).send('Erro interno do servidor');
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
          through: { model: Producao, attributes: [] }, // Ajustado para pegar os produtores corretamente
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

    // Buscar diretores: Pessoas que já estão vinculadas como diretores
    const diretores = await Pessoa.findAll({
      where: {
        id: await Filme.findAll({
          attributes: ["diretor_id"],
          raw: true,
        }).then((res) => res.map((f) => f.diretor_id)),
      },
    });

    // Buscar produtores: Pessoas que já estão na tabela producao
    const produtores = await Pessoa.findAll({
      where: {
        id: await Producao.findAll({
          attributes: ["pessoa_id"],
          raw: true,
        }).then((res) => res.map((p) => p.pessoa_id)),
      },
    });

    res.render("filme_form", { filme, diretores, produtores });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao carregar o filme para edição");
  }
});

// Atualizar um filme
router.post("/editar/:id", async (req, res) => {
  const { titulo, duracao, idioma, diretor_id, ano_lancamento, genero, produtores } = req.body;

  try {
    const filme = await Filme.findByPk(req.params.id);

    if (!filme) {
      return res.status(404).send("Filme não encontrado");
    }

    // Atualiza os dados principais do filme
    await filme.update({ titulo, duracao, idioma, diretor_id, ano_lancamento, genero });

    // Tratamento para produtores: transforma string única em array
    let produtoresArray = [];
    if (produtores) {
      if (typeof produtores === "string") {
        produtoresArray = [parseInt(produtores)]; // Se for string, converte para array
      } else if (Array.isArray(produtores)) {
        produtoresArray = produtores.map((id) => parseInt(id)); // Converte cada ID para número
      }
    }

    // Atualiza os produtores no relacionamento many-to-many
    await filme.setProdutores(produtoresArray);

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

module.exports = router;
