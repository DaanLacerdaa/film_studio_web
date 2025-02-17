const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const router = express.Router();
const session = require("express-session");
const flash = require("connect-flash");

// Middleware para verificar se o usuário está autenticado
function verificarAutenticacao(req, res, next) {
  if (req.session.user) {
    return next(); // Se estiver autenticado, continua
  }
  req.flash("error", "Você precisa estar logado para acessar essa página.");
  res.redirect("/login");
}
// Página de login
router.get("/login", (req, res) => {
  res.render("login", { erro: null });
});


// Processamento do login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const usuario = await User.findOne({ where: { email } }); // Alterado de Pessoa para User

    if (!usuario || !(await bcrypt.compare(password, usuario.senha))) {
      return res.status(401).render("login", { erro: "Credenciais inválidas" });
    }

    req.session.user = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
    };

    res.redirect("/");
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).render("login", { erro: "Erro ao processar login" });
    req.flash("error", "Credenciais inválidas");
    res.redirect("/login");

  }
});


// Logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

module.exports = router;

