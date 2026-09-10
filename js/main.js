// ==========================================================================
// Lucas Psicólogo — main.js
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  atualizarAnoRodape();
  configurarMenuMobile();
  configurarAccordionFaq();
  configurarLinhaContinua();
  configurarMenuAtivo();
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
