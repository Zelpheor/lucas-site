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

      // Fecha todos os itens antes de abrir o clicado (accordion clássico)
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

  let animacaoEmAndamento = null;

  function scrollSuaveAte(alvo) {
    if (animacaoEmAndamento) {
      cancelAnimationFrame(animacaoEmAndamento);
    }

    const max = janela.scrollWidth - janela.clientWidth;
    const destino = Math.max(0, Math.min(alvo, max));
    const inicio = janela.scrollLeft;
    const distancia = destino - inicio;

    if (Math.abs(distancia) < 1) return;

    const duracao = 600;
    const tempoInicio = performance.now();

    function passo(agora) {
      const decorrido = agora - tempoInicio;
      const progresso = Math.min(decorrido / duracao, 1);
      const facilitado = 1 - Math.pow(1 - progresso, 3);

      janela.scrollLeft = inicio + distancia * facilitado;

      if (progresso < 1) {
        animacaoEmAndamento = requestAnimationFrame(passo);
      } else {
        animacaoEmAndamento = null;
      }
    }

    animacaoEmAndamento = requestAnimationFrame(passo);
  }

  function calcularDeslocamento() {
    const card = janela.querySelector('.estudo-card');
    const trilho = janela.querySelector('.estudos__trilho');

    if (!card || !trilho) {
      return janela.clientWidth * 0.8;
    }

    const estilos = window.getComputedStyle(trilho);
    const gap = parseFloat(estilos.columnGap || estilos.gap) || 0;

    // Avança exatamente um certificado por clique.
    return card.getBoundingClientRect().width + gap;
  }

  const VELOCIDADE_PX_S = 45;
  const PAUSA_APOS_INTERACAO_MS = 3000;

  let autoplayLigado = true;
  let ultimoFrame = null;
  let retomada = null;

  function cicloAutoplay(agora) {
    if (ultimoFrame === null) {
      ultimoFrame = agora;
    }

    const deltaSegundos = (agora - ultimoFrame) / 1000;
    ultimoFrame = agora;

    if (autoplayLigado && !animacaoEmAndamento) {
      const max = janela.scrollWidth - janela.clientWidth;
      let novoScroll = janela.scrollLeft + VELOCIDADE_PX_S * deltaSegundos;

      if (novoScroll >= max - 0.5) {
        novoScroll = 0;
      }

      janela.scrollLeft = novoScroll;
    }

    requestAnimationFrame(cicloAutoplay);
  }

  function iniciarAutoplay() {
    autoplayLigado = true;
    ultimoFrame = null;

    // O movimento é controlado exclusivamente pelo JS.
    janela.style.scrollBehavior = 'auto';
    janela.style.scrollSnapType = 'none';
  }

  function pausarAutoplay() {
    autoplayLigado = false;
    ultimoFrame = null;

    if (retomada) {
      clearTimeout(retomada);
      retomada = null;
    }

    // Mantém o CSS de rolagem neutro. A animação dos botões
    // continua sendo feita pelo requestAnimationFrame.
    janela.style.scrollBehavior = 'auto';
    janela.style.scrollSnapType = 'none';
  }

  function agendarRetomada() {
    if (retomada) {
      clearTimeout(retomada);
    }

    retomada = setTimeout(iniciarAutoplay, PAUSA_APOS_INTERACAO_MS);
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

  janela.addEventListener('mouseenter', pausarAutoplay);
  janela.addEventListener('mouseleave', agendarRetomada);
  janela.addEventListener('touchstart', pausarAutoplay, { passive: true });
  janela.addEventListener('touchend', agendarRetomada);
  janela.addEventListener('focusin', pausarAutoplay);
  janela.addEventListener('focusout', agendarRetomada);

  iniciarAutoplay();
  requestAnimationFrame(cicloAutoplay);
}
