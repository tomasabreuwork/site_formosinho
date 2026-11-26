# Formosinho · versão 2 — "Do habitat à vitrine"

Versão experimental com scrollytelling em 3D, publicada em
`https://tomasabreuwork.github.io/site_formosinho/v2/`. A versão 1 continua a ser a página
principal e tem um botão **V2** na barra. A v2 tem um botão **V1** para voltar.

## Como funciona

- Um canvas 3D fixo (Three.js) com uma vitrine-diorama num museu à noite. O fundo do
  diorama é o **vídeo de drone da versão 1**: o habitat recua até ficar dentro da vitrine.
- Os textos estão em HTML, em cartões que mudam com o scroll (GSAP ScrollTrigger + Lenis).
- Os conteúdos vêm do **mesmo ficheiro da versão 1**, `js/gallery-data.js`. Os tipos de
  letra e o vídeo também são os da versão 1.
- Sem WebGL, ou com "reduzir movimento" ativo no sistema, a página passa a modo estático
  (texto em fluxo normal, sem 3D). Com "reduzir movimento" o vídeo não é carregado.

## Ficheiros

| Ficheiro           | O que faz                                                          |
| ------------------ | ------------------------------------------------------------------ |
| `index.html`       | estrutura, textos fixos, mapa das bibliotecas                      |
| `src/choreo.js`    | **quando** acontece cada coisa (frações do scroll de cada cena)    |
| `src/stage.js`     | sala, vitrine, luzes, pó, câmara                                   |
| `src/specimen.js`  | a peça provisória e o carregamento de um `.glb` real               |
| `src/textures.js`  | texturas desenhadas em código (penas, madeira, etiqueta…)          |
| `src/main.js`      | scroll, cartões, fios das etiquetas, arranque do 3D                |
| `MODELOS.md`       | que modelos 3D fornecer e com que nomes                            |

## Publicar

Não é preciso compilar: o browser carrega os módulos diretamente e as bibliotecas vêm da
jsDelivr (versões fixas no `index.html`). Para gerar uma versão empacotada com Vite
(sem depender da CDN), com o Node.js instalado:

```
cd v2
npm install
npm run build      # gera v2/dist, já com o endereço /site_formosinho/v2/
```

## Rever um momento exato

Acrescente ao endereço:

| Parâmetro        | O que faz                                                        |
| ---------------- | ---------------------------------------------------------------- |
| `?cena=1&p=0.27` | fixa a cena II a 27 % (sem scroll) — a cena I é `cena=0`         |
| `?vh=250`        | abre a página nesse ponto do scroll (em % da altura do ecrã)     |
| `&debug`         | mostra no título da página o que o 3D está a desenhar            |
| `&snap`          | põe o fotograma 3D como imagem (para capturas automáticas)       |

Capturas da revisão: [`capturas/`](capturas/README.md).

## Cenas

- [x] I · Abertura
- [x] II · Em volta
- [ ] III · Por dentro (vista explodida)
- [ ] IV · Método (a peça remonta-se em 5 passos)
- [ ] V · Detalhe (grande plano do olho)
- [ ] VI · Gavetas
- [ ] VII · Final (a vitrine fecha; encomendar)
