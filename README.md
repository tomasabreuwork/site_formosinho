# Formosinho — Taxidermia & História Natural

Site estático (HTML, CSS e JavaScript, sem dependências) publicado com GitHub Pages.

## Editar conteúdos

Quase tudo se edita em **`js/gallery-data.js`**:

| Bloco          | O que controla                                           |
| -------------- | -------------------------------------------------------- |
| `heroVideo`    | vídeo de drone do topo (id do YouTube, início/fim)       |
| `heroPhrases`  | frases que mudam de 3 em 3 s no topo (telemóvel)         |
| `promo`        | barra de promoções no fundo (computador) — `active`, `until`, textos |
| `turn3d`       | modelo 3D da secção "Em volta" (id do Sketchfab)         |
| `pieces`       | peças do catálogo                                        |
| `steps`        | os 5 tempos do método                                    |
| `drawers`      | as 12 gavetas                                            |
| `pins`         | pontos anotados da lupa                                  |

As imagens estão em `images/` (ver `images/LEIA-ME.txt`).

> As fotografias atuais são provisórias (licenças livres, com créditos no rodapé).
> Antes do lançamento, substitua-as pelas peças reais do atelier.

## Formulário

Troque `action="#"` no formulário de encomenda por um endpoint (por exemplo Formspree)
para receber os pedidos por email.
