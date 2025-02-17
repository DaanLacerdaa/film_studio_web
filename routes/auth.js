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
  res.render("login", { messages: req.flash("error") });
});

// Processar login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      req.flash("error", "Preencha todos os campos.");
      return res.redirect("/login");
    }

    const user = await User.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      req.flash("error", "E-mail ou senha inválidos.");
      return res.redirect("/login");
    }

    // Armazena apenas dados seguros do usuário na sessão
    req.session.user = { id: user.id, email: user.email, role: user.role };

    req.flash("success", "Login realizado com sucesso!");
    res.redirect("/");
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    req.flash("error", "Ocorreu um erro ao tentar fazer login.");
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
