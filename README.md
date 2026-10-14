# Proposta comercial interativa · Minotauro Champion by Design

A proposta comercial v4 (outubro/2026) reescrita como página: 10 seções em tela cheia, com transições
de scroll, parallax, um octógono 3D navegável e calculadora de turma. Mobile-first, dark mode.

```bash
npm install
npm run dev       # desenvolvimento, com acesso pela rede local (teste no celular)
npm run build     # gera dist/ (caminhos relativos: funciona em qualquer subpasta)
npm run preview   # serve o dist/ em http://localhost:4173
```

`?empresa=Nome%20SA` personaliza a capa ("Preparada para…"), o título da aba e o assunto do e-mail do CTA.

## As 10 seções (e de onde vem cada texto)

Toda a copy é da v4 (`artefatos/.../proposta-comercial-champion/v4/index.html`). Nada foi escrito do zero:
quando um texto de uma tela da v4 virou interação, ele foi só redistribuído.

| # | Seção | Telas da v4 | Interação |
|---|---|---|---|
| 01 | Capa | 01 | Octógono que se desenha; parallax na saída. Véu estático sobre a foto (sem efeito de cursor) |
| 02 | A história | 02, 03 | Cena presa ao scroll em 3 tempos ("Nunca." → Acesso); a luz sobre o Rodrigo cresce com o scroll |
| 03 | Quem conduz com ele | 04 | Trajetória da Quitéria com contadores e barras de crescimento |
| 04 | Manifesto | 05, 07 | Os dois em parallax; a frase de crença acende palavra por palavra |
| 05 | A sua luta | 06 | Cartões que viram: o desafio de um lado, como ele vira prática do outro |
| 06 | O método | 08 + marcos da 15 | **Octógono 3D** (ringue de 8 lados): o scroll gira o ringue até cada vértice; navegação por vértice |
| 07 | Como funciona | 09, 16 | Alternador "No ringue / Na empresa"; Como medimos |
| 08 | Plataforma e evidência | 10, 11, 12, 14 | Trilha horizontal (desktop): plataforma, simulador de conversa que se digita, Relatório 30 Dias animado |
| 09 | Formatos e investimento | 13, 15, 17, 18 | Seletor 6 × 8 meses que reescreve jornada, tabela e preço; contador de líderes (mínimo 12) |
| 10 | Próximo passo | 19, 20 | Legado (10% para projetos sociais) e CTA |

Preços: os de 08/10/2026 (Ricardo), iguais à v4. A plataforma isolada **não** entra aqui: a decisão de
21/09 a mantém em documento à parte (`v4/plataforma.html`).

## Enquadramento

As seções com retrato (capa, história, Quitéria, manifesto, próximo passo) e o octógono escolhem o
layout pela **proporção da tela**, não pela largura: em pé (celular e tablet) o retrato fica no alto ou
embaixo e o texto nunca cobre o rosto; em paisagem, retrato à direita e texto numa coluna de até ~46%.
Conferido em 360, 390, 430, 768×1024, 1024×768, 1280, 1440 e 1920.

## Fotos

Só fotos reais que já estavam em `artefatos/`. Nada gerado por IA.

- **Retratos** (`public/img/fotos/`): `rodrigo-cinturoes`, `rodrigo-palco`, `rodrigo-pb`, `quiteria`,
  `fundadores` e `kit-caderno` da `v4/img/`. Ampliados 2× no Magnific em modo *Precision photo*
  (preset retrato: fiel ao original, sem inventar detalhe) e com o fundo removido no próprio Magnific.
  O fundo passa a ser o palco da página, igual em todas as seções — é isso que harmoniza fotos de
  ensaios diferentes. O hero usa a foto inteira (o recorte perdia um cinturão), com o preto levantado
  até a cor do palco. Tratamento final: `scripts/tratar-imagens.py`.
- **Capas da plataforma** (`public/img/capas/`): as 6 que a v4 já usava, ampliadas 2× no mesmo modo.
  A `capa-m8.jpg` da v4 ficou de fora (era a versão gerada no Magnific).
- **Telas da plataforma**: `plataforma-home.jpg` da v4, sem alteração.

## Decisões que fogem do design system — conferir

- **Parallax, 3D e animação ligada ao scroll.** O `06-motion/` do design system recomenda o contrário
  (sem parallax, sem 3D), mas está marcado como `[RECOMENDAÇÃO]` pendente (P4.3), e esta peça pediu
  explicitamente esses efeitos. O espírito foi mantido: rolagem nativa (cenas com `position: sticky`,
  sem sequestrar o scroll), entrada única, curvas dos tokens, e **`prefers-reduced-motion` desliga tudo**:
  a página vira leitura linear e o octógono 3D dá lugar ao diagrama plano da v4. O mesmo vale para
  telas baixas (< 520 px de altura) e navegadores sem WebGL.
- **`--palco` (#141313)** é o único valor de cor fora dos tokens: o ink rebaixado, o mesmo preto para o
  qual o script levanta as fotos low-key (a v4 em PDF usa o mesmo recurso em `.slide.preto`).
- **Montserrat**, auto-hospedada (`@fontsource`). A Gotham não tem licença web confirmada.
- Zero vermelho, zero exclamação, zero ®. Ouro nunca sobre offwhite (o Relatório 30 Dias, em papel
  claro, usa verde).

## 🚩 Antes de ir a cliente

1. **Destino do CTA.** O botão abre e-mail para `contato@rodrigominotauro.com.br` (caixa da operação).
   Confirmar se é esse o canal, ou trocar por WhatsApp/agenda — está em `index.html`, `data-cta`.
2. **Tudo o que a v4 lista como pendente continua pendente aqui**: linguagem do Rodrigo nas frases
   "No ringue" (`MIN-112`), Coach ICF, 21 ferramentas com IA, fotos da plataforma (`MIN-118`, `MIN-116`).
3. **Marcos dos Rounds 7 e 8 no octógono.** A v4 dá um marco só para o mês 8 ("IA em uso e melhoria
   contínua instalada"); no octógono ele foi dividido entre Futuro e Cultura.
4. **Desafios da seção 05, verso dos cartões.** As respostas recombinam frases da v4 (simulador, Relatório
   30 Dias, marco do Round 4), mas a combinação é nossa.
5. A foto de terno não foi usada (a v4 já perguntava sobre o relógio).

## Publicação

**Não publicar em site aberto: a página tem preço.** Se precisar de link, `dist/` vai atrás do
Cloudflare Access, como o `painel-entregas`. A página já leva `noindex, nofollow`.

## Estrutura

```
index.html               as 10 seções (conteúdo semântico; funciona sem JS)
src/main.js              rolagem (Lenis), transições e interações (GSAP + ScrollTrigger)
src/js/octogono.js       o ringue 3D (three.js) — carregado só quando a seção se aproxima
src/js/dados.js          Rounds, formatos, jornada e preços
src/styles/tokens.css    cópia dos tokens do design system (não editar aqui)
src/styles/base.css      tipografia, navegação, transições
src/styles/secoes.css    cada seção, mobile-first
scripts/tratar-imagens.py
```
