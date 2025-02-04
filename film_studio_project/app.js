const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");

// Importando as rotas unificadas de pessoas e filmes
const filmesRoutes = require("./routes/filmes");
const pessoasRoutes = require("./routes/pessoas"); // Rota unificada para atores, diretores e produtores

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// Usando as rotas
app.use("/filmes", filmesRoutes);
app.use("/pessoas", pessoasRoutes); // Usando rota unificada para pessoas (atores, diretores, produtores)

app.get("/", (req, res) => {
  res.render("index");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
