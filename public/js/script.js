document.addEventListener("DOMContentLoaded", async () => {
  aplicarTema();
  configurarToggleTema();
  configurarMenuDropdown();
  configurarConfirmacaoExclusao();
  configurarFiltroTabela();
  iniciarAnimacoes();
  configurarPopups();

  await carregarFilmesDoBanco();
  await carregarPessoasDoBanco();
});

// ========== 🎬 FUNÇÕES PRINCIPAIS ==========
async function carregarFilmesDoBanco() {
  const container = document.getElementById("filmes-container");
  if (!container) return;

  try {
    const filmes = JSON.parse(container.dataset.filmes);
    container.innerHTML = "";

    for (const filme of filmes) {
      const filmeDadosExternos = await buscarFilme(filme.titulo);

      const card = document.createElement("div");
      card.classList.add("card");

      card.innerHTML = `
        <h2>${filme.titulo} (${filme.ano_lancamento})</h2>
        <p><strong>Duração:</strong> ${filme.duracao} min</p>
        <p><strong>Idioma:</strong> ${filme.idioma}</p>
        <p><strong>Gênero:</strong> ${filme.genero}</p>
        <p><strong>Diretor:</strong> ${
          filme.diretor?.nome || "Desconhecido"
        }</p>
        <p><strong>Produtores:</strong> ${
          filme.produtores?.map((p) => p.nome).join(", ") || "Nenhum"
        }</p>
        <p><strong>Atores Principais:</strong> ${
          filme.elenco
            ?.filter((a) => a.Atuacao.is_principal)
            .map((a) => a.nome)
            .join(", ") || "Nenhum"
        }</p>
        <p><strong>Título Original:</strong> ${
          filmeDadosExternos?.tituloOriginal || "N/A"
        }</p>
        <p><strong>Nota IMDb:</strong> ${
          filmeDadosExternos?.imdbRating || "N/A"
        }</p>
        <p><strong>Rotten Tomatoes:</strong> ${
          filmeDadosExternos?.rottenTomatoes || "N/A"
        }</p>
        <div class="movie-cover">
          <img src="${
            filmeDadosExternos?.posterPath || "/images/default-movie.jpg"
          }" class="movie-poster" alt="Poster de ${filme.titulo}">
        </div>
        <div class="actions">
          <a href="/filmes/editar/${filme.id}">Editar</a>
          <form 
            action="/filmes/deletar/${filme.id}" 
            method="POST" 
            class="delete-form"
          >
            <button type="submit">Deletar</button>
          </form>
        </div>
      `;

      container.appendChild(card);
    }
  } catch (error) {
    console.error("Erro ao carregar filmes:", error);
  }
}

async function carregarPessoasDoBanco() {
  try {
    const containers = {
      atores: document.getElementById("atores-container"),
      diretores: document.getElementById("diretores-container"),
      produtores: document.getElementById("produtores-container"),
    };

    for (const [categoria, container] of Object.entries(containers)) {
      if (!container) continue;

      const pessoas = JSON.parse(
        container.dataset[categoria.toLowerCase()] || "[]"
      );
      container.innerHTML = "";

      for (const pessoa of pessoas) {
        const imgUrl = await buscarImagemPessoa(pessoa.nome);

        const card = document.createElement("div");
        card.classList.add("card");
        card.innerHTML = `
          <h2>${pessoa.nome}</h2>
          <div class="person-photo">
            <img class="popup-trigger" 
                 data-nome="${pessoa.nome}" 
                 src="${imgUrl}" 
                 alt="Foto de ${pessoa.nome}">
          </div>
          <p><strong>Data Nasc.:</strong> ${pessoa.data_nascimento || "N/A"}</p>
          <p><strong>Sexo:</strong> ${pessoa.sexo || "N/A"}</p>
          <p><strong>Nacionalidade:</strong> ${
            pessoa.nacionalidade || "N/A"
          }</p>
          <div class="actions">
            <a href="/pessoas/editar/${pessoa.id}">Editar</a>
            <form 
              action="/pessoas/deletar/${pessoa.id}" 
              method="POST" 
              class="delete-form"
            >
              <button type="submit">Deletar</button>
            </form>
          </div>
        `;

        container.appendChild(card);
      }
    }
  } catch (error) {
    console.error("Erro ao carregar pessoas:", error);
  }
}

// ========== 🌐 FUNÇÕES DE API ==========
async function buscarFilme(titulo) {
  const apiKeyTMDB = "50c08b07f173158a7370068b082b9294";
  const apiKeyOMDB = "ea8906de";

  try {
    // Primeira busca no TMDB
    const responseTMDB = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${apiKeyTMDB}&query=${encodeURIComponent(
        titulo
      )}&language=pt-BR`
    );

    const dataTMDB = await responseTMDB.json();
    if (!dataTMDB.results?.length) return null;

    const filmeTMDB = dataTMDB.results[0];

    // Busca complementar no OMDB
    const responseOMDB = await fetch(
      `https://www.omdbapi.com/?t=${encodeURIComponent(
        filmeTMDB.original_title
      )}&apikey=${apiKeyOMDB}`
    );

    const dataOMDB = await responseOMDB.json();

    return {
      tituloOriginal: filmeTMDB.original_title,
      posterPath: filmeTMDB.poster_path
        ? `https://image.tmdb.org/t/p/w500${filmeTMDB.poster_path}`
        : dataOMDB.Poster || "/images/default-movie.jpg",
      imdbRating: dataOMDB.imdbRating || "N/A",
      rottenTomatoes:
        dataOMDB.Ratings?.find((r) => r.Source === "Rotten Tomatoes")?.Value ||
        "N/A",
    };
  } catch (error) {
    console.error("Erro na busca de filme:", error);
    return null;
  }
}

async function buscarImagemPessoa(nome) {
  const apiKey = "50c08b07f173158a7370068b082b9294";

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/person?api_key=${apiKey}&query=${encodeURIComponent(
        nome
      )}`
    );

    const data = await response.json();
    return data.results?.[0]?.profile_path
      ? `https://image.tmdb.org/t/p/w500${data.results[0].profile_path}`
      : "/images/default-person.jpg";
  } catch (error) {
    console.error("Erro na busca de imagem:", error);
    return "/images/default-person.jpg";
  }
}

// ========== 🖼️ FUNÇÕES DE POPUP ==========
function configurarPopups() {
  document.addEventListener("mouseover", async (e) => {
    if (e.target.classList.contains("popup-trigger")) {
      const imgElement = e.target;
      const popup = criarPopup(imgElement);
      document.body.appendChild(popup);
    }
  });

  document.addEventListener("mouseout", (e) => {
    if (e.target.classList.contains("popup-trigger")) {
      const popup = document.getElementById("image-popup");
      if (popup) popup.remove();
    }
  });
}

function criarPopup(imgElement) {
  const popup = document.createElement("div");
  popup.id = "image-popup";
  popup.className = "image-popup";

  const imgClone = imgElement.cloneNode();
  imgClone.style.maxWidth = "300px";
  imgClone.style.maxHeight = "400px";

  popup.appendChild(imgClone);
  posicionarPopup(popup, imgElement);
  return popup;
}

function posicionarPopup(popup, target) {
  const rect = target.getBoundingClientRect();
  popup.style.position = "absolute";
  popup.style.top = `${rect.top + window.scrollY}px`;
  popup.style.left = `${rect.left + rect.width + 20}px`;
}

// ========== 🛠️ FUNÇÕES UTILITÁRIAS ==========
function aplicarTema() {
  const temaSalvo = localStorage.getItem("tema") || "claro";
  document.documentElement.setAttribute("data-tema", temaSalvo);
}

function configurarToggleTema() {
  const toggleBtn = document.getElementById("tema-toggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const temaAtual = document.documentElement.getAttribute("data-tema");
      const novoTema = temaAtual === "escuro" ? "claro" : "escuro";
      document.documentElement.setAttribute("data-tema", novoTema);
      localStorage.setItem("tema", novoTema);
    });
  }
}

function configurarMenuDropdown() {
  document.querySelectorAll(".dropdown").forEach((dropdown) => {
    dropdown.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("active");
    });
  });

  document.addEventListener("click", () => {
    document.querySelectorAll(".dropdown").forEach((dropdown) => {
      dropdown.classList.remove("active");
    });
  });
}

function configurarConfirmacaoExclusao() {
  document.addEventListener("submit", (e) => {
    if (e.target.classList.contains("delete-form")) {
      if (!confirm("Tem certeza que deseja excluir este item?")) {
        e.preventDefault();
      }
    }
  });
}

async function filtrarPessoas(tipo) {
  try {
    const response = await fetch(`/pessoas?tipo=${tipo}`);
    if (!response.ok) throw new Error("Erro ao buscar dados");

    const data = await response.json();
    
    // Atualiza a interface (exemplo: lista de pessoas)
    const listaPessoas = document.getElementById("lista-pessoas");
    if (!listaPessoas) return;

    listaPessoas.innerHTML = "";
    data.forEach((pessoa) => {
      const item = document.createElement("li");
      item.textContent = pessoa.nome;
      listaPessoas.appendChild(item);
    });
  } catch (error) {
    console.error("Erro ao carregar pessoas:", error);
  }
}

// Adiciona eventos aos botões de filtro (se existirem)
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".botao-filtro").forEach((button) => {
    button.addEventListener("click", () => {
      const tipo = button.dataset.tipo;
      filtrarPessoas(tipo);
    });
  });
});

function configurarFiltroTabela() {
  const filtroInput = document.getElementById("filtro-tabela");
  if (filtroInput) {
    filtroInput.addEventListener("input", (e) => {
      const termo = e.target.value.toLowerCase();
      document.querySelectorAll(".tabela-dados tr").forEach((linha) => {
        const textoLinha = linha.textContent.toLowerCase();
        linha.style.display = textoLinha.includes(termo) ? "" : "none";
      });
    });
  }
}

function iniciarAnimacoes() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  });

  document.querySelectorAll(".animate-on-scroll").forEach((element) => {
    observer.observe(element);
  });
}
