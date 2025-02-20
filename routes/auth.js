const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const router = express.Router();

// Middleware para verificar autenticação
function verificarAutenticacao(req, res, next) {
  if (req.session.user) {
    return next();
  }
  req.flash("error", "Você precisa estar logado para acessar essa página.");
  res.redirect("/login");
}

// Página de Login
router.get("/login", (req, res) => {
    res.render("login", { error: null });
});

// Processo de Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Verifica se o usuário existe no banco de dados
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.render("login", { error: "Usuário não encontrado!" });
        }

        // Comparação da senha digitada com a armazenada no banco (criptografada)
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.render("login", { error: "Senha incorreta!" });
        }

        // Autenticação bem-sucedida, redireciona para o dashboard
        res.redirect("/dashboard");

    } catch (error) {
        console.error("Erro ao processar login:", error);
        res.render("login", { error: "Erro interno no servidor" });
    }
});

router.get("/register", (req, res) => {
  res.render("register", { error: null });
});

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
      // Verifica se o e-mail já está cadastrado
      const existingUser = await User.findOne({ where: { email } });

      if (existingUser) {
          return res.render("register", { error: "E-mail já registrado!" });
      }

      // Criptografa a senha antes de salvar no banco de dados
      const hashedPassword = await bcrypt.hash(password, 10);

      // Cria um novo usuário no banco de dados
      await User.create({ name, email, password: hashedPassword });

      res.redirect("/login"); // Redireciona para a tela de login após registro bem-sucedido
  } catch (error) {
      console.error("Erro ao registrar usuário:", error);
      res.render("register", { error: "Erro ao criar conta!" });
  }
});


// Logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

module.exports = router;
