// O Octógono da Liderança em 3D: um ringue de oito lados, com a Encarada no centro da lona,
// um Round em cada vértice e o Corner como o anel que envolve tudo.
// O scroll (via setProgresso) gira o ringue até levar o vértice ativo ao fundo do quadro,
// onde o poste acende e um facho de luz desce sobre ele.
import * as THREE from 'three';

const N = 8;
const R = 5;            // raio até os postes
const RP = R + 0.6;     // raio da plataforma
const ALTURA_POSTE = 2.3;
const CORDAS = [0.62, 1.12, 1.62];
const PASSOS = 11;      // abertura, Encarada, 8 Rounds, Corner

const NOMES = ['Posição', 'Preparo', 'Combate', 'Equipe', 'Vitória', 'Legado', 'Futuro', 'Cultura'];

// ângulo de cada vértice, no sentido horário visto de cima, a partir do fundo do quadro
const beta = (i) => THREE.MathUtils.degToRad(22.5 + 45 * i);
const posVertice = (i, raio = R) => new THREE.Vector3(raio * Math.sin(beta(i)), 0, -raio * Math.cos(beta(i)));

const lerp = THREE.MathUtils.lerp;
const clamp = THREE.MathUtils.clamp;
// segura em cada passo e transita no meio do caminho: o texto fica legível enquanto o ringue gira
const pausa = (t) => { const u = clamp((t - 0.2) / 0.6, 0, 1); return u * u * (3 - 2 * u); };

function token(nome) {
  return new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue(nome).trim());
}

export function criarOctogono({ canvas, rotulos, aoClicar, movimentoReduzido = false }) {
  const COR = {
    ouro: token('--mcd-color-brand-gold'),
    off: token('--mcd-color-brand-offwhite'),
    ink: token('--mcd-color-brand-ink'),
    raised: token('--mcd-color-surface-raised'),
    sunken: token('--mcd-color-surface-sunken'),
    palco: token('--palco'),
    verde: token('--mcd-color-brand-green'),
  };

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setClearColor(COR.palco, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const cena = new THREE.Scene();
  cena.fog = new THREE.Fog(COR.palco, 20, 46);

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 120);
  const ringue = new THREE.Group();
  cena.add(ringue);

  // ── luz de palco ───────────────────────────────────────────────────────
  cena.add(new THREE.HemisphereLight(COR.off, COR.palco, 0.35));
  const spot = new THREE.SpotLight(0xfff3e0, 520, 40, 0.5, 0.75, 2);
  spot.position.set(0, 15, 1.5);
  spot.target.position.set(0, 0, 0);
  spot.castShadow = true;
  spot.shadow.mapSize.set(1024, 1024);
  spot.shadow.bias = -0.0005;
  spot.shadow.camera.near = 6;
  spot.shadow.camera.far = 24;
  cena.add(spot, spot.target);
  const contra = new THREE.DirectionalLight(COR.ouro, 1.1);
  contra.position.set(0, 5, -12);
  cena.add(contra);
  const luzVertice = new THREE.PointLight(COR.ouro, 0, 7, 2);
  cena.add(luzVertice);

  // ── chão e plataforma ──────────────────────────────────────────────────
  const chao = new THREE.Mesh(
    new THREE.CircleGeometry(60, 64),
    new THREE.MeshStandardMaterial({ color: COR.palco, roughness: 1 })
  );
  chao.rotation.x = -Math.PI / 2;
  chao.position.y = -0.75;
  chao.receiveShadow = true;
  cena.add(chao);

  const forma = new THREE.Shape();
  for (let i = 0; i < N; i++) {
    const x = RP * Math.sin(beta(i)), y = RP * Math.cos(beta(i));
    i ? forma.lineTo(x, y) : forma.moveTo(x, y);
  }
  forma.closePath();

  const plataforma = new THREE.Mesh(
    new THREE.ExtrudeGeometry(forma, { depth: 0.72, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2 }),
    new THREE.MeshStandardMaterial({ color: COR.sunken, roughness: 0.85, metalness: 0.1 })
  );
  plataforma.rotation.x = -Math.PI / 2;
  plataforma.position.y = -0.75;
  plataforma.castShadow = true;
  plataforma.receiveShadow = true;
  ringue.add(plataforma);

  // lona: textura desenhada em canvas com o octógono, os números e o símbolo
  const tela = document.createElement('canvas');
  tela.width = tela.height = 2048;
  const textura = new THREE.CanvasTexture(tela);
  textura.colorSpace = THREE.SRGBColorSpace;
  textura.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  textura.repeat.set(1 / (2 * RP), 1 / (2 * RP));
  textura.offset.set(0.5, 0.5);
  const lona = new THREE.Mesh(
    new THREE.ShapeGeometry(forma),
    new THREE.MeshStandardMaterial({ map: textura, roughness: 0.92, metalness: 0 })
  );
  lona.rotation.x = -Math.PI / 2;
  lona.position.y = 0.012;
  lona.receiveShadow = true;
  ringue.add(lona);

  let simbolo = null;
  function desenharLona() {
    const c = tela.getContext('2d');
    const S = tela.width, m = S / 2, k = S / (2 * RP);
    const css = (v) => `#${v.getHexString()}`;
    const g = c.createRadialGradient(m, m, 0, m, m, m);
    g.addColorStop(0, css(COR.raised));
    g.addColorStop(1, css(COR.sunken));
    c.fillStyle = g;
    c.fillRect(0, 0, S, S);

    const pt = (i, raio) => [m + raio * k * Math.sin(beta(i)), m - raio * k * Math.cos(beta(i))];
    const octo = (raio) => { c.beginPath(); for (let i = 0; i < N; i++) { const [x, y] = pt(i, raio); i ? c.lineTo(x, y) : c.moveTo(x, y); } c.closePath(); };

    // raios do centro aos vértices
    c.strokeStyle = 'rgba(237,236,230,.07)';
    c.lineWidth = 3;
    for (let i = 0; i < N; i++) { const [x, y] = pt(i, R); c.beginPath(); c.moveTo(m, m); c.lineTo(x, y); c.stroke(); }

    c.strokeStyle = css(COR.ouro);
    c.globalAlpha = 0.95; c.lineWidth = 7; octo(R - 0.05); c.stroke();
    c.globalAlpha = 0.35; c.lineWidth = 3; octo(R - 0.32); c.stroke();
    c.globalAlpha = 0.55; c.lineWidth = 4; octo(1.75); c.stroke();
    c.globalAlpha = 1;

    // números dos Rounds: girados com o raio, para o vértice ativo (levado ao fundo) ler de pé
    c.fillStyle = css(COR.ouro);
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.font = '700 74px Montserrat, "Helvetica Neue", sans-serif';
    for (let i = 0; i < N; i++) {
      const [x, y] = pt(i, R - 1.05);
      c.save(); c.translate(x, y); c.rotate(beta(i));
      c.fillText(String(i + 1).padStart(2, '0'), 0, 0);
      c.restore();
    }

    // centro: a Encarada — "Round 0", símbolo e nome, sem nada sobreposto
    c.fillStyle = 'rgba(20,19,19,.72)';
    octo(1.7); c.fill();
    c.fillStyle = css(COR.ouro);
    c.font = '600 30px Montserrat, "Helvetica Neue", sans-serif';
    c.letterSpacing = '12px';
    c.fillText('ROUND 0', m + 6, m - 1.08 * k);
    if (simbolo) {
      const h = 0.92 * k, w = h * (340.16 / 452.86); // proporção do viewBox do símbolo
      c.drawImage(simbolo, m - w / 2, m - 0.78 * k, w, h);
    }
    c.fillStyle = css(COR.off);
    c.font = '800 58px Montserrat, "Helvetica Neue", sans-serif';
    c.letterSpacing = '8px';
    c.fillText('ENCARADA', m + 4, m + 0.62 * k);
    c.letterSpacing = '0px';

    // faixa externa com o nome do método
    c.fillStyle = 'rgba(237,236,230,.28)';
    c.font = '500 36px Montserrat, "Helvetica Neue", sans-serif';
    for (let i = 0; i < N; i++) {
      const a = beta(i) + Math.PI / 8;
      const x = m + (R + 0.3) * k * Math.sin(a), y = m - (R + 0.3) * k * Math.cos(a);
      c.save(); c.translate(x, y); c.rotate(a);
      c.letterSpacing = '10px';
      c.fillText(i % 2 ? 'CHAMPION BY DESIGN' : 'OCTÓGONO DA LIDERANÇA', 0, 0);
      c.restore();
    }
    textura.needsUpdate = true;
  }
  desenharLona();
  const img = new Image();
  img.onload = () => { simbolo = img; desenharLona(); };
  img.src = `${import.meta.env.BASE_URL}marca/simbolo-ouro.svg`;
  document.fonts?.ready.then(desenharLona);

  // borda dourada da plataforma
  const borda = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(Array.from({ length: N }, (_, i) => posVertice(i, RP + 0.02).setY(0.02))),
    new THREE.LineBasicMaterial({ color: COR.ouro, transparent: true, opacity: 0.8 })
  );
  ringue.add(borda);

  // ── postes, cantoneiras e cordas ───────────────────────────────────────
  const matPoste = new THREE.MeshStandardMaterial({ color: 0x1b1a1a, metalness: 0.85, roughness: 0.35 });
  const geoPoste = new THREE.CylinderGeometry(0.1, 0.12, ALTURA_POSTE, 24);
  const geoAlmofada = new THREE.CylinderGeometry(0.2, 0.2, 1.38, 32);
  const geoTopo = new THREE.CylinderGeometry(0.14, 0.2, 0.12, 32);
  const vertices = [];

  for (let i = 0; i < N; i++) {
    const p = posVertice(i);
    const poste = new THREE.Mesh(geoPoste, matPoste);
    poste.position.set(p.x, ALTURA_POSTE / 2, p.z);
    poste.castShadow = true;
    const matAlmofada = new THREE.MeshStandardMaterial({ color: COR.raised, roughness: 0.55, emissive: COR.ouro, emissiveIntensity: 0 });
    const almofada = new THREE.Mesh(geoAlmofada, matAlmofada);
    almofada.position.set(p.x, 1.14, p.z);
    almofada.castShadow = true;
    const topo = new THREE.Mesh(geoTopo, new THREE.MeshStandardMaterial({ color: COR.ouro, metalness: 0.9, roughness: 0.25 }));
    topo.position.set(p.x, ALTURA_POSTE + 0.04, p.z);
    ringue.add(poste, almofada, topo);

    // facho de luz que desce sobre o vértice ativo
    const facho = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 1.1, 9, 32, 1, true),
      new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
        uniforms: { uCor: { value: COR.ouro }, uOpac: { value: 0 } },
        vertexShader: `varying vec2 vUv; varying vec3 vN; varying vec3 vV;
          void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position,1.0);
            vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
        fragmentShader: `uniform vec3 uCor; uniform float uOpac; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
          void main(){ float borda = pow(abs(dot(vN, vV)), 1.6);
            float alt = smoothstep(0.0, 0.18, vUv.y) * pow(1.0 - vUv.y, 0.35);
            gl_FragColor = vec4(uCor, borda * alt * uOpac); }`,
      })
    );
    facho.position.set(p.x, 4.5, p.z);
    ringue.add(facho);

    // risco aceso na lona, do centro até o vértice
    const risco = new THREE.Mesh(
      new THREE.PlaneGeometry(0.07, R - 1.75),
      new THREE.MeshBasicMaterial({ color: COR.ouro, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    risco.rotation.x = -Math.PI / 2;
    risco.rotation.z = -beta(i);
    const meio = posVertice(i, (R + 1.75) / 2);
    risco.position.set(meio.x, 0.02, meio.z);
    ringue.add(risco);

    vertices.push({ i, matAlmofada, facho, risco, ancora: new THREE.Vector3(p.x, ALTURA_POSTE + 0.55, p.z) });
  }

  const matCorda = new THREE.MeshStandardMaterial({ color: COR.off, roughness: 0.45, emissive: COR.ouro, emissiveIntensity: 0 });
  const lado = 2 * R * Math.sin(Math.PI / N);
  const geoCorda = new THREE.CylinderGeometry(0.034, 0.034, lado - 0.2, 12);
  const cordasPorLado = [];
  for (let i = 0; i < N; i++) {
    const a = posVertice(i), b = posVertice((i + 1) % N);
    const meio = a.clone().add(b).multiplyScalar(0.5);
    const dir = b.clone().sub(a).normalize();
    const lista = [];
    for (const h of CORDAS) {
      const corda = new THREE.Mesh(geoCorda, matCorda.clone());
      corda.position.set(meio.x, h, meio.z);
      corda.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      corda.castShadow = true;
      ringue.add(corda);
      lista.push(corda);
    }
    cordasPorLado.push(lista);
  }

  // o Corner: anel octogonal que envolve o ringue
  const anelCorner = new THREE.Mesh(
    new THREE.TorusGeometry(RP + 0.55, 0.025, 6, 8),
    new THREE.MeshBasicMaterial({ color: COR.ouro, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  anelCorner.rotation.x = Math.PI / 2;
  anelCorner.rotation.z = THREE.MathUtils.degToRad(22.5);
  anelCorner.position.y = 0.04;
  const anelCorner2 = anelCorner.clone();
  anelCorner2.material = anelCorner.material.clone();
  anelCorner2.scale.setScalar(0.94);
  anelCorner2.position.y = 2.15;
  ringue.add(anelCorner, anelCorner2);

  // centro aceso na Encarada
  const brilhoCentro = new THREE.Mesh(
    new THREE.CircleGeometry(1.75, 8),
    new THREE.MeshBasicMaterial({ color: COR.ouro, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  brilhoCentro.rotation.x = -Math.PI / 2;
  brilhoCentro.rotation.z = THREE.MathUtils.degToRad(22.5);
  brilhoCentro.position.y = 0.02;
  ringue.add(brilhoCentro);

  // poeira no cone de luz
  const QTD = 420;
  const pos = new Float32Array(QTD * 3);
  for (let j = 0; j < QTD; j++) {
    const r = Math.sqrt(Math.random()) * 6, a = Math.random() * Math.PI * 2;
    pos[j * 3] = Math.cos(a) * r; pos[j * 3 + 1] = Math.random() * 9; pos[j * 3 + 2] = Math.sin(a) * r;
  }
  const poeiraGeo = new THREE.BufferGeometry();
  poeiraGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const poeira = new THREE.Points(poeiraGeo, new THREE.PointsMaterial({
    color: COR.off, size: 0.035, transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  cena.add(poeira);

  // ── rótulos HTML projetados sobre os vértices ──────────────────────────
  const elRotulos = [];
  const criaRotulo = (num, nome, passo, ancora) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'vrot';
    b.tabIndex = -1; // o teclado usa a navegação .octo-nav, que tem rótulo acessível
    b.innerHTML = `<b>${num}</b><span>${nome}</span>`;
    b.addEventListener('click', () => aoClicar?.(passo));
    rotulos.appendChild(b);
    elRotulos.push({ el: b, ancora, passo });
  };
  vertices.forEach((v) => criaRotulo(String(v.i + 1).padStart(2, '0'), NOMES[v.i], v.i + 2, v.ancora));

  // ── quadros-chave por passo ────────────────────────────────────────────
  const Q = [];
  Q[0] = { rot: beta(0) - 1.1, cam: [0, 9.4, 19.5], olhar: [0, 0.2, 0] };
  Q[1] = { rot: beta(0) - 0.55, cam: [0, 14.5, 7.5], olhar: [0, 0, 0.4] };
  for (let i = 0; i < N; i++) Q[i + 2] = { rot: beta(i), cam: [0, 8.4, 16.4], olhar: [0, 0.9, -1.2] };
  Q[10] = { rot: beta(7) + 0.7, cam: [0, 12, 17], olhar: [0, 0.4, 0] };

  // ── estado e quadro ────────────────────────────────────────────────────
  let alvo = 0, atual = 0, ponteiroX = 0, ponteiroY = 0, px = 0, py = 0;
  let largura = 1, altura = 1, ativo = false, raf = 0, ultimo = 0;
  const v3 = new THREE.Vector3(), olhar = new THREE.Vector3(), cam = new THREE.Vector3();

  function enquadrar() {
    const caixa = canvas.parentElement.getBoundingClientRect();
    largura = Math.max(1, caixa.width);
    altura = Math.max(1, caixa.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, largura < 768 ? 1.75 : 2));
    renderer.setSize(largura, altura, false);
    camera.aspect = largura / altura;
    const retrato = camera.aspect < 1;
    camera.fov = retrato ? 46 : 30;
    // empurra o ringue para longe do texto: para a direita no desktop, para cima no celular
    // mesma regra do CSS: em paisagem o texto fica à esquerda; em pé, embaixo
    // em telas largas o deslocamento para; o ringue fica perto do texto, dentro do palco centralizado
    if (!retrato) camera.setViewOffset(largura, altura, -Math.min(largura * 0.17, 250), 0, largura, altura);
    else camera.setViewOffset(largura, altura, 0, altura * 0.16, largura, altura);
    camera.updateProjectionMatrix();
  }

  function quadro(t) {
    const dt = Math.min(0.05, (t - ultimo) / 1000 || 0.016);
    ultimo = t;
    atual += (alvo - atual) * (movimentoReduzido ? 1 : 1 - Math.pow(0.0008, dt));
    px += (ponteiroX - px) * 0.05;
    py += (ponteiroY - py) * 0.05;

    const p = clamp(atual, 0, PASSOS - 1);
    const s0 = Math.min(Math.floor(p), PASSOS - 2);
    const e = pausa(p - s0);
    const a = Q[s0], b = Q[s0 + 1];
    ringue.rotation.y = lerp(a.rot, b.rot, e);
    const zoom = camera.aspect < 1 ? 1.12 : 1;
    cam.set(lerp(a.cam[0], b.cam[0], e), lerp(a.cam[1], b.cam[1], e), lerp(a.cam[2], b.cam[2], e)).multiplyScalar(zoom);
    olhar.set(lerp(a.olhar[0], b.olhar[0], e), lerp(a.olhar[1], b.olhar[1], e), lerp(a.olhar[2], b.olhar[2], e));
    cam.x += px * 1.4;
    cam.y += py * 0.8;
    camera.position.copy(cam);
    camera.lookAt(olhar);

    // intensidade de cada vértice: acende perto do seu passo
    let maior = 0, qual = -1;
    for (const v of vertices) {
      const k = clamp(1 - Math.abs(p - (v.i + 2)) * 1.5, 0, 1);
      v.matAlmofada.emissiveIntensity = k * 0.9;
      v.matAlmofada.color.copy(COR.raised).lerp(COR.ouro, k * 0.75);
      v.facho.material.uniforms.uOpac.value = k * 0.55;
      v.risco.material.opacity = k * 0.85;
      if (k > maior) { maior = k; qual = v.i; }
    }
    if (qual >= 0) {
      v3.copy(vertices[qual].ancora).applyMatrix4(ringue.matrixWorld);
      luzVertice.position.copy(v3);
    }
    luzVertice.intensity = maior * 14;

    const corner = clamp(p - 9, 0, 1);
    for (let i = 0; i < N; i++) {
      const vizinho = Math.max(
        clamp(1 - Math.abs(p - (i + 2)) * 1.5, 0, 1),
        clamp(1 - Math.abs(p - (((i + 1) % N) + 2)) * 1.5, 0, 1)
      );
      for (const corda of cordasPorLado[i]) corda.material.emissiveIntensity = Math.max(corner * 0.85, vizinho * 0.25);
    }
    anelCorner.material.opacity = corner * 0.9;
    anelCorner2.material.opacity = corner * 0.55;
    brilhoCentro.material.opacity = clamp(1 - Math.abs(p - 1) * 1.4, 0, 1) * 0.22;

    if (!movimentoReduzido) {
      const arr = poeiraGeo.attributes.position.array;
      for (let j = 1; j < arr.length; j += 3) { arr[j] += dt * 0.12; if (arr[j] > 9) arr[j] = 0; }
      poeiraGeo.attributes.position.needsUpdate = true;
    }

    renderer.render(cena, camera);

    // rótulos
    ringue.updateMatrixWorld();
    for (const r of elRotulos) {
      v3.copy(r.ancora).applyMatrix4(ringue.matrixWorld).project(camera);
      const x = (v3.x * 0.5 + 0.5) * largura;
      const y = (-v3.y * 0.5 + 0.5) * altura;
      r.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      const dist = Math.abs(p - r.passo);
      r.el.classList.toggle('ativo', dist < 0.5);
      // rótulos dos postes mais próximos da câmera caem no meio do ringue: somem
      v3.copy(r.ancora).applyMatrix4(ringue.matrixWorld);
      r.el.classList.toggle('perto', v3.z > 1.2);
    }

    if (ativo) raf = requestAnimationFrame(quadro);
  }

  const aoMover = (ev) => {
    const caixa = canvas.getBoundingClientRect();
    ponteiroX = ((ev.clientX - caixa.left) / caixa.width - 0.5) * 2;
    ponteiroY = ((ev.clientY - caixa.top) / caixa.height - 0.5) * -2;
  };
  if (!movimentoReduzido && matchMedia('(pointer: fine)').matches) canvas.parentElement.addEventListener('pointermove', aoMover);

  const ro = new ResizeObserver(enquadrar);
  ro.observe(canvas.parentElement);
  enquadrar();

  return {
    setProgresso(v) { alvo = clamp(v, 0, PASSOS - 1); if (!ativo) { atual = alvo; quadro(performance.now()); } },
    iniciar() { if (ativo) return; ativo = true; ultimo = performance.now(); raf = requestAnimationFrame(quadro); },
    parar() { ativo = false; cancelAnimationFrame(raf); },
    PASSOS,
  };
}
