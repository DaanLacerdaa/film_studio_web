const express = require('express');
const router = express.Router();
const Produtor = require('../models/produtor');

// Listar todos os produtores
router.get('/', async (req, res) => {
  const produtores = await Produtor.findAll();
  res.render('produtores', { produtores });
});

// Ajuste na rota novo 
router.get('/novo', (req, res) => {
  res.render('produtor_form', { produtor: null });
});

// Criar um novo produtor
router.post('/', async (req, res) => {
  const { nome, data_nascimento, sexo, nacionalidade } = req.body;
  await Produtor.create({ nome, data_nascimento, sexo, nacionalidade });
  res.redirect('/produtores');
});

// Formulário para editar um produtor
router.get('/editar/:id', async (req, res) => {
  const produtor = await Produtor.findByPk(req.params.id);
  res.render('produtor_form', { produtor });
});

// Atualizar um produtor
router.post('/editar/:id', async (req, res) => {
  const { nome, data_nascimento, sexo, nacionalidade } = req.body;
  await Produtor.update({ nome, data_nascimento, sexo, nacionalidade }, { where: { id: req.params.id } });
  res.redirect('/produtores');
});

// Deletar um produtor
router.post('/deletar/:id', async (req, res) => {
  await Produtor.destroy({ where: { id: req.params.id } });
  res.redirect('/produtores');
});

module.exports = router;
