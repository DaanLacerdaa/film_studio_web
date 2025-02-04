const express = require('express');
const router = express.Router();
const Diretor = require('../models/diretor');

// Listar todos os diretores
router.get('/', async (req, res) => {
  const diretores = await Diretor.findAll();
  res.render('diretores', { diretores });
});

// Ajuste na rota novo
router.get('/novo', (req, res) => {
  res.render('diretor_form', { diretor: null });
});

// Criar um novo diretor
router.post('/', async (req, res) => {
  const { nome, data_nascimento, sexo, nacionalidade } = req.body;
  await Diretor.create({ nome, data_nascimento, sexo, nacionalidade });
  res.redirect('/diretores');
});

// Formulário para editar um diretor
router.get('/editar/:id', async (req, res) => {
  const diretor = await Diretor.findByPk(req.params.id);
  res.render('diretor_form', { diretor });
});

// Atualizar um diretor
router.post('/editar/:id', async (req, res) => {
  const { nome, data_nascimento, sexo, nacionalidade } = req.body;
  await Diretor.update({ nome, data_nascimento, sexo, nacionalidade }, { where: { id: req.params.id } });
  res.redirect('/diretores');
});

// Deletar um diretor
router.post('/deletar/:id', async (req, res) => {
  await Diretor.destroy({ where: { id: req.params.id } });
  res.redirect('/diretores');
});

module.exports = router;
