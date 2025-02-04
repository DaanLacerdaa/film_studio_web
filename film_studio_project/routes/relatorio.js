const express = require('express');
const router = express.Router();
const { Ator, Filme, Diretor, Produtor } = require('../models');

// Relatório de Atores
router.get('/atores', async (req, res) => {
  const atores = await Ator.findAll({ include: 'filmes' });
  res.render('relatorios/atores_relatorio', { atores });
});

// Relatório de Filmes
router.get('/filmes', async (req, res) => {
  const filmes = await Filme.findAll({ include: ['diretor', 'produtores', 'atores'] });
  res.render('relatorios/filmes_relatorio', { filmes });
});

// Relatório de Diretores
router.get('/diretores', async (req, res) => {
  const diretores = await Diretor.findAll({ include: 'filmes' });
  res.render('relatorios/diretores_relatorio', { diretores });
});

// Relatório de Produtores
router.get('/produtores', async (req, res) => {
  const produtores = await Produtor.findAll({ include: 'filmes' });
  res.render('relatorios/produtores_relatorio', { produtores });
});

module.exports = router;
