# Modelos 3D para a versão 2

Enquanto não houver uma digitalização de uma peça do atelier, a versão 2 mostra uma
**coruja-das-torres feita de formas geométricas** (`src/specimen.js`). Cada camada da peça
é um grupo com um nome fixo. Um ficheiro `.glb` com malhas **com os mesmos nomes**
substitui as formas provisórias sem mexer no resto do site.

## Nomes das malhas a fornecer

| Nome            | O que é                                         | Onde aparece                         |
| --------------- | ----------------------------------------------- | ------------------------------------ |
| `Peca_Base`     | base de madeira, cepo/ramo ou rocha             | todas as cenas                       |
| `Peca_Armacao`  | armação de arame (dentro do corpo)              | cena III · Por dentro                |
| `Peca_Corpo`    | corpo esculpido, sem pele                       | cenas III e IV                       |
| `Peca_Olho_E`   | olho de vidro esquerdo                          | cenas III e V (grande plano do olho) |
| `Peca_Olho_D`   | olho de vidro direito                           | cenas III e V                        |
| `Peca_Pele`     | pele com penas/pelo, bico, garras, etc.         | todas as cenas                       |
| `Nota_1` … `Nota_4` | objetos vazios (*empties*) nos pontos das notas | cena II · Em volta               |

As notas seguem a ordem de `js/gallery-data.js` → `turn3d` → peça com `sci: "Tyto alba"`
(disco facial, voo silencioso, garras, etiqueta de coleção). Se a peça mudar, as notas
mudam lá e os vazios `Nota_*` passam para os pontos novos.

As camadas podem ter várias malhas: basta que estejam agrupadas debaixo de um objeto
com o nome indicado.

## Medidas e orientação

- Unidades em **metros**, eixo **Y para cima**, a peça a olhar para **+Z** (para a câmara).
- A base assenta em **y = 0** e está centrada em x = 0, z = 0.
- O interior da vitrine mede **1,70 × 1,05 × 0,85 m** (largura × altura × profundidade).
  A peça deve caber com folga: até cerca de 0,8 m de altura e 1,2 m de largura.

## Peso e compressão

- Ficheiro final idealmente **abaixo de 8 MB** (telemóvel).
- Comprimir com Draco ou Meshopt, e texturas em WebP até 2048 px. Por exemplo, com o
  [glTF-Transform](https://gltf-transform.dev/):
  `gltf-transform optimize peca.glb peca-final.glb --compress draco --texture-compress webp`
- O carregamento com Draco e Meshopt já está preparado no código.

## Ativar o modelo

1. Copie o ficheiro para `v2/models/peca.glb`.
2. Em `v2/src/specimen.js`, mude `MODEL_URL = null` para `MODEL_URL = "models/peca.glb"`.

## Licenças

Use apenas modelos **do próprio atelier** ou com uma licença que permita, por escrito,
descarregar, modificar e publicar. Os modelos do Sketchfab da versão 1 são vistos no
visualizador do Sketchfab e **não** são descarregados nem usados aqui.
