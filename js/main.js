// ==========================================================================
// Lucas Psicólogo — main.js
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  atualizarAnoRodape();
  configurarMenuMobile();
  configurarAccordionFaq();
  configurarLinhaContinua();
  configurarMenuAtivo();
  configurarCarrosselEstudos();
});

// ---------- Ano automático no rodapé ----------
function atualizarAnoRodape() {
  const anoEl = document.getElementById('anoAtual');
  if (anoEl) {
    anoEl.textContent = new Date().getFullYear();
  }
}

// ---------- Menu mobile (hamburger) ----------
function configurarMenuMobile() {
  const botao = document.getElementById('menuToggle');
  const menu = document.getElementById('menuPrincipal');
  if (!botao || !menu) return;

  botao.addEventListener('click', () => {
    const aberto = menu.classList.toggle('aberto');
    botao.setAttribute('aria-expanded', String(aberto));
    botao.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
  });

  // Fecha o menu ao clicar em um link (útil no mobile)
  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('aberto');
      botao.setAttribute('aria-expanded', 'false');
      botao.setAttribute('aria-label', 'Abrir menu');
    });
  });
}

// ---------- Accordion de Dúvidas Frequentes ----------
function configurarAccordionFaq() {
  const perguntas = document.querySelectorAll('.accordion__pergunta');

  perguntas.forEach((botao) => {
    const resposta = botao.parentElement.nextElementSibling;

    botao.addEventListener('click', () => {
      const jaAberto = botao.getAttribute('aria-expanded') === 'true';

      perguntas.forEach((outroBotao) => {
        outroBotao.setAttribute('aria-expanded', 'false');
        const outraResposta = outroBotao.parentElement.nextElementSibling;
        if (outraResposta) outraResposta.style.maxHeight = null;
      });

      if (!jaAberto) {
        botao.setAttribute('aria-expanded', 'true');
        if (resposta) resposta.style.maxHeight = resposta.scrollHeight + 'px';
      }
    });
  });
}

// ---------- Linha gráfica contínua (progresso de leitura) ----------
function configurarLinhaContinua() {
  const progressoDesktop = document.getElementById('linhaProgresso');
  const progressoMobile = document.getElementById('progressoMobile');
  if (!progressoDesktop && !progressoMobile) return;

  const atualizarProgresso = () => {
    const alturaTotal = document.documentElement.scrollHeight - window.innerHeight;
    const scrollAtual = window.scrollY;
    const fracao = alturaTotal > 0 ? Math.min(scrollAtual / alturaTotal, 1) : 0;

    if (progressoDesktop) {
      progressoDesktop.style.transform = `scaleY(${fracao})`;
    }
    if (progressoMobile) {
      progressoMobile.style.width = `${fracao * 100}%`;
    }
  };

  atualizarProgresso();
  window.addEventListener('scroll', atualizarProgresso, { passive: true });
  window.addEventListener('resize', atualizarProgresso);
}

// ---------- Destaca o link do menu correspondente à seção visível ----------
function configurarMenuAtivo() {
  const secoes = document.querySelectorAll('main section[id]');
  const links = document.querySelectorAll('.menu-principal a');
  if (!secoes.length || !links.length) return;

  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          const id = entrada.target.getAttribute('id');
          links.forEach((link) => {
            link.classList.toggle('ativo', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );

  secoes.forEach((secao) => observador.observe(secao));
}




/* ---------- Carrossel de formação continuada ---------- */
function configurarCarrosselEstudos() {
  const janela = document.getElementById('estudosJanela');
  const botoes = document.querySelectorAll('[data-estudos-direcao]');

  if (!janela || !botoes.length) return;

  const VELOCIDADE_PX_S = 67;
  const PAUSA_APOS_INTERACAO_MS = 2500;
  const DURACAO_SETAS_MS = 600;

  let frameId = null;
  let ultimoFrame = null;
  let animacaoEmAndamento = false;
  let retomada = null;
  let autoplayLigado = true;
  let posicaoAutoplay = janela.scrollLeft;
  let ponteiroArrastando = false;
  let inicioArrasteX = 0;
  let scrollInicial = 0;
  let houveArraste = false;

  janela.style.scrollBehavior = 'auto';
  janela.style.scrollSnapType = 'none';

  function obterLimite() {
    return Math.max(0, janela.scrollWidth - janela.clientWidth);
  }

  function cancelarRetomada() {
    if (retomada !== null) {
      clearTimeout(retomada);
      retomada = null;
    }
  }

  function pararFrame() {
    if (frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }

    ultimoFrame = null;
  }

  function pausarAutoplay() {
    autoplayLigado = false;
    pararFrame();
    posicaoAutoplay = janela.scrollLeft;
    cancelarRetomada();
  }

  function agendarRetomada() {
    cancelarRetomada();

    retomada = setTimeout(() => {
      retomada = null;
      autoplayLigado = true;
      ultimoFrame = null;
      iniciarLoop();
    }, PAUSA_APOS_INTERACAO_MS);
  }

  function calcularDeslocamento() {
    const card = janela.querySelector('.estudo-card');
    const trilho = janela.querySelector('.estudos__trilho');

    if (!card || !trilho) {
      return janela.clientWidth * 0.8;
    }

    const estilos = getComputedStyle(trilho);
    const gap = parseFloat(estilos.columnGap || estilos.gap) || 0;

    return card.getBoundingClientRect().width + gap;
  }

  function scrollSuaveAte(alvo) {
    const limite = obterLimite();
    const destino = Math.max(0, Math.min(alvo, limite));
    const inicio = janela.scrollLeft;
    const distancia = destino - inicio;

    if (Math.abs(distancia) < 1) {
      animacaoEmAndamento = false;
      ultimoFrame = null;
      iniciarLoop();
      return;
    }

    animacaoEmAndamento = true;
    pararFrame();

    const tempoInicio = performance.now();

    function passo(agora) {
      const progresso = Math.min(
        (agora - tempoInicio) / DURACAO_SETAS_MS,
        1
      );

      const facilitado = 1 - Math.pow(1 - progresso, 3);

      janela.scrollLeft = inicio + distancia * facilitado;

      if (progresso < 1) {
        frameId = requestAnimationFrame(passo);
      } else {
        frameId = null;
        animacaoEmAndamento = false;
        ultimoFrame = null;
        iniciarLoop();
      }
    }

    frameId = requestAnimationFrame(passo);
  }


function cicloAutoplay(agora) {
  frameId = null;

  if (!autoplayLigado || animacaoEmAndamento) {
    ultimoFrame = null;
    return;
  }

  if (ultimoFrame === null) {
    ultimoFrame = agora;
    posicaoAutoplay = janela.scrollLeft;
  }

  const delta = Math.min((agora - ultimoFrame) / 1000, 0.1);
  ultimoFrame = agora;

  const limite = obterLimite();

  if (limite > 0) {
    posicaoAutoplay += VELOCIDADE_PX_S * delta;

    if (posicaoAutoplay >= limite) {
      posicaoAutoplay = 0;
    }

    janela.scrollLeft = posicaoAutoplay;
  }

  frameId = requestAnimationFrame(cicloAutoplay);
}

  function iniciarLoop() {
    if (
      frameId !== null ||
      !autoplayLigado ||
      animacaoEmAndamento ||
      document.visibilityState !== 'visible'
    ) {
      return;
    }

    ultimoFrame = null;
    frameId = requestAnimationFrame(cicloAutoplay);
  }

  botoes.forEach((botao) => {
    botao.addEventListener('click', () => {
      const direcao = Number(botao.dataset.estudosDirecao) || 1;

      pausarAutoplay();

      scrollSuaveAte(
        janela.scrollLeft + calcularDeslocamento() * direcao
      );

      agendarRetomada();
    });
  });

  janela.addEventListener('pointerdown', (evento) => {
    if (evento.pointerType === 'mouse' && evento.button !== 0) return;

    ponteiroArrastando = true;
    houveArraste = false;
    inicioArrasteX = evento.clientX;
    scrollInicial = janela.scrollLeft;

    pausarAutoplay();
  });

  janela.addEventListener('pointermove', (evento) => {
    if (!ponteiroArrastando) return;

    const deslocamento = evento.clientX - inicioArrasteX;

    if (Math.abs(deslocamento) > 5) {
      houveArraste = true;
    }

    if (houveArraste) {
      janela.scrollLeft = Math.max(
        0,
        Math.min(scrollInicial - deslocamento, obterLimite())
      );
    }
  });

  function finalizarArraste() {
    if (!ponteiroArrastando) return;

    ponteiroArrastando = false;
    houveArraste = false;
    posicaoAutoplay = janela.scrollLeft;
    agendarRetomada();
  }

  janela.addEventListener('pointerup', finalizarArraste);
  janela.addEventListener('pointercancel', finalizarArraste);

  janela.addEventListener('dragstart', (evento) => {
    if (houveArraste) evento.preventDefault();
  });

  document.addEventListener('visibilitychange', () => {
    ultimoFrame = null;

    if (document.visibilityState === 'visible') {
      iniciarLoop();
    } else {
      pararFrame();
    }
  });

  iniciarLoop();
}