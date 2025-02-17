document.addEventListener("DOMContentLoaded", async () => {
  aplicarTema();
  configurarToggleTema();
  configurarMenuDropdown();
  configurarConfirmacaoExclusao();
  configurarFiltroTabela();
  iniciarAnimacoes();
  configurarPopups();

  // Carregar de forma sequencial
  await carregarFilmesDoBanco();
  await carregarPessoasDoBanco();

  formatarData();
});

// ========== 🌐 CONFIGURAÇÕES GLOBAIS ==========
const apiKeyTMDB = "50c08b07f173158a7370068b082b9294";
const apiKeyOMDB = "ea8906de";
const defaultImage = "/images/default-person.jpg"; // ← Adicionar aqui
const defaultMovieImage = "/images/default-movie.jpg";

// ========== 🎬 FUNÇÕES PRINCIPAIS ==========
async function carregarFilmesDoBanco() {
  const container = document.getElementById("filmes-container");
  if (!container) return;

  try {
    const filmes = JSON.parse(container.dataset.filmes);
    container.innerHTML = "";

    for (const filme of filmes) {
      const filmeDadosExternos = await buscarFilme(
        filme.titulo,
        filme.ano_lancamento
      );

      const card = document.createElement("div");
      card.classList.add("card");

      // Construção do carrossel de imagens do filme
      let slides = "";
      if (filmeDadosExternos?.backdropPaths?.length) {
        slides = filmeDadosExternos.backdropPaths
          .map(
            (img) => `
          <div class="swiper-slide">
            <img src="https://image.tmdb.org/t/p/w780${img}" class="backdrop-img" alt="Cena de ${filme.titulo}">
          </div>
        `
          )
          .join("");
      }

      // Sinopse curta e botão "Leia mais"
      const sinopse = filmeDadosExternos?.sinopse || "Sinopse não disponível.";
      const sinopseCurta =
        sinopse.length > 150 ? sinopse.substring(0, 150) + "..." : sinopse;

      card.innerHTML = `
        <h2>${filme.titulo} (${filme.ano_lancamento})</h2>

        <div class="swiper mySwiper">
          <div class="swiper-wrapper">
            ${
              slides ||
              `<div class="swiper-slide"><img src="/images/default-movie.jpg" class="backdrop-img"></div>`
            }
          </div>
          <div class="swiper-pagination"></div>
          <div class="swiper-button-next"></div>
          <div class="swiper-button-prev"></div>
        </div>

        <p><strong>Duração:</strong> ${filme.duracao || "N/A"} min</p>
        <p><strong>Idioma:</strong> ${filme.idioma || "Desconhecido"}</p>
        <p><strong>Gênero:</strong> ${filme.genero || "Desconhecido"}</p>
        <p><strong>Nota IMDb:</strong> ${
          filmeDadosExternos?.imdbRating || "N/A"
        }</p>

        <p class="sinopse">
          <strong>Sinopse:</strong> <span class="sinopse-curta">${sinopseCurta}</span>
          <span class="sinopse-completa" style="display: none;">${sinopse}</span>
          ${
            sinopse.length > 150
              ? '<button class="leia-mais">Leia mais</button>'
              : ""
          }
        </p>

        <div class="movie-cover">
          <img src="${
            filmeDadosExternos?.posterPath || "/images/default-movie.jpg"
          }" class="movie-poster" alt="Poster de ${filme.titulo}">
        </div>

        <div class="actions">
          <a href="/filmes/editar/${filme.id}"class = "btn-editar" >Editar</a>
          <form action="/filmes/deletar/${
            filme.id
          }" method="POST" class="delete-form">
            <button type="submit">Deletar</button>
          </form>
        </div>
      `;

      container.appendChild(card);
    }

    // Inicializa os carrosséis Swiper após a inserção dos filmes
    iniciarCarrossel();

    // Adiciona eventos aos botões "Leia mais"
    document.querySelectorAll(".leia-mais").forEach((btn) => {
      btn.addEventListener("click", function () {
        const sinopseCurta = this.previousElementSibling.previousElementSibling;
        const sinopseCompleta = this.previousElementSibling;
        if (sinopseCompleta.style.display === "none") {
          sinopseCompleta.style.display = "inline";
          sinopseCurta.style.display = "none";
          this.textContent = "Leia menos";
        } else {
          sinopseCompleta.style.display = "none";
          sinopseCurta.style.display = "inline";
          this.textContent = "Leia mais";
        }
      });
    });
  } catch (error) {
    console.error("Erro ao carregar filmes:", error);
    alert("Ocorreu um erro ao carregar os filmes. Tente novamente.");
  }
}

// 🔄 Função para iniciar os carrosséis Swiper

function iniciarCarrossel() {
  // Verifica se já existe uma instância do Swiper
  if (window.mySwiper) {
    window.mySwiper.destroy(true, true); // Destroi a instância anterior
  }

  // Cria uma nova instância do Swiper e armazena globalmente
  window.mySwiper = new Swiper(".mySwiper", {
    loop: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  });
}

// ========== 🌐 FUNÇÕES DE API ==========
async function buscarFilme(titulo, ano) {
  try {
    // Busca no TMDB
    const responseTMDB = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${apiKeyTMDB}&query=${encodeURIComponent(
        titulo
      )}&year=${ano}&language=pt-BR`
    );

    const dataTMDB = await responseTMDB.json();
    if (!dataTMDB.results?.length) return null;

    const filmeTMDB = dataTMDB.results[0];

    // Busca backdrop_path (cenas do filme)
    const detalhesFilmeTMDB = await fetch(
      `https://api.themoviedb.org/3/movie/${filmeTMDB.id}/images?api_key=${apiKeyTMDB}`
    ).then((res) => res.json());

    const backdrops =
      detalhesFilmeTMDB.backdrops?.map((b) => b.file_path).slice(0, 5) || [];

    // Busca complementar no OMDB
    const responseOMDB = await fetch(
      `https://www.omdbapi.com/?t=${encodeURIComponent(
        filmeTMDB.original_title
      )}&y=${ano}&apikey=${apiKeyOMDB}`
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
      sinopse: filmeTMDB.overview || dataOMDB.Plot || "Sinopse não disponível.",
      backdropPaths: backdrops,
    };
  } catch (error) {
    console.error("Erro na busca de filme:", error);
    return null;
  }
}

// ========== 🌐 FUNÇÕES DE API ==========
async function buscarImagemPessoa(nome) {
  const defaultImage = "/images/default-person.jpg"; // Definir fallback
  const baseURL = "https://api.themoviedb.org/3/search/person";
  const query = nome
    .toLowerCase()
    .replace(/\s+/g, "+") // Espaços para '+'
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Remove acentos

  try {
    const response = await fetch(
      `${baseURL}?api_key=${apiKeyTMDB}&query=${query}&language=pt-BR`
    );

    if (!response.ok) throw new Error(`Erro ${response.status}`);

    const data = await response.json();
    const perfil = data.results?.[0]?.profile_path;

    return perfil ? `https://image.tmdb.org/t/p/w500${perfil}` : defaultImage;
  } catch (error) {
    console.error(`Falha na busca por ${nome}:`, error);
    if (!response.ok) {
      console.warn(
        `Falha na requisição TMDB (${response.status}): ${response.statusText}`
      );
      return defaultImage;
    }
    return defaultImage;
  }
}

// ========== 🃏 CRIAÇÃO DE CARDS ==========
function criarCardPessoa(pessoa, imagemURL) {
  const card = document.createElement("div");
  card.className = "card";

  const img = new Image();
  img.src = imagemURL;
  img.alt = `Foto de ${pessoa.nome}`;
  img.onerror = () => (img.src = defaultImage); // Fallback robusto

  const filmesHTML =
    pessoa.filmes && pessoa.filmes.length > 0
      ? `<div class="filmes-lista">
         <strong>Participações:</strong>
         <ul>
           ${pessoa.filmes
             .map((f) => `<li>${f.titulo} (${f.ano_lancamento || "N/A"})</li>`)
             .join("")}
         </ul>
       </div>`
      : "";

  card.innerHTML = `
    <div class="person-photo">
      <img src="${imagemURL}" alt="Foto de ${pessoa.nome}" class="profile-img">
    </div>
    <div class="detalhes-pessoa">
      <h2>${pessoa.nome}</h2>
      <p><strong>Nascimento:</strong> ${formatarData(
        pessoa.data_nascimento
      )}</p>
      <p><strong>Sexo:</strong> ${pessoa.sexo || "N/A"}</p>
      <p><strong>Nacionalidade:</strong> ${pessoa.nacionalidade}</p>
      ${filmesHTML}
    </div>
    <div class="actions">
      <a href="/pessoas/editar/${pessoa.id}" class="btn-editar">Editar</a>
      <form action="/pessoas/deletar/${pessoa.id}" method="POST">
        <button type="submit" class="btn-excluir">Excluir</button>
      </form>
    </div>
  `;

  return card;
}

// ========== 🚀 CARREGAMENTO DE DADOS ==========
async function carregarPessoasDoBanco() {
  const categorias = [
    { nome: "ator", containerId: "ator-container" },
    { nome: "diretor", containerId: "diretor-container" },
    { nome: "produtor", containerId: "produtor-container" },
  ];

  for (const { nome, containerId } of categorias) {
    const container = document.getElementById(containerId);
    if (!container) continue;

    try {
      const dadosBrutos = container.dataset[nome];
      if (!dadosBrutos) throw new Error("Dados não encontrados no dataset");

      const pessoas = JSON.parse(dadosBrutos);
      if (!Array.isArray(pessoas)) throw new Error("Dados não são um array");

      container.innerHTML = "";

      for (const pessoa of pessoas) {
        const imgURL = await buscarImagemPessoa(pessoa.nome);
        container.appendChild(criarCardPessoa(pessoa, imgURL));
      }
    } catch (error) {
      console.error(`Erro ao processar ${nome}:`, error);
      console.error("Dados brutos:", container?.dataset[nome]);
    }
  }
}
// ========== 🎬 INICIALIZAÇÃO ==========
document.addEventListener("DOMContentLoaded", () => {
  carregarPessoasDoBanco();

  // Filtro dinâmico (caso exista)
  const tipoFiltro = document.getElementById("tipoFiltro");
  if (tipoFiltro) {
    tipoFiltro.addEventListener("change", async function () {
      const tipo = this.value.toUpperCase();
      try {
        const response = await fetch(`/pessoas/${tipo.toLowerCase()}`, {
          headers: { "X-Requested-With": "XMLHttpRequest" },
        });

        if (!response.ok) throw new Error(`Erro ${response.status}`);

        const dados = await response.json();
        atualizarLista(dados);
      } catch (error) {
        console.error("Falha ao filtrar:", error);
      }
    });
  }
});

// ========== 🔄 ATUALIZAÇÃO DINÂMICA ==========
function atualizarLista(pessoas) {
  const container = document.getElementById("dynamic-container");
  if (!container) return;

  container.innerHTML = ""; // Resetar conteúdo

  if (!Array.isArray(pessoas) || pessoas.length === 0) {
    container.innerHTML = `<p class="sem-dados">Nenhum resultado encontrado</p>`;
    return;
  }

  // Criar cards para os resultados filtrados
  pessoas.forEach(async (pessoa) => {
    const imagem = await buscarImagemPessoa(pessoa.nome);
  });
}
function criarCardFilme(filme, imagem) {
  const card = document.createElement("div");
  card.className = "card-filme";
  card.innerHTML = `
      <img src="${imagem}" alt="${filme.titulo}">
      <h3>${filme.titulo}</h3>
      <p>Lançamento: ${filme.ano_lancamento}</p>
  `;
  return card;
}

// Função corrigida para formatar data corretamente
function formatarData(data) {
  if (!data) return "N/A";
  try {
    return new Date(data).toLocaleDateString("pt-BR");
  } catch (e) {
    return "Data inválida";
  }
}
function gerarDetalhesFilmes(pessoa) {
  if (!pessoa.filmes?.length) return "";

  const filmesList = pessoa.filmes
    .map(
      (f) => `
    <li>
      ${f.titulo} 
      <em>(${f.Atuacao?.is_principal ? "Protagonista" : "Coadjuvante"})</em>
    </li>
  `
    )
    .join("");

  return `
    <details>
      <summary>Participações (${pessoa.filmes.length})</summary>
      <ul class="filmes-list">${filmesList}</ul>
    </details>
  `;
}

// ========== 🖼️ FUNÇÕES DE POPUP ==========
function configurarPopups() {
  let popupAtivo = null;

  document.addEventListener("mouseover", (e) => {
    if (e.target.classList.contains("popup-trigger") && !popupAtivo) {
      popupAtivo = criarPopup(e.target);
      document.body.appendChild(popupAtivo);
    }
  });

  document.addEventListener("mouseout", () => {
    if (popupAtivo) {
      popupAtivo.remove();
      popupAtivo = null;
    }
  });
}

function criarPopup(imgElement) {
  const popup = document.createElement("div");
  popup.id = "image-popup";
  popup.className = "image-popup";

  const imgClone = imgElement.cloneNode();
  Object.assign(imgClone.style, {
    maxWidth: "300px",
    maxHeight: "400px",
  });

  popup.appendChild(imgClone);
  posicionarPopup(popup, imgElement);
  return popup;
}

function posicionarPopup(popup, target) {
  const rect = target.getBoundingClientRect();
  Object.assign(popup.style, {
    position: "absolute",
    top: `${rect.top + window.scrollY}px`,
    left: `${rect.left + rect.width + 20}px`,
  });
}

// ========== 🛠️ FUNÇÕES UTILITÁRIAS ==========
// Função para aplicar o tema armazenado no localStorage
// ========== 🛠 MELHORIAS NO CONTROLE DE TEMA ==========

// ========== 🛠 FUNÇÕES UTILITÁRIAS ==========

// Função para aplicar o tema salvo no localStorage
// Função para aplicar o tema salvo no localStorage
function aplicarTema() {
  const temaSalvo = localStorage.getItem("tema") || "dark";
  document.documentElement.setAttribute("data-theme", temaSalvo);

  // Atualizar os elementos que usam variáveis CSS
  document.querySelectorAll(".menu a").forEach((link) => {
    link.style.color = getComputedStyle(
      document.documentElement
    ).getPropertyValue("--menu-color-text");
  });

  // Atualizar o estado do checkbox
  const toggleBtn = document.getElementById("tema-toggle");
  if (toggleBtn) {
    toggleBtn.checked = temaSalvo === "dark";
  }
}

// Função para alternar o tema
function configurarToggleTema() {
  const toggleBtn = document.getElementById("tema-toggle");

  if (toggleBtn) {
    toggleBtn.addEventListener("change", () => {
      const novoTema = toggleBtn.checked ? "dark" : "light";

      document.documentElement.setAttribute("data-theme", novoTema);
      localStorage.setItem("tema", novoTema);

      // Atualizar os elementos do menu após a troca de tema
      document.querySelectorAll(".menu a").forEach((link) => {
        link.style.color = getComputedStyle(
          document.documentElement
        ).getPropertyValue("--menu-color-text");
      });
    });
  }
}

// Inicializar ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
  aplicarTema(); // Aplica o tema armazenado
  configurarToggleTema(); // Configura o botão de alternância
});

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
  document.querySelectorAll(".botao-filtro").forEach((botao) => {
    botao.addEventListener("click", () => {
      const tipo = botao.getAttribute("data-tipo");
      document.querySelectorAll(".card-grid").forEach((grid) => {
        grid.style.display = grid.id.includes(tipo) ? "grid" : "none";
      });
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
