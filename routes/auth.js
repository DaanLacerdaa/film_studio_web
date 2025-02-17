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
    const usuario = await User.findOne({ where: { email } });

    if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
      return res.status(401).render("login", { erro: "Credenciais inválidas" });
    }

    req.session.user = {
      id: usuario.id,
      name: usuario.name,
      email: usuario.email,
    };

    res.redirect("/");
  } catch (err) {
    console.error("Erro no login:", err);
    req.flash("error", "Erro ao processar login");
    res.redirect("/login");
  }
});

// Página de registro
router.get("/register", (req, res) => {
  res.render("register", { erro: null });
});

// Processamento do registro
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const usuarioExistente = await User.findOne({ where: { email } });

    if (usuarioExistente) {
      return res.status(400).render("register", { erro: "E-mail já cadastrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    req.flash("success", "Cadastro realizado com sucesso! Faça login.");
    res.redirect("/login");
  } catch (err) {
    console.error("Erro no registro:", err);
    req.flash("error", "Erro ao processar registro");
    res.redirect("/register");
  }
});

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

module.exports = router;
