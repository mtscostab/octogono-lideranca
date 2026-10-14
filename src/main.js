import '@fontsource/montserrat/300.css';
import '@fontsource/montserrat/400.css';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/800.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/secoes.css';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { PASSOS_OCTOGONO, FORMATOS, JORNADA, MINIMO_LIDERES, formatarBRL, formatarNumero, formatarMensal } from './js/dados.js';

gsap.registerPlugin(ScrollTrigger);

const html = document.documentElement;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduzido = matchMedia('(prefers-reduced-motion: reduce)').matches;
const ponteiroFino = matchMedia('(pointer: fine)').matches;

html.classList.add('js');

// detecta WebGL sem carregar o three.js (ele só vem quando a seção do octógono se aproxima)
function suportaWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch { return false; }
}
// Cenas presas ao scroll só com movimento liberado e altura útil; senão a página vira leitura linear.
const movimento = !reduzido && window.innerHeight >= 520;
if (movimento) html.classList.add('movimento');

/* ── rolagem fluida ─────────────────────────────────────────────────────── */
let lenis = null;
if (movimento) {
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
const irPara = (alvo, opts = {}) => {
  if (lenis) lenis.scrollTo(alvo, { duration: 1.4, ...opts });
  else {
    const y = typeof alvo === 'number' ? alvo : alvo.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: y, behavior: reduzido ? 'auto' : 'smooth' });
  }
};

/* ── personalização: ?empresa=Nome ──────────────────────────────────────── */
const empresa = new URLSearchParams(location.search).get('empresa')?.trim();
if (empresa) {
  $$('[data-empresa]').forEach((el) => { el.textContent = empresa; });
  const cta = $('[data-cta]');
  if (cta) cta.href = cta.href.replace(/subject=([^&]*)/, (_, s) => `subject=${s}%20%C2%B7%20${encodeURIComponent(empresa)}`);
  document.title = `Proposta para ${empresa} · Minotauro Champion by Design`;
}

/* ── texto dividido em palavras (para revelar com máscara) ─────────────── */
function dividirPalavras(el, classe = 'palavra', interno = true) {
  el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
  const andar = (no) => {
    [...no.childNodes].forEach((filho) => {
      if (filho.nodeType === 3) {
        const frag = document.createDocumentFragment();
        filho.textContent.split(/(\s+)/).forEach((parte) => {
          if (!parte) return;
          if (/^\s+$/.test(parte)) { frag.appendChild(document.createTextNode(' ')); return; }
          const s = document.createElement('span');
          s.className = classe;
          s.setAttribute('aria-hidden', 'true');
          if (interno) { const i = document.createElement('span'); i.textContent = parte; s.appendChild(i); }
          else s.textContent = parte;
          frag.appendChild(s);
        });
        filho.replaceWith(frag);
      } else if (filho.nodeType === 1 && filho.tagName !== 'BR') andar(filho);
    });
  };
  andar(el);
}

/* ── contador numérico ──────────────────────────────────────────────────── */
function contar(el, ate, { de = 0, duracao = 1.6, formato = (v) => formatarNumero(Math.round(v)) } = {}) {
  if (!movimento) { el.textContent = formato(ate); return; }
  const o = { v: de };
  el.textContent = formato(de);
  gsap.to(o, { v: ate, duration: duracao, ease: 'power3.out', onUpdate: () => { el.textContent = formato(o.v); } });
}

/* ═══ abertura ════════════════════════════════════════════════════════════ */
function carregarImagem(src) {
  return new Promise((ok) => { const i = new Image(); i.onload = i.onerror = () => ok(); i.src = src; });
}
async function abertura() {
  const barra = $('.abertura__barra');
  const num = $('[data-abertura-num]');
  const heroImg = $('.capa__foto img');
  const src = heroImg.currentSrc || heroImg.src;
  const tarefas = [document.fonts.ready, carregarImagem(src), new Promise((ok) => setTimeout(ok, reduzido ? 0 : 900))];
  let feitas = 0;
  const marca = () => {
    feitas++;
    const p = feitas / tarefas.length;
    barra?.style.setProperty('--carga', p);
    if (num) num.textContent = String(Math.round(p * 100)).padStart(2, '0');
  };
  tarefas.forEach((t) => t.then(marca));
  await Promise.race([Promise.all(tarefas), new Promise((ok) => setTimeout(ok, 4000))]);
  document.body.classList.remove('carregando');

  if (!movimento) { $('.abertura').remove(); return; }
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.to('.abertura', { autoAlpha: 0, duration: 0.8, ease: 'power2.inOut', onComplete: () => $('.abertura')?.remove() })
    .fromTo('.capa__foto img', { autoAlpha: 0, scale: 1.08 }, { autoAlpha: 1, scale: 1, duration: 2.2, ease: 'power2.out' }, 0.1)
    .fromTo('.capa__octo polygon', { strokeDasharray: (i, el) => el.getTotalLength(), strokeDashoffset: (i, el) => el.getTotalLength() },
      { strokeDashoffset: 0, duration: 2.4, stagger: 0.25, ease: 'power2.inOut' }, 0.4)
    .fromTo('.capa__titulo .linha > span', { yPercent: 110 }, { yPercent: 0, duration: 1.4, stagger: 0.12 }, 0.7)
    .fromTo('[data-capa-item]', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.1 }, 1.0)
    .fromTo('.topo', { yPercent: -100 }, { yPercent: 0, duration: 1 }, 1.1);
}

/* ═══ navegação ═══════════════════════════════════════════════════════════ */
function navegacao() {
  const secoes = $$('main > .secao');
  const links = $$('.indice a');
  const num = $('[data-secao-num]');
  const nome = $('[data-secao-nome]');
  const menu = $('[data-menu]');
  const indice = $('#indice');

  const marcar = (i) => {
    const s = secoes[i];
    if (!s) return;
    num.textContent = String(i + 1).padStart(2, '0');
    nome.textContent = s.dataset.nome;
    links.forEach((a, j) => a.setAttribute('aria-current', j === i ? 'true' : 'false'));
  };
  secoes.forEach((s, i) => {
    ScrollTrigger.create({ trigger: s, start: 'top 55%', end: 'bottom 55%', onToggle: (st) => st.isActive && marcar(i) });
  });
  marcar(0);

  const barra = $('.progresso');
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (st) => barra.style.setProperty('--p', st.progress.toFixed(4)) });

  const fecharMenu = () => {
    menu.setAttribute('aria-expanded', 'false');
    indice.classList.remove('aberto');
    lenis?.start();
  };
  menu.addEventListener('click', () => {
    const abrir = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(abrir));
    indice.classList.toggle('aberto', abrir);
    if (abrir) { lenis?.stop(); indice.querySelector('a')?.focus(); } else lenis?.start();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { fecharMenu(); menu.focus(); } });

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const alvo = document.querySelector(a.getAttribute('href'));
    if (!alvo) return;
    e.preventDefault();
    if (indice.classList.contains('aberto')) fecharMenu();
    irPara(alvo, { duration: 1.6 });
    history.replaceState(null, '', a.getAttribute('href'));
  });
}

/* ═══ transições, revelações e parallax ═══════════════════════════════════ */
function movimentoGeral() {
  // títulos com máscara por palavra
  $$('[data-dividir]').forEach((el) => {
    dividirPalavras(el);
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: () => gsap.fromTo(el.querySelectorAll('.palavra > span'), { y: 0, yPercent: 105 }, { y: 0, yPercent: 0, duration: 1.1, stagger: 0.035, ease: 'expo.out' }),
    });
  });

  // entradas únicas
  ScrollTrigger.batch('[data-revelar]', {
    start: 'top 90%', once: true,
    onEnter: (lote) => gsap.to(lote, { opacity: 1, y: 0, duration: 1, stagger: 0.08, ease: 'power3.out', overwrite: true }),
  });
  // failsafe: nada pode ficar invisível se um gatilho não disparar
  setTimeout(() => {
    $$('[data-revelar]').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0 && getComputedStyle(el).opacity === '0') gsap.to(el, { opacity: 1, y: 0, duration: 0.6 });
    });
  }, 3000);

  // a próxima seção entra como um quadro que se abre; a anterior escurece ao sair
  const secoes = $$('main > .secao');
  secoes.forEach((s, i) => {
    if (i > 0) {
      s.setAttribute('data-moldura', '');
      gsap.fromTo(s, { '--clip-x': '4.5%', '--clip-r': '28px' }, {
        '--clip-x': '0%', '--clip-r': '0px', ease: 'none',
        scrollTrigger: { trigger: s, start: 'top bottom', end: 'top 15%', scrub: true },
      });
    }
    if (i > 0 && i < secoes.length - 1) {
      gsap.fromTo(s, { '--escurecer': 0 }, {
        '--escurecer': 0.6, ease: 'none',
        scrollTrigger: { trigger: s, start: 'bottom 55%', end: 'bottom top', scrub: true },
      });
    }
  });

  // parallax de camadas
  $$('[data-parallax]').forEach((el) => {
    const v = parseFloat(el.dataset.parallax) || 10;
    gsap.fromTo(el, { yPercent: -v / 2 }, {
      yPercent: v / 2, ease: 'none',
      scrollTrigger: { trigger: el.closest('.secao'), start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
}

/* ═══ 01 · capa ═══════════════════════════════════════════════════════════ */
function capa() {
  if (!movimento) return;
  // saída: a foto desce mais devagar que o texto (parallax). Sem escurecer e sem filtro.
  gsap.timeline({ scrollTrigger: { trigger: '#capa', start: 'top top', end: 'bottom top', scrub: true } })
    .to('.capa__foto', { yPercent: 14, ease: 'none' }, 0)
    .to('.capa__conteudo', { y: -80, ease: 'none' }, 0)
    .to('.capa__octo', { rotate: 22.5, scale: 1.2, autoAlpha: 0, ease: 'none' }, 0);
}

/* ═══ 02 · a história ═════════════════════════════════════════════════════ */
function historia() {
  const s = $('#historia');
  if (!movimento) return;
  const [p0, p1, p2] = $$('.passo', s);
  const marcas = $$('.marcador li', s);
  const foto = $('.historia__foto', s);
  marcas[0]?.classList.add('ativo');
  const mm = gsap.matchMedia();
  mm.add({ emPe: '(max-aspect-ratio: 99/100)', paisagem: '(min-aspect-ratio: 1/1)' }, (ctx) => {
    gsap.set(p0, { autoAlpha: 1 });
    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      scrollTrigger: {
        trigger: s, start: 'top top', end: 'bottom bottom', scrub: 0.6,
        onUpdate: (st) => {
          const k = st.progress < 0.33 ? 0 : st.progress < 0.66 ? 1 : 2;
          marcas.forEach((m, i) => m.classList.toggle('ativo', i === k));
        },
      },
    });
    tl.to(s, { '--luz': 1, duration: 3, ease: 'none' }, 0);
    if (ctx.conditions.emPe) {
      // o retrato desce à medida que o texto cresce: o rosto fica sempre abaixo das linhas
      gsap.set(foto, { yPercent: 8 });
      tl.fromTo(foto, { yPercent: 8 }, { yPercent: 18, duration: 0.5 }, 0.9)
        .to(foto, { yPercent: 46, duration: 0.5 }, 1.95);
    } else {
      tl.fromTo(foto, { scale: 1.06 }, { scale: 1, duration: 3, ease: 'none', transformOrigin: '50% 100%' }, 0);
    }
    tl.fromTo(p0.children, { y: 0 }, { y: -30, duration: 0.6, stagger: 0.03 }, 0.55)
      .to(p0, { autoAlpha: 0, duration: 0.35 }, 0.75)
      .fromTo(p1, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 0.95)
      .fromTo(p1.querySelector('.nunca'), { scale: 0.8, autoAlpha: 0, transformOrigin: '0% 60%' }, { scale: 1, autoAlpha: 1, duration: 0.6, ease: 'expo.out' }, 0.95)
      .fromTo(p1.querySelector('.texto'), { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5 }, 1.2)
      .to(p1, { autoAlpha: 0, y: -30, duration: 0.35 }, 1.9)
      .fromTo(p2, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, 2.1)
      .fromTo(p2.children, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.08 }, 2.1)
      .to({}, { duration: 0.3 });
  });
}

/* ═══ 03 · quitéria ═══════════════════════════════════════════════════════ */
function quiteria() {
  const metricas = $$('.metrica');
  const fmt = (m) => (v) => `${m.dataset.prefixo || ''}${formatarNumero(Math.round(v))}${m.dataset.sufixo || ''}`;
  metricas.forEach((m) => {
    m.style.setProperty('--base', `${(m.dataset.de / m.dataset.para) * 100}%`);
    if (movimento) { m.style.setProperty('--cresce', m.dataset.de / m.dataset.para); $('[data-contador]', m).textContent = fmt(m)(+m.dataset.de); }
  });
  if (!movimento) return;
  ScrollTrigger.create({
    trigger: '[data-trajetoria]', start: 'top 80%', once: true,
    onEnter: () => metricas.forEach((m, i) => {
      gsap.to(m, { '--cresce': 1, duration: 2, delay: 0.25 + i * 0.2, ease: 'expo.out' });
      gsap.delayedCall(0.25 + i * 0.2, () => contar($('[data-contador]', m), +m.dataset.para, { de: +m.dataset.de, duracao: 2, formato: fmt(m) }));
    }),
  });
  gsap.from('.metrica', { y: 30, autoAlpha: 0, stagger: 0.12, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '[data-trajetoria]', start: 'top 85%', once: true } });
}

/* ═══ 04 · manifesto ══════════════════════════════════════════════════════ */
function manifesto() {
  const s = $('#manifesto');
  const frase = $('[data-palavras]', s);
  dividirPalavras(frase, 'w', false);
  if (!movimento) return;
  const palavras = $$('.w', frase);
  gsap.set(palavras, { opacity: 0.14 });
  gsap.timeline({ scrollTrigger: { trigger: s, start: 'top top', end: 'bottom bottom', scrub: 0.5 } })
    .fromTo('.manifesto__foto', { scale: 1.04 }, { scale: 1.16, filter: 'brightness(.35) grayscale(.4)', duration: 1, ease: 'none' }, 0.25)
    .to('.manifesto__a', { autoAlpha: 0, y: -50, duration: 0.25 }, 0.25)
    .fromTo('.manifesto__b', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15 }, 0.42)
    .fromTo('.manifesto__b .rotulo', { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.1 }, 0.42)
    .to(palavras, { opacity: 1, stagger: 0.012, duration: 0.05, ease: 'none' }, 0.48)
    .fromTo('.manifesto__b .pilula', { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.04, duration: 0.1, ease: 'power2.out' }, '>-0.04');
}

/* ═══ 05 · a sua luta ═════════════════════════════════════════════════════ */
function luta() {
  const cartoes = $$('.desafio');
  cartoes.forEach((b) => b.addEventListener('click', () => {
    b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));
  }));
  if (!movimento) return;
  gsap.from('.desafio', {
    y: 60, autoAlpha: 0, rotateX: -12, transformPerspective: 900, stagger: 0.12, duration: 1.1, ease: 'expo.out',
    scrollTrigger: { trigger: '.desafios', start: 'top 85%', once: true },
    onComplete: () => {
      // um aceno no primeiro cartão para mostrar que ele vira
      const f = $('.desafio .desafio__frente');
      if (f && cartoes[0].getAttribute('aria-pressed') !== 'true') gsap.fromTo(f, { rotateY: 0 }, { rotateY: -24, duration: 0.45, yoyo: true, repeat: 1, ease: 'power2.inOut', clearProps: 'transform' });
    },
  });
}

/* ═══ 06 · octógono ═══════════════════════════════════════════════════════ */
function octogono() {
  const s = $('#octogono');
  const card = $('[data-octo-card]', s);
  const navBtns = $$('.octo-nav button', s);
  const campo = (n) => $(`[data-octo-${n}]`, s);
  let passoAtual = -1;

  const mostrar = (i) => {
    if (i === passoAtual) return;
    passoAtual = i;
    navBtns.forEach((b) => b.setAttribute('aria-current', String(+b.dataset.irPasso === i)));
    if (i === 0) { s.dataset.modo = 'intro'; return; }
    s.dataset.modo = 'card';
    const d = PASSOS_OCTOGONO[i];
    const formato = campo('formato');
    if (d.tipo === 'corner') {
      campo('kick').textContent = 'A camada emocional';
      campo('num').textContent = '';
      campo('de').textContent = '';
      campo('nome').textContent = d.nome;
      campo('tema').textContent = d.ringue;
      campo('marco-lbl').textContent = d.tema;
      campo('marco').textContent = d.texto;
      formato.textContent = 'Em todos os Rounds';
      formato.classList.remove('premium');
    } else {
      campo('kick').textContent = 'Round';
      campo('num').textContent = d.num;
      campo('de').textContent = d.tipo === 'encarada' ? ' · Kick-off' : ' / 08';
      campo('nome').textContent = d.nome;
      campo('tema').textContent = d.tema;
      campo('marco-lbl').textContent = d.tipo === 'encarada' ? 'Abertura da jornada' : 'Marco do Round';
      campo('marco').textContent = d.marco;
      const premium = d.formato === 'premium';
      formato.textContent = premium ? 'Só no Premium · 8 meses' : 'Nos dois formatos';
      formato.classList.toggle('premium', premium);
    }
    card.classList.remove('troca'); void card.offsetWidth; card.classList.add('troca');
  };

  const usar3D = movimento && suportaWebGL();
  if (!usar3D) {
    s.classList.add('plano');
    s.dataset.modo = 'plano';
    mostrar(1);
    s.dataset.modo = 'plano';
    navBtns.forEach((b) => b.addEventListener('click', () => { mostrar(+b.dataset.irPasso); s.dataset.modo = 'plano'; }));
    return;
  }

  s.dataset.modo = 'intro';
  navBtns[0].parentElement.querySelectorAll('button').forEach((b) => b.setAttribute('aria-current', 'false'));
  let oct = null;
  let progresso = 0;
  const TOTAL = PASSOS_OCTOGONO.length - 1;
  const irPasso = (i) => {
    const inicio = s.offsetTop;
    const curso = s.offsetHeight - innerHeight;
    irPara(inicio + (i / TOTAL) * curso + 2, { duration: 1.2 });
  };
  navBtns.forEach((b) => b.addEventListener('click', () => irPasso(+b.dataset.irPasso)));

  ScrollTrigger.create({
    trigger: s, start: 'top top', end: 'bottom bottom',
    onUpdate: (st) => {
      progresso = st.progress * TOTAL;
      oct?.setProgresso(progresso);
      mostrar(Math.round(progresso));
    },
  });

  // carrega o three.js só quando a seção se aproxima
  const io = new IntersectionObserver((entradas) => {
    entradas.forEach(async (e) => {
      if (e.isIntersecting) {
        if (!oct) {
          const { criarOctogono } = await import('./js/octogono.js');
          oct = criarOctogono({ canvas: $('.octogono__canvas', s), rotulos: $('.octogono__rotulos', s), aoClicar: irPasso, movimentoReduzido: reduzido });
          oct.setProgresso(progresso);
        }
        oct.iniciar();
      } else oct?.parar();
    });
  }, { rootMargin: '50% 0px' });
  io.observe(s);
}

/* ═══ 07 · como funciona ══════════════════════════════════════════════════ */
function comoFunciona() {
  const alt = $('[data-alternador]');
  const pares = $('[data-pares]');
  $$('button', alt).forEach((b) => b.addEventListener('click', () => {
    const modo = b.dataset.modo;
    alt.dataset.em = modo;
    $$('button', alt).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    pares.dataset.modoAtual = modo;
  }));
  if (!movimento) return;
  gsap.from('.par', { y: 50, autoAlpha: 0, stagger: 0.1, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: pares, start: 'top 85%', once: true } });
  gsap.from('.medimos__lista li', { y: 30, autoAlpha: 0, stagger: 0.1, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.medimos', start: 'top 85%', once: true } });
}

/* ═══ 08 · plataforma, central e relatório ════════════════════════════════ */
function plataforma() {
  const s = $('#plataforma');
  const trilha = $('[data-trilha]', s);
  const paineis = $$('.painel', s);
  const guia = $$('.trilha__guia span', s);
  const chat = $('[data-chat]', s);
  const papel = $('[data-relatorio]', s);

  // simulação de conversa: as falas chegam em sequência, com o "digitando" antes da IA
  const itens = $$('.balao, .devolutiva', chat);
  let timers = [];
  let chatRodou = false;
  if (movimento) chat.dataset.estado = 'pronto';
  const rodarChat = () => {
    if (!movimento) return;
    chatRodou = true;
    timers.forEach(clearTimeout); timers = [];
    itens.forEach((it) => it.classList.remove('visivel'));
    const corpo = $('.chat__corpo', chat);
    const digitando = $('.digitando', chat);
    const passos = [[0, 300, false], [1, 1700, true], [2, 3300, false], [3, 5000, true]];
    passos.forEach(([i, t, digita]) => {
      if (digita) timers.push(setTimeout(() => { corpo.insertBefore(digitando, itens[i]); chat.classList.add('digitando-on'); }, t - 1000));
      timers.push(setTimeout(() => { chat.classList.remove('digitando-on'); itens[i].classList.add('visivel'); }, t));
    });
  };
  $('[data-chat-repetir]', chat).addEventListener('click', rodarChat);

  let papelRodou = false;
  const rodarRelatorio = () => {
    if (papelRodou) return;
    papelRodou = true;
    const curva = $('.curva', papel);
    if (movimento) {
      const len = curva.getTotalLength();
      gsap.fromTo(curva, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut', delay: 0.3 });
      gsap.from('.ponto--fim', { scale: 0, transformOrigin: 'center', duration: 0.5, delay: 1.9, ease: 'back.out(3)' });
      gsap.fromTo(papel, { rotate: 4, y: 60, autoAlpha: 0 }, { rotate: -1.2, y: 0, autoAlpha: 1, duration: 1.2, ease: 'expo.out' });
    }
    const minutos = (m) => (m >= 60 ? `${Math.floor(m / 60)}h${String(Math.round(m % 60)).padStart(2, '0')}` : `${Math.round(m)} min`);
    contar($('[data-kpi-30]', papel), 45, { de: 255, duracao: 2.2, formato: minutos });
    contar($('[data-kpi-var]', papel), 82, { de: 0, duracao: 2.2, formato: (v) => `−${Math.round(v)}%` });
  };

  const contadores = (painel) => $$('[data-contar]', painel).forEach((el) => {
    if (el.dataset.feito) return;
    el.dataset.feito = '1';
    contar(el, +el.dataset.contar, { duracao: 1.8 });
  });

  const ativar = (i) => {
    guia.forEach((g, j) => g.classList.toggle('ativo', j === i));
    contadores(paineis[i]);
    if (i === 1 && !chatRodou) rodarChat();
    if (i === 2) rodarRelatorio();
  };

  const mm = gsap.matchMedia();
  mm.add({ horizontal: '(min-width: 64rem) and (min-height: 40rem)', vertical: '(max-width: 63.99rem), (max-height: 39.99rem)' }, (ctx) => {
    if (ctx.conditions.horizontal && movimento) {
      let atual = -1;
      gsap.to(trilha, {
        x: () => -(trilha.scrollWidth - innerWidth), ease: 'none',
        scrollTrigger: {
          trigger: s, start: 'top top', end: 'bottom bottom', scrub: 0.8, invalidateOnRefresh: true,
          onUpdate: (st) => {
            const i = Math.min(2, Math.floor(st.progress * 3 + 0.35));
            if (i !== atual) { atual = i; ativar(i); }
          },
        },
      });
      // capas em leque: cada uma com sua própria profundidade
      $$('.capas li', s).forEach((li, j) => {
        gsap.fromTo(li, { y: 60 + j * 14, autoAlpha: 0 }, { y: j % 2 ? 19 : 0, autoAlpha: 1, duration: 1, delay: 0.1 * j, ease: 'expo.out', scrollTrigger: { trigger: s, start: 'top 40%', once: true } });
      });
    } else {
      paineis.forEach((p, i) => ScrollTrigger.create({ trigger: p, start: 'top 60%', once: true, onEnter: () => ativar(i) }));
    }
  });
}

/* ═══ 09 · formatos e investimento ════════════════════════════════════════ */
function investimento() {
  const raiz = $('#investimento');
  const seletor = $('[data-formato]', raiz);
  const jornada = $('[data-jornada]', raiz);
  const preco = $('[data-preco]', raiz);
  const input = $('[data-lideres-input]', raiz);
  const aviso = $('[data-lideres-aviso]', raiz);
  const estado = { f: 'oito', n: MINIMO_LIDERES };
  const valorEl = $('[data-preco-valor]', preco);
  const precoAnim = { v: FORMATOS.oito.total };
  const totalAnim = { v: FORMATOS.oito.total * MINIMO_LIDERES };

  // a jornada, desenhada uma vez; os meses se renumeram por formato
  JORNADA.forEach((j) => {
    const li = document.createElement('li');
    li.dataset.id = j.id;
    if (j.so) li.classList.add('premium');
    if (j.bonus) li.classList.add('bonus');
    li.innerHTML = `<div><div class="item"><span class="mes"></span><span class="round">${j.round}${j.so ? '<em>Premium</em>' : ''}</span><span class="marco">${j.marco}</span></div></div>`;
    jornada.appendChild(li);
  });

  const meses = (f) => {
    let m = 0;
    return JORNADA.map((j) => {
      if (j.so && f === 'seis') return null;
      if (j.kickoff) return 'Kick-off';
      m += 1;
      return `Mês ${m}`;
    });
  };

  let primeira = true;
  const render = () => {
    const F = FORMATOS[estado.f];
    const premium = estado.f === 'oito';
    seletor.dataset.fAtual = estado.f;
    $$('button', seletor).forEach((b) => b.setAttribute('aria-checked', String(b.dataset.f === estado.f)));

    const ms = meses(estado.f);
    $$('li', jornada).forEach((li, i) => {
      li.classList.toggle('fora', ms[i] === null);
      li.setAttribute('aria-hidden', String(ms[i] === null));
      if (ms[i]) $('.mes', li).textContent = ms[i];
    });

    $$('[data-l]', raiz).forEach((dd) => {
      const novo = F.linhas[dd.dataset.l];
      if (dd.textContent !== novo) {
        dd.textContent = novo;
        if (!primeira) { dd.classList.remove('mudou'); void dd.offsetWidth; dd.classList.add('mudou'); }
      }
    });

    preco.dataset.premium = String(premium);
    $('[data-preco-nome]', preco).textContent = F.nome;
    $('[data-preco-mes]', preco).textContent = `R$ ${formatarMensal(F.total / F.meses)} por mês`;
    $('[data-turma-n]', preco).textContent = estado.n;
    const total = F.total * estado.n;
    const totalEl = $('[data-turma-total]', preco);
    if (movimento && !primeira) {
      gsap.to(precoAnim, { v: F.total, duration: 0.9, ease: 'power3.out', onUpdate: () => { valorEl.textContent = formatarNumero(Math.round(precoAnim.v)); } });
      gsap.to(totalAnim, { v: total, duration: 0.7, ease: 'power3.out', onUpdate: () => { totalEl.textContent = formatarBRL(Math.round(totalAnim.v)); } });
    } else {
      precoAnim.v = F.total; totalAnim.v = total;
      valorEl.textContent = formatarNumero(F.total);
      totalEl.textContent = formatarBRL(total);
    }
    primeira = false;
  };

  $$('button', seletor).forEach((b) => b.addEventListener('click', () => { estado.f = b.dataset.f; render(); }));
  seletor.addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
    e.preventDefault();
    estado.f = estado.f === 'oito' ? 'seis' : 'oito';
    render();
    $(`button[data-f="${estado.f}"]`, seletor).focus();
  });

  const definirLideres = (n, corrigir = true) => {
    const valido = Number.isFinite(n) && n >= MINIMO_LIDERES;
    aviso.classList.toggle('aviso', !valido);
    aviso.textContent = valido ? 'Turma fechada, a partir de 12 líderes.' : 'A turma começa em 12 líderes.';
    estado.n = valido ? Math.min(n, 200) : MINIMO_LIDERES;
    if (corrigir || valido) input.value = estado.n;
    render();
  };
  $$('[data-lideres]', preco).forEach((b) => b.addEventListener('click', () => definirLideres(estado.n + +b.dataset.lideres)));
  input.addEventListener('input', () => { const n = parseInt(input.value, 10); if (n >= MINIMO_LIDERES) definirLideres(n, false); });
  input.addEventListener('change', () => definirLideres(parseInt(input.value, 10)));

  render();
}

/* ═══ 10 · próximo passo ══════════════════════════════════════════════════ */
function proximoPasso() {
  const s = $('#proximo-passo');
  ScrollTrigger.create({
    trigger: '.legado', start: 'top 85%', once: true,
    onEnter: () => $$('[data-contar]', s).forEach((el) => contar(el, +el.dataset.contar, { duracao: 1.8 })),
  });
  // botão magnético
  const botao = $('[data-cta]', s);
  if (movimento && ponteiroFino && botao) {
    const x = gsap.quickTo(botao, 'x', { duration: 0.6, ease: 'power3.out' });
    const y = gsap.quickTo(botao, 'y', { duration: 0.6, ease: 'power3.out' });
    botao.addEventListener('pointermove', (e) => {
      const r = botao.getBoundingClientRect();
      x((e.clientX - r.left - r.width / 2) * 0.25);
      y((e.clientY - r.top - r.height / 2) * 0.35);
    });
    botao.addEventListener('pointerleave', () => { x(0); y(0); });
  }
}

/* ═══ início ══════════════════════════════════════════════════════════════ */
function iniciar() {
  try {
    navegacao();
    if (movimento) movimentoGeral();
    else $$('[data-dividir]').forEach((el) => el.classList.add('revelado'));
    capa();
    historia();
    quiteria();
    manifesto();
    luta();
    octogono();
    comoFunciona();
    plataforma();
    investimento();
    proximoPasso();
  } catch (erro) {
    // qualquer falha de animação devolve a página à leitura linear, nunca a uma tela em branco
    console.error(erro);
    html.classList.remove('movimento');
    gsap.set('[data-revelar], .passo, .manifesto__a, .manifesto__b', { clearProps: 'all' });
  }
  abertura();
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

iniciar();
