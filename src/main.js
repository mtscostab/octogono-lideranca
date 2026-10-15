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
import { Flip } from 'gsap/Flip';
import Lenis from 'lenis';
import { PASSOS_OCTOGONO, FORMATOS, JORNADA, ENTREGAS, MINIMO_LIDERES, formatarBRL, formatarNumero, formatarMensal } from './js/dados.js';

gsap.registerPlugin(ScrollTrigger, Flip);

const html = document.documentElement;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduzido = matchMedia('(prefers-reduced-motion: reduce)').matches;
const ponteiroFino = matchMedia('(pointer: fine)').matches;
// celular: leitura vertical e centralizada (mesmo corte do CSS, decidido na carga como o movimento)
const celular = matchMedia('(max-width: 47.99rem)').matches;

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
      gsap.fromTo(s, { '--clip-x': celular ? '7%' : '4.5%', '--clip-r': celular ? '32px' : '28px' }, {
        '--clip-x': '0%', '--clip-r': '0px', ease: 'none',
        scrollTrigger: { trigger: s, start: 'top bottom', end: 'top 15%', scrub: true },
      });
    }
    if (i > 0 && i < secoes.length - 1) {
      gsap.fromTo(s, { '--escurecer': 0 }, {
        '--escurecer': celular ? 0.75 : 0.6, ease: 'none',
        scrollTrigger: { trigger: s, start: 'bottom 55%', end: 'bottom top', scrub: true },
      });
    }
  });

  if (celular) transicoesCelular(secoes);

  // parallax de camadas
  $$('[data-parallax]').forEach((el) => {
    const v = parseFloat(el.dataset.parallax) || 10;
    gsap.fromTo(el, { yPercent: -v / 2 }, {
      yPercent: v / 2, ease: 'none',
      scrollTrigger: { trigger: el.closest('.secao'), start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
}

/* No celular a troca de seção vira um empilhar de cartões: o conteúdo que sai recua e afunda,
   o que entra sobe de dentro do quadro que se abre. Tudo preso à rolagem (scrub), sem tempo fixo. */
function transicoesCelular(secoes) {
  const conteudo = (s) => $(':scope > .palco', s) || $(':scope > .envelope', s) || $(':scope > .quiteria__texto', s);
  secoes.forEach((s, i) => {
    const c = conteudo(s);
    if (!c) return;
    if (i > 0) {
      gsap.fromTo(c, { y: 90, autoAlpha: 0.35 }, {
        y: 0, autoAlpha: 1, ease: 'none',
        scrollTrigger: { trigger: s, start: 'top bottom', end: 'top 20%', scrub: true },
      });
    }
    if (i < secoes.length - 1) {
      gsap.fromTo(c, { scale: 1 }, {
        scale: 0.9, transformOrigin: '50% 0%', ease: 'none', immediateRender: false,
        scrollTrigger: { trigger: s, start: 'bottom 70%', end: 'bottom top', scrub: true },
      });
    }
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
      .fromTo(p1.querySelector('.nunca'), { scale: 0.8, autoAlpha: 0, transformOrigin: celular ? '50% 60%' : '0% 60%' }, { scale: 1, autoAlpha: 1, duration: 0.6, ease: 'expo.out' }, 0.95)
      .fromTo(p1.querySelector('.texto'), { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5 }, 1.2)
      .to(p1, { autoAlpha: 0, y: -30, duration: 0.35 }, 1.9)
      .fromTo(p2, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, 2.1)
      .fromTo(p2.children, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.08 }, 2.1)
      .to({}, { duration: 0.3 });
  });
}

/* ═══ 03 · quitéria ═══════════════════════════════════════════════════════ */
function quiteria() {
  const saltos = $$('.salto');
  const fmt = (v) => formatarNumero(Math.round(v * 10) / 10);
  if (!movimento) { saltos.forEach((el) => el.style.setProperty('--cresce', 1)); return; }
  // estado de partida: ×1 e a barra só com a base; na entrada cada salto conta até o seu múltiplo
  saltos.forEach((el) => {
    el.style.setProperty('--cresce', +el.dataset.base / 100);
    $('[data-mult-num]', el).textContent = '1';
  });
  gsap.set(saltos, { y: 40, autoAlpha: 0 });
  ScrollTrigger.create({
    trigger: '[data-trajetoria]', start: 'top 88%', once: true,
    onEnter: () => {
      gsap.to(saltos, { y: 0, autoAlpha: 1, stagger: 0.12, duration: 1, ease: 'expo.out' });
      saltos.forEach((el, i) => {
        const d = 0.35 + i * 0.15;
        gsap.to(el, { '--cresce': 1, duration: 1.8, delay: d, ease: 'expo.out' });
        gsap.delayedCall(d, () => contar($('[data-mult-num]', el), +el.dataset.mult, { de: 1, duracao: 1.8, formato: fmt }));
      });
    },
  });
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
    // a foto recua devagar (leve deriva e esmaecimento) para a frase assumir a tela; sem escurecer de uma vez
    .fromTo('.manifesto__foto', { scale: 1, xPercent: 0, autoAlpha: 1 }, { scale: 1.03, xPercent: celular ? 0 : 6, autoAlpha: () => (celular ? 0.1 : innerWidth < innerHeight ? 0.16 : 0.28), duration: 0.6, ease: 'power1.inOut' }, 0.22)
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
  const intro = $('[data-octo-intro]', s);
  const tituloIntro = $('[data-octo-titulo]', s);
  const TOTAL_PASSOS = PASSOS_OCTOGONO.length - 1;
  let passoAtual = -1;
  let tlCard = null;
  let tlIntro = null;

  if (movimento) dividirPalavras(tituloIntro);
  const animarIntro = () => {
    if (!movimento) return;
    tlIntro?.kill();
    tlIntro = gsap.timeline({ defaults: { ease: 'expo.out' } })
      .fromTo($('.faixa', intro), { scaleX: 0, transformOrigin: celular ? '50% 50%' : '0% 50%' }, { scaleX: 1, duration: 0.9 }, 0)
      .fromTo($$('.palavra > span', tituloIntro), { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: 0.07 }, 0.05)
      .fromTo($$('[data-octo-anim]:not(.faixa)', intro), { y: 26, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.09 }, 0.25);
  };

  // o nome entra letra a letra; número fantasma, linha e etiqueta em sequência; direção segue a rolagem
  const animarCard = (dir) => {
    if (!movimento) return;
    const nome = campo('nome');
    const texto = nome.textContent;
    nome.setAttribute('aria-label', texto);
    nome.innerHTML = [...texto].map((c) => `<span class="letra" aria-hidden="true">${c === ' ' ? '&nbsp;' : c}</span>`).join('');
    tlCard?.kill();
    tlCard = gsap.timeline({ defaults: { ease: 'expo.out' } })
      .fromTo(campo('fantasma'), { yPercent: 35 * dir, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 1.2 }, 0)
      .fromTo($('.octo-card__kick', card), { y: 12 * dir, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6 }, 0)
      .fromTo($$('.letra', nome), { yPercent: 115 * dir }, { yPercent: 0, duration: 0.85, stagger: 0.028 }, 0.04)
      .fromTo(campo('tema'), { x: -28, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.8 }, 0.16)
      .fromTo($('.octo-card__linha', card), { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0.2)
      .fromTo([campo('marco-lbl'), campo('marco')], { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.06 }, 0.28)
      .fromTo(campo('formato'), { scale: 0.85, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.6, ease: 'back.out(2)' }, 0.4);
  };

  const mostrar = (i) => {
    if (i === passoAtual) return;
    const dir = i >= passoAtual ? 1 : -1;
    const vinhaDoCartao = passoAtual > 0;
    passoAtual = i;
    navBtns.forEach((b) => b.setAttribute('aria-current', String(+b.dataset.irPasso === i)));
    if (i === 0) { s.dataset.modo = 'intro'; if (vinhaDoCartao) animarIntro(); return; }
    s.dataset.modo = 'card';
    const d = PASSOS_OCTOGONO[i];
    const formato = campo('formato');
    if (d.tipo === 'corner') {
      campo('kick').textContent = 'A camada emocional';
      campo('num').textContent = '';
      campo('de').textContent = '';
      campo('nome').textContent = d.nome;
      campo('fantasma').textContent = 'C';
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
      campo('fantasma').textContent = d.num;
      campo('tema').textContent = d.tema;
      campo('marco-lbl').textContent = d.tipo === 'encarada' ? 'Abertura da jornada' : 'Marco do Round';
      campo('marco').textContent = d.marco;
      const premium = d.formato === 'premium';
      formato.textContent = premium ? 'Só no Premium · 8 meses' : 'Nos dois formatos';
      formato.classList.toggle('premium', premium);
    }
    card.style.setProperty('--prog', (i / TOTAL_PASSOS).toFixed(3));
    animarCard(dir);
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
  ScrollTrigger.create({ trigger: s, start: 'top 65%', once: true, onEnter: animarIntro });
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
  const med = $('[data-medimos]');
  const itens = $$('.medimos__lista li', med);

  $$('button', alt).forEach((b) => b.addEventListener('click', () => {
    const modo = b.dataset.modo;
    if (pares.dataset.modoAtual === modo) return;
    alt.dataset.em = modo;
    $$('button', alt).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    pares.dataset.modoAtual = modo;
    if (!movimento) return;
    gsap.fromTo($$(`.par__${modo}`, pares), { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.07, duration: 0.8, ease: 'expo.out', clearProps: 'transform,opacity,visibility' });
    gsap.fromTo($$('.par__n', pares), { yPercent: 40, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, stagger: 0.07, duration: 0.8, ease: 'expo.out' });
  }));

  if (!movimento) {
    itens.forEach((li) => { li.style.setProperty('--f', 1); li.classList.add('feito'); });
    med.style.setProperty('--sublinha', 1);
    return;
  }
  gsap.from('.par', { y: 50, autoAlpha: 0, stagger: 0.1, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: pares, start: 'top 85%', once: true } });

  // Como medimos: a faixa abre, e uma linha preenche os quatro itens conforme a rolagem
  gsap.fromTo(med, { clipPath: 'inset(8% 4% 8% 4% round 24px)' }, {
    clipPath: 'inset(0% 0% 0% 0% round 16px)', duration: 1.3, ease: 'expo.out',
    scrollTrigger: { trigger: med, start: 'top 88%', once: true },
  });
  gsap.from($$('.medimos__cab > *, .medimos__lista li', med), {
    y: 30, autoAlpha: 0, stagger: 0.08, duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: med, start: 'top 85%', once: true },
  });
  const proxy = { p: 0 };
  gsap.to(proxy, {
    p: 1, ease: 'none',
    scrollTrigger: { trigger: med, start: 'top 80%', end: 'bottom 55%', scrub: 0.6 },
    onUpdate: () => {
      const v = proxy.p * itens.length;
      itens.forEach((li, i) => {
        const f = Math.min(1, Math.max(0, v - i));
        li.style.setProperty('--f', f.toFixed(3));
        li.classList.toggle('feito', f >= 0.98);
      });
      med.style.setProperty('--sublinha', Math.min(1, proxy.p * 1.6).toFixed(3));
    },
  });
  // luz que acompanha o ponteiro
  if (ponteiroFino) {
    med.addEventListener('pointerenter', () => med.style.setProperty('--luz-on', 1));
    med.addEventListener('pointerleave', () => med.style.setProperty('--luz-on', 0));
    med.addEventListener('pointermove', (e) => {
      const r = med.getBoundingClientRect();
      med.style.setProperty('--mx', `${e.clientX - r.left}px`);
      med.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  }
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

/* ═══ 09 · formatos e investimento ════════════════════════════════════════
   Cena presa ao scroll em capítulos. O peso de cada capítulo é quanto de rolagem ele ocupa:
   a jornada e as entregas são "contadas" item a item dentro do próprio capítulo. */
const CAPITULOS = [
  { id: 'escolha', peso: 1, vis: 'octo' },
  { id: 'jornada', peso: 2.8, vis: 'octo' },
  { id: 'muda', peso: 0.6, vis: 'muda' }, // sem passos internos: só o tempo dos números contarem
  { id: 'preco', peso: 0.7, vis: 'preco' }, // o preço não tem passos internos: curto, para não travar antes das entregas
  { id: 'recebe', peso: 3, vis: 'recebe' },
];
// que lados do octógono cada mês acende (Round 1 = lado 1 … Futuro e Cultura = lados 7 e 8)
const LADOS = { posicao: [1], preparo: [2], combate: [3], equipe: [4], vitoria: [5], legado: [6], futuro: [7, 8] };
const ICONES = { escudo: 'icone-escudo-ouro.svg', trofeu: 'icone-trofeu-ouro.svg', louro: 'icone-louro-ouro.svg' };

function octogonoSVG() {
  const ang = (k) => ((-112.5 + 45 * k) * Math.PI) / 180;
  const P = (r, a) => `${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`;
  const anel = (r) => Array.from({ length: 8 }, (_, k) => P(r, ang(k))).join(' ');
  // anel do bônus: cada lado tem um vão no meio, onde fica o número do Round (o pontilhado não passa por cima dele)
  const anelComVaos = (r) => Array.from({ length: 8 }, (_, k) => {
    const [ax, ay] = [r * Math.cos(ang(k)), r * Math.sin(ang(k))];
    const [bx, by] = [r * Math.cos(ang(k + 1)), r * Math.sin(ang(k + 1))];
    const pt = (t) => `${(ax + (bx - ax) * t).toFixed(2)},${(ay + (by - ay) * t).toFixed(2)}`;
    return `M${pt(0)} L${pt(0.36)} M${pt(0.64)} L${pt(1)}`;
  }).join(' ');
  let lados = '';
  let nums = '';
  for (let k = 0; k < 8; k++) {
    lados += `<polygon class="seg" data-seg="${k + 1}" points="${P(100, ang(k))} ${P(100, ang(k + 1))} ${P(76, ang(k + 1))} ${P(76, ang(k))}"/>`;
    const meio = (ang(k) + ang(k + 1)) / 2;
    const [x, y] = P(114, meio).split(',');
    nums += `<text class="seg__n" x="${x}" y="${y}">${k + 1}</text>`;
  }
  return {
    svg: `<path class="anel-bonus" d="${anelComVaos(124)}"/><polygon class="anel-alta" points="${anel(105)}"/>${lados}<polygon class="miolo" points="${anel(70)}"/>${nums}`,
    contorno: anel(100),
  };
}

function investimento() {
  const raiz = $('#investimento');
  const seletor = $('[data-formato]', raiz);
  const input = $('[data-lideres-input]', raiz);
  const aviso = $('[data-lideres-aviso]', raiz);
  const cta = $('[data-cta-turma]', raiz);
  const estado = { f: 'oito', n: MINIMO_LIDERES, cap: null, mes: -1, entrega: -1, local: 0 };
  // cena presa só fora do celular; no celular os capítulos viram leitura vertical (CSS: .investimento:not(.inv-cena))
  const cena = movimento && !celular;
  if (cena) raiz.classList.add('inv-cena');
  else raiz.classList.remove('cena');
  const base = import.meta.env.BASE_URL;

  /* octógono 3D */
  const octo = $('[data-octo3d]', raiz);
  const svg = $('[data-octo-svg]', raiz);
  svg.setAttribute('viewBox', '-135 -135 270 270');
  const { svg: desenho, contorno } = octogonoSVG();
  svg.innerHTML = desenho;
  [-14, -28].forEach((z, i) => {
    const camada = document.createElement('div');
    camada.className = 'octo3d__camada';
    camada.style.transform = `translateZ(${z}px)`;
    camada.style.opacity = String(0.6 - i * 0.25);
    camada.innerHTML = `<svg viewBox="-135 -135 270 270"><polygon points="${contorno}"/></svg>`;
    octo.prepend(camada);
  });
  const segs = $$('.seg', svg);
  const miolo = $('.miolo', svg);
  const oNum = $('[data-o-num]', raiz);
  const oLbl = $('[data-o-lbl]', raiz);

  /* fichário: uma folha por entrega */
  const pasta = $('[data-pasta]', raiz);
  const frente = $('.pasta__frente', pasta);
  const docsEl = $('[data-docs]', raiz);
  ENTREGAS.forEach((e, k) => {
    const d = document.createElement('div');
    d.className = 'doc';
    d.style.setProperty('--x', `${k * 8}%`);
    d.style.setProperty('--y', `${(k % 2) * 6}%`);
    d.innerHTML = `<img src="${base}marca/${ICONES[e.icone]}" alt=""><b>${e.nome}</b><i></i>`;
    docsEl.appendChild(d);
  });
  const docs = $$('.doc', docsEl);

  /* jornada do formato atual */
  const jornadaAtual = () => {
    let m = 0;
    return JORNADA.filter((j) => !(j.so && estado.f === 'seis')).map((j) => ({ ...j, mes: j.kickoff ? 'Kick-off' : `Mês ${++m}` }));
  };

  const pintarOcto = (modo, idx = 0) => {
    const premium = estado.f === 'oito';
    const maxLado = premium ? 8 : 6;
    segs.forEach((s) => s.classList.toggle('fora', +s.dataset.seg > maxLado));
    svg.classList.toggle('com-alta', premium);
    if (modo === 'escolha') {
      segs.forEach((s) => { s.classList.toggle('ligado', +s.dataset.seg <= maxLado); s.classList.remove('atual'); });
      miolo.classList.add('ativo');
      svg.classList.remove('alta-atual', 'com-bonus');
      oNum.textContent = premium ? '8' : '6';
      oLbl.textContent = premium ? 'meses · Premium' : 'meses';
      return;
    }
    const J = jornadaAtual();
    const j = J[idx];
    const feitos = new Set();
    J.slice(0, idx).forEach((x) => (LADOS[x.id] || []).forEach((l) => feitos.add(l)));
    const agora = LADOS[j.id] || [];
    segs.forEach((s) => {
      const n = +s.dataset.seg;
      s.classList.toggle('ligado', feitos.has(n) || (j.id === 'bonus' && n <= maxLado));
      s.classList.toggle('atual', agora.includes(n));
    });
    const iEncarada = J.findIndex((x) => x.id === 'encarada');
    miolo.classList.toggle('ativo', idx >= iEncarada);
    svg.classList.toggle('alta-atual', j.id === 'alta');
    svg.classList.toggle('com-bonus', j.id === 'bonus');
    oNum.textContent = j.kickoff ? '0' : j.mes.replace('Mês ', '');
    oLbl.textContent = j.kickoff ? 'Kick-off' : j.round;
  };

  /* capítulos */
  const caps = Object.fromEntries($$('.cap', raiz).map((el) => [el.dataset.cap, el]));
  const visuais = Object.fromEntries($$('[data-vis]', raiz).map((el) => [el.dataset.vis, el]));
  const navBtns = $$('[data-ir-cap]', raiz);
  const TOTAL = CAPITULOS.reduce((a, c) => a + c.peso, 0);
  const inicio = {};
  CAPITULOS.reduce((a, c) => { inicio[c.id] = a; return a + c.peso; }, 0);

  const mostrarMes = (idx, dir = 1) => {
    const J = jornadaAtual();
    idx = Math.max(0, Math.min(J.length - 1, idx));
    if (idx === estado.mes) return;
    estado.mes = idx;
    const j = J[idx];
    $('[data-j-pos]', raiz).textContent = `${idx + 1} / ${J.length}`;
    $('[data-j-mes]', raiz).textContent = j.mes;
    $('[data-j-round]', raiz).textContent = j.round;
    $('[data-j-marco]', raiz).textContent = j.marco;
    pintarOcto('jornada', idx);
    if (movimento && estado.cap === 'jornada') {
      gsap.fromTo($$('[data-j-mes], [data-j-round], [data-j-marco]', raiz), { y: 18 * dir, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.05, ease: 'expo.out', overwrite: true });
      gsap.fromTo(oNum, { yPercent: 40 * dir, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.6, ease: 'expo.out', overwrite: true });
    }
  };

  const animarStats = () => {
    const F = FORMATOS[estado.f];
    $$('[data-stat]', raiz).forEach((el, i) => {
      const txt = F.linhas[el.dataset.stat];
      const num = parseInt(txt, 10);
      const suf = txt.replace(/^\d+/, '');
      if (!movimento) { el.textContent = txt; return; }
      el.textContent = `0${suf}`;
      gsap.delayedCall(0.15 + i * 0.08, () => contar(el, num, { duracao: 1.3, formato: (v) => `${Math.round(v)}${suf}` }));
    });
    if (movimento) gsap.fromTo($$('.stats li', raiz), { y: 40, rotateX: -25, autoAlpha: 0 }, { y: 0, rotateX: 0, autoAlpha: 1, stagger: 0.08, duration: 0.9, ease: 'expo.out', overwrite: true });
  };

  const mostrarEntrega = (k, n) => {
    $('[data-r-n]', raiz).textContent = n;
    $('[data-r-pos]', raiz).textContent = `${n} / ${ENTREGAS.length}`;
    pasta.classList.toggle('completa', n === ENTREGAS.length);
    if (k === estado.entrega) return;
    const dir = k > estado.entrega ? 1 : -1;
    estado.entrega = k;
    $('[data-r-nome]', raiz).textContent = ENTREGAS[k].nome;
    $('[data-r-desc]', raiz).textContent = ENTREGAS[k].desc;
    if (movimento && estado.cap === 'recebe') gsap.fromTo('.recebe__atual > *', { y: 14 * dir, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.05, ease: 'expo.out', overwrite: true });
  };

  // cada folha cai dentro da pasta; a frente abre um pouco para recebê-la
  const tlPasta = gsap.timeline({
    paused: true,
    onUpdate: () => {
      const t = tlPasta.time();
      mostrarEntrega(Math.min(ENTREGAS.length - 1, Math.max(0, Math.floor(t))), Math.min(ENTREGAS.length, Math.max(0, Math.floor(t + 0.45))));
    },
  });
  gsap.set(frente, { z: 30, rotationX: -6, transformOrigin: '50% 100%' });
  docs.forEach((d, k) => {
    const giro = (k - 3.5) * 2.4;
    tlPasta
      .fromTo(d, { yPercent: -190, z: 160, rotation: giro + (k % 2 ? 18 : -18), autoAlpha: 0 }, { yPercent: 0, z: k * 2, rotation: giro, autoAlpha: 1, duration: 0.75, ease: 'power3.out' }, k)
      .to(frente, { rotationX: -26, duration: 0.3, ease: 'power2.out' }, k + 0.1)
      .to(frente, { rotationX: -6, duration: 0.45, ease: 'power2.inOut' }, k + 0.45);
  });
  tlPasta.to({}, { duration: 0.4 });

  const mostrarCap = (id, dir = 1) => {
    if (estado.cap === id) return;
    const anterior = estado.cap;
    estado.cap = id;
    raiz.dataset.cap = id;
    const C = CAPITULOS.find((c) => c.id === id);
    const visAnterior = anterior && CAPITULOS.find((c) => c.id === anterior).vis;
    navBtns.forEach((b) => b.setAttribute('aria-current', String(b.dataset.irCap === id)));
    Object.entries(caps).forEach(([k, el]) => el.classList.toggle('ativo', k === id));
    if (movimento) {
      Object.entries(caps).forEach(([k, el]) => { if (k !== id) gsap.to(el, { autoAlpha: 0, y: -20 * dir, duration: 0.3, overwrite: true }); });
      gsap.set(caps[id], { autoAlpha: 1, y: 0, overwrite: true });
      gsap.fromTo(caps[id].children, { y: 30 * dir, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.07, ease: 'expo.out', overwrite: true });
      if (visAnterior !== C.vis) {
        Object.entries(visuais).forEach(([k, el]) => { if (k !== C.vis) gsap.to(el, { autoAlpha: 0, scale: 0.94, duration: 0.35, overwrite: true }); });
        gsap.fromTo(visuais[C.vis], { autoAlpha: 0, scale: 0.9, y: 30 * dir }, { autoAlpha: 1, scale: 1, y: 0, duration: 1, ease: 'expo.out', overwrite: true });
      }
    }
    if (id === 'escolha') pintarOcto('escolha');
    if (id === 'jornada') { estado.mes = -1; mostrarMes(Math.floor(estado.local * jornadaAtual().length), dir); }
    if (id === 'muda') animarStats();
    if (id === 'preco' && movimento) {
      const el = $('[data-preco-valor]', raiz);
      contar(el, FORMATOS[estado.f].total, { de: Math.round(FORMATOS[estado.f].total * 0.55), duracao: 1.3 });
    }
  };

  /* formato, turma e pedido */
  const cadeiras = $('[data-cadeiras]', raiz);
  let cadeirasDesenhadas = 0;
  const desenharCadeiras = (n) => {
    const vis = Math.min(n, 48);
    let html = '';
    for (let i = 0; i < vis; i++) html += `<i${i >= cadeirasDesenhadas ? ' class="nova"' : ''}></i>`;
    if (n > vis) html += `<em>+${n - vis}</em>`;
    cadeiras.innerHTML = html;
    cadeirasDesenhadas = vis;
  };

  const precoAnim = { v: FORMATOS.oito.total };
  const totalAnim = { v: FORMATOS.oito.total * MINIMO_LIDERES };
  let primeira = true;
  const render = () => {
    const F = FORMATOS[estado.f];
    const premium = estado.f === 'oito';
    raiz.dataset.premium = String(premium);
    seletor.dataset.fAtual = estado.f;
    $$('button', seletor).forEach((b) => b.setAttribute('aria-checked', String(b.dataset.f === estado.f)));
    $$('[data-l]', raiz).forEach((el) => {
      const v = F.linhas[el.dataset.l];
      el.textContent = el.dataset.l === 'alta' ? (v === '—' ? 'não incluso' : v.toLowerCase()) : v;
    });
    $$('[data-stat]', raiz).forEach((el) => { el.textContent = F.linhas[el.dataset.stat]; });
    $('[data-preco-nome]', raiz).textContent = F.nome;
    $('[data-preco-mes]', raiz).textContent = `R$ ${formatarMensal(F.total / F.meses)} por mês`;
    $('[data-turma-n]', raiz).textContent = estado.n;
    const total = F.total * estado.n;
    const valorEl = $('[data-preco-valor]', raiz);
    const totalEl = $('[data-turma-total]', raiz);
    if (movimento && !primeira) {
      gsap.to(precoAnim, { v: F.total, duration: 0.9, ease: 'power3.out', onUpdate: () => { valorEl.textContent = formatarNumero(Math.round(precoAnim.v)); } });
      gsap.to(totalAnim, { v: total, duration: 0.7, ease: 'power3.out', onUpdate: () => { totalEl.textContent = formatarBRL(Math.round(totalAnim.v)); } });
    } else {
      precoAnim.v = F.total; totalAnim.v = total;
      valorEl.textContent = formatarNumero(F.total);
      totalEl.textContent = formatarBRL(total);
    }
    desenharCadeiras(estado.n);
    const legado = $('[data-legado-valor]');
    if (legado) legado.textContent = formatarBRL(Math.round(total * 0.1));
    // o pedido já sai com formato e tamanho da turma preenchidos
    const assunto = `Quero montar a turma · ${F.nome} · ${estado.n} líderes${empresa ? ` · ${empresa}` : ''}`;
    const corpo = `Olá! Quero conversar sobre uma turma de ${estado.n} líderes no formato ${F.nome} (${formatarBRL(total)}).`;
    cta.href = `mailto:contato@rodrigominotauro.com.br?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;

    if (!primeira) {
      if (estado.cap === 'escolha' || !cena) pintarOcto('escolha');
      if (estado.cap === 'jornada') { const m = estado.mes; estado.mes = -1; mostrarMes(m); }
      if (estado.cap === 'muda') animarStats();
    }
    if (!cena) renderJornadaLista();
    primeira = false;
  };

  // sem movimento, a jornada inteira aparece como lista
  const renderJornadaLista = () => {
    let ol = $('.jornada-lista', raiz);
    if (!ol) { ol = document.createElement('ol'); ol.className = 'jornada-lista'; caps.jornada.appendChild(ol); }
    ol.innerHTML = jornadaAtual().map((j) => `<li><span class="mes">${j.mes}</span><b>${j.round}</b><span class="marco">${j.marco}</span></li>`).join('');
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
  $$('[data-lideres]', raiz).forEach((b) => b.addEventListener('click', () => definirLideres(estado.n + +b.dataset.lideres)));
  input.addEventListener('input', () => { const n = parseInt(input.value, 10); if (n >= MINIMO_LIDERES) definirLideres(n, false); });
  input.addEventListener('change', () => definirLideres(parseInt(input.value, 10)));

  render();

  if (!cena) {
    pintarOcto('escolha');
    if (movimento) investimentoVertical();
    else { tlPasta.progress(1); mostrarEntrega(ENTREGAS.length - 1, ENTREGAS.length); }
    return;
  }

  // celular: cada capítulo e cada visual entram ao chegar na tela; os números contam, a pasta recebe as folhas
  function investimentoVertical() {
    const ao = (alvo, onEnter, start = 'top 82%') => ScrollTrigger.create({ trigger: alvo, start, once: true, onEnter });
    // a lista mês a mês já conta a jornada: o cartão de um mês só some, o rótulo fica sem contador
    $('.rotulo', caps.jornada).textContent = 'A jornada, mês a mês';
    Object.values(caps).forEach((c) => {
      gsap.set(c.children, { y: 36, autoAlpha: 0 });
      ao(c, () => gsap.to(c.children, { y: 0, autoAlpha: 1, duration: 1, stagger: 0.08, ease: 'expo.out' }));
    });
    gsap.set(visuais.octo, { autoAlpha: 0, scale: 0.85, rotate: -22.5 });
    ao(visuais.octo, () => {
      gsap.to(visuais.octo, { autoAlpha: 1, scale: 1, rotate: 0, duration: 1.4, ease: 'expo.out' });
      gsap.from(segs, { autoAlpha: 0, duration: 0.5, stagger: 0.07, delay: 0.3, ease: 'power2.out', clearProps: 'opacity,visibility' });
      contar(oNum, estado.f === 'oito' ? 8 : 6, { de: 0, duracao: 1.4, formato: (v) => String(Math.round(v)) });
    });
    gsap.set(visuais.muda, { autoAlpha: 0 });
    ao(visuais.muda, () => { gsap.set(visuais.muda, { autoAlpha: 1 }); animarStats(); });
    ao(caps.preco, () => contar($('[data-preco-valor]', raiz), FORMATOS[estado.f].total, { de: Math.round(FORMATOS[estado.f].total * 0.55), duracao: 1.3 }));
    gsap.set(visuais.preco, { y: 50, autoAlpha: 0 });
    ao(visuais.preco, () => gsap.to(visuais.preco, { y: 0, autoAlpha: 1, duration: 1.1, ease: 'expo.out' }));
    mostrarEntrega(0, 0);
    gsap.set(visuais.recebe, { y: 40, autoAlpha: 0 });
    ao(visuais.recebe, () => {
      gsap.to(visuais.recebe, { y: 0, autoAlpha: 1, duration: 1, ease: 'expo.out' });
      tlPasta.timeScale(2.2).play(0);
    }, 'top 75%');
  }

  /* rolagem → capítulo → passo dentro do capítulo */
  raiz.style.setProperty('--passos', (TOTAL + 1).toFixed(2));
  gsap.set([...Object.values(caps), ...Object.values(visuais)], { autoAlpha: 0 });
  let ultimo = 0;
  const atualizar = (progresso) => {
    const p = progresso * TOTAL;
    const dir = p >= ultimo ? 1 : -1;
    ultimo = p;
    const C = CAPITULOS.find((c) => p < inicio[c.id] + c.peso) || CAPITULOS[CAPITULOS.length - 1];
    estado.local = Math.min(1, Math.max(0, (p - inicio[C.id]) / C.peso));
    mostrarCap(C.id, dir);
    if (C.id === 'jornada') mostrarMes(Math.floor(estado.local * jornadaAtual().length * 0.999), dir);
    if (C.id === 'recebe') gsap.to(tlPasta, { progress: Math.min(1, estado.local * 1.08), duration: 0.6, ease: 'power2.out', overwrite: true });
  };
  ScrollTrigger.create({ trigger: raiz, start: 'top top', end: 'bottom bottom', onUpdate: (st) => atualizar(st.progress), onRefresh: (st) => atualizar(st.progress) });
  atualizar(0);

  navBtns.forEach((b) => b.addEventListener('click', () => {
    const curso = raiz.offsetHeight - innerHeight;
    const alvo = inicio[b.dataset.irCap] + (b.dataset.irCap === 'recebe' ? 0.15 : 0.05);
    irPara(raiz.offsetTop + (alvo / TOTAL) * curso, { duration: 1.2 });
  }));

  // o octógono e a pasta inclinam com o ponteiro
  if (ponteiroFino) {
    const area = $('.inv-visual', raiz);
    area.addEventListener('pointermove', (e) => {
      const r = area.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      raiz.style.setProperty('--ry', `${(-14 + x * 18).toFixed(1)}deg`);
      raiz.style.setProperty('--rx', `${(16 - y * 14).toFixed(1)}deg`);
    });
    area.addEventListener('pointerleave', () => { raiz.style.removeProperty('--ry'); raiz.style.removeProperty('--rx'); });
  }
}

/* ═══ 10 · próximo passo ══════════════════════════════════════════════════ */
function proximoPasso() {
  const s = $('#proximo-passo');
  const legado = $('[data-legado]', s);
  if (movimento) {
    gsap.set(legado, { y: 50, autoAlpha: 0 });
    gsap.set($$('.legado__cab, .legado__nums > div, .legado__dez', legado), { y: 24, autoAlpha: 0 });
  }
  ScrollTrigger.create({
    trigger: legado, start: 'top 88%', once: true,
    onEnter: () => {
      if (movimento) {
        gsap.timeline({ defaults: { ease: 'expo.out' } })
          .to(legado, { y: 0, autoAlpha: 1, duration: 1 })
          .to($$('.legado__cab, .legado__nums > div, .legado__dez', legado), { y: 0, autoAlpha: 1, stagger: 0.1, duration: 0.9 }, 0.15);
      }
      $$('[data-contar]', legado).forEach((el) => contar(el, +el.dataset.contar, { duracao: 1.8 }));
    },
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
