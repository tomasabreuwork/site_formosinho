/* =========================================================================
   FORMOSINHO — CONTEÚDOS DO SITE
   Edite apenas este ficheiro para mudar peças, passos, gavetas e a lupa.
   -------------------------------------------------------------------------
   ⚠ IMAGENS PROVISÓRIAS: fotografias com licença livre (CC0, domínio público
   e CC BY) encontradas no Openverse / Wikimedia Commons. Servem para mostrar
   o design. Antes de publicar, troque-as pelas fotografias das peças reais do
   atelier e atualize ou remova o campo "credit" de cada imagem trocada.
   Os textos (regiões, anos, dimensões, proveniência) também são fictícios.

   credit: { author, license: "by" | "cc0" | "pdm", version, url }
   ar (opcional): proporção da imagem na vitrine, ex. "3 / 2"
   ========================================================================= */

const BY2 = (author, url) => ({ author, license: "by", version: "2.0", url });
const PDM = (author, url) => ({ author, license: "pdm", version: "", url });
const CC0 = (author, url) => ({ author, license: "cc0", version: "", url });

window.FORMOSINHO = {

  /* -----------------------------------------------------------------------
     TOPO · vídeo de drone (YouTube). Basta trocar o id do vídeo.
     start/end em segundos (opcional) para escolher o excerto em ciclo.
     ----------------------------------------------------------------------- */
  heroVideo: {
    youtube: "Ok_qDnM7SiU",
    start: 0,
    end: 0,
    credit: { author: "Hugo Carrilho — “Mertola | Drone 4k”", license: "", version: "", url: "https://www.youtube.com/watch?v=Ok_qDnM7SiU" }
  },

  /* Frases do topo no telemóvel (mudam de 3 em 3 segundos) */
  heroPhrases: [
    "Do habitat à vitrine.",
    "Cada peça é um retrato.",
    "Rigor anatómico, feito à mão.",
    "Origem ética e documentada.",
    "A natureza, suspensa no tempo."
  ],

  /* -----------------------------------------------------------------------
     PROMOÇÃO · barra no fundo do ecrã (só em computador).
     active: false para desligar. Desaparece sozinha depois de "until".
     ----------------------------------------------------------------------- */
  promo: {
    active: true,
    label: "Black Friday",
    until: "2026-12-01T00:00:00",
    href: "#encomendas",
    items: [
      "−20% em restauros de troféus",
      "Encomendas feitas até 30 de novembro",
      "Recolha gratuita da peça em todo o país",
      "Reserve já a sua"
    ]
  },

  /* -----------------------------------------------------------------------
     VI · EM VOLTA · cabeça de veado 3D (visualizador Sketchfab)
     ----------------------------------------------------------------------- */
  turn3d: {
    sketchfab: "b52f0e3e6de44dbe9f80794c30cc3241",
    title: "Cabeça de veado montada — modelo 3D",
    autospin: 0.18,
    credit: { author: "3DScanX — “Deer Shoulder Mount SD-Fast Sample 3D Scan”", license: "", version: "", url: "https://sketchfab.com/3d-models/deer-shoulder-mount-sd-fast-sample-3d-scan-b52f0e3e6de44dbe9f80794c30cc3241" }
  },

  /* -----------------------------------------------------------------------
     III · CATÁLOGO — cat: aves | mamiferos | peixes | trofeus
     ----------------------------------------------------------------------- */
  pieces: [
    { no: "FRM-0142", src: "images/galeria/raposa.jpg", title: "Raposa", sci: "Vulpes vulpes", cat: "mamiferos",
      origin: "Atropelamento · cedida pelo SEPNA", region: "Alentejo", year: "2024", dims: "88 × 52 × 34 cm",
      desc: "Em pé sobre um cepo, o corpo torcido para trás: a postura de quem ouviu um ramo partir. Base em carvalho com musgo estabilizado.",
      credit: BY2("brooklyntaxidermy", "https://www.flickr.com/photos/39181603@N00/26551793981") },

    { no: "FRM-0139", src: "images/galeria/javali.jpg", title: "Javali", sci: "Sus scrofa", cat: "trofeus",
      origin: "Caça licenciada", region: "Beira Interior", year: "2024", dims: "64 × 46 × 58 cm",
      desc: "Montagem de cabeça com boca entreaberta. Os colmilhos foram limpos e selados; a gengiva é esculpida em resina e pintada à mão.",
      credit: BY2("brooklyntaxidermy", "https://www.flickr.com/photos/39181603@N00/26343991930") },

    { no: "FRM-0151", src: "images/galeria/bufo.jpg", title: "Bufo-pequeno", sci: "Asio otus", cat: "aves",
      origin: "Centro de recuperação de fauna", region: "Ribatejo", year: "2025", dims: "41 × 22 × 20 cm",
      desc: "Tufos auriculares erguidos e olhos laranja semicerrados — a postura de camuflagem que a espécie usa durante o dia.",
      credit: BY2("quinet", "https://www.flickr.com/photos/91994044@N00/26966817833") },

    { no: "FRM-0117", src: "images/galeria/lince.jpg", title: "Lince-euro-asiático", sci: "Lynx lynx", cat: "mamiferos",
      origin: "Coleção institucional · empréstimo", region: "—", year: "2022", dims: "96 × 61 × 40 cm",
      desc: "Restauro integral de uma peça antiga: pelagem reidratada, orelhas reconstruídas e olhos substituídos.",
      credit: CC0("0959kedi", "https://www.flickr.com/photos/200064604@N08/54231682084") },

    { no: "FRM-0128", src: "images/galeria/faisao.jpg", title: "Faisão", sci: "Phasianus colchicus", cat: "aves", ar: "1 / 1",
      origin: "Caça licenciada", region: "Ribatejo", year: "2023", dims: "92 × 70 × 40 cm",
      desc: "Em levantamento de voo, asas totalmente abertas. A peça é suspensa na parede por um ramo de urze.",
      credit: BY2("brooklyntaxidermy", "https://www.flickr.com/photos/39181603@N00/26013920513") },

    { no: "FRM-0133", src: "images/galeria/lebre.jpg", title: "Lebre", sci: "Lepus europaeus", cat: "mamiferos",
      origin: "Morte natural", region: "Trás-os-Montes", year: "2023", dims: "48 × 40 × 22 cm",
      desc: "Sentada, orelhas atentas. Pelagem de inverno; base de terra e restolho seco.",
      credit: BY2("quinet", "https://www.flickr.com/photos/91994044@N00/25621295437") },

    { no: "FRM-0098", src: "images/galeria/alce.jpg", title: "Alce", sci: "Alces alces", cat: "trofeus",
      origin: "Restauro de peça de família (c. 1920)", region: "—", year: "2021", dims: "140 × 120 × 95 cm",
      desc: "Troféu centenário recuperado: pele estabilizada, focinho reesculpido e escudo original em nogueira restaurado.",
      credit: BY2("quinet", "https://www.flickr.com/photos/91994044@N00/6545691607") },

    { no: "FRM-0146", src: "images/galeria/veado.jpg", title: "Veado-de-cauda-branca", sci: "Odocoileus virginianus", cat: "trofeus",
      origin: "Encomenda particular · importação documentada", region: "—", year: "2024", dims: "78 × 50 × 62 cm",
      desc: "Montagem de ombro em posição semi-virada, para ser vista de lado num corredor estreito.",
      credit: BY2("brooklyntaxidermy", "https://www.flickr.com/photos/39181603@N00/26591002186") },

    { no: "FRM-0121", src: "images/galeria/aguia-real.jpg", title: "Águia-real", sci: "Aquila chrysaetos", cat: "aves",
      origin: "Centro de recuperação · peça museológica", region: "Serra da Estrela", year: "2022", dims: "84 × 60 × 55 cm",
      desc: "Peça encomendada para exposição permanente. Montada sobre rocha, a olhar para baixo, em vigia.",
      credit: CC0("The Fun Chronicles", "https://www.flickr.com/photos/196406308@N04/52884209595") },

    { no: "FRM-0137", src: "images/galeria/pato-rabo-alcado.jpg", title: "Pato-de-rabo-alçado-americano", sci: "Oxyura jamaicensis", cat: "aves",
      origin: "Coleção de estudo", region: "—", year: "2024", dims: "38 × 26 × 18 cm",
      desc: "Macho em plumagem nupcial, bico azul reconstituído com pigmento. Diorama de caniçal.",
      credit: BY2("quinet", "https://www.flickr.com/photos/91994044@N00/49277500687") },

    { no: "FRM-0109", src: "images/galeria/truta.jpg", title: "Truta-do-lago", sci: "Salvelinus namaycush", cat: "peixes",
      origin: "Réplica a partir de molde · pesca sem morte", region: "—", year: "2022", dims: "71 × 24 cm",
      desc: "Réplica em resina pintada à mão a partir de fotografias e medidas tiradas antes da devolução à água.",
      credit: BY2("subarcticmike", "https://www.flickr.com/photos/31856336@N03/6274820158") },

    { no: "FRM-0144", src: "images/galeria/texugo.jpg", title: "Texugo", sci: "Meles meles", cat: "mamiferos", ar: "3 / 2",
      origin: "Atropelamento · cedido pelo ICNF", region: "Minho", year: "2024", dims: "70 × 30 × 26 cm",
      desc: "A caminhar, focinho baixo, como se seguisse um rasto. Base neutra para coleção de museu.",
      credit: { author: "Benjamin Healley / Museums Victoria", license: "by", version: "4.0", url: "https://collections.museumsvictoria.com.au/specimens/145505" } },

    { no: "FRM-0112", src: "images/galeria/carpa.jpg", title: "Carpa", sci: "Cyprinus carpio", cat: "peixes", ar: "3 / 2",
      origin: "Pesca desportiva", region: "Ribatejo", year: "2023", dims: "66 × 30 cm",
      desc: "Pele original com escamas fixadas e envernizadas; barbatanas reforçadas por trás com papel japonês.",
      credit: BY2("istolethetv", "https://www.flickr.com/photos/44124401641@N01/5952496797") },

    { no: "FRM-0125", src: "images/galeria/pato-real.jpg", title: "Pato-real (casal)", sci: "Anas platyrhynchos", cat: "aves", ar: "4 / 3",
      origin: "Caça licenciada", region: "Lezíria", year: "2023", dims: "60 × 40 × 32 cm",
      desc: "Macho e fêmea lado a lado, como num lago ao fim da tarde.",
      credit: BY2("angela n.", "https://www.flickr.com/photos/34517103@N00/6274395708") }
  ],

  /* -----------------------------------------------------------------------
     II · MÉTODO — 5 tempos
     ----------------------------------------------------------------------- */
  steps: [
    { title: "Estudo", time: "1 — 2 semanas", src: "images/processo/01-estudo.jpg",
      text: "Antes de tocar no animal, estudamo-lo vivo: fotografias, vídeos, medidas do exemplar e desenhos de pose. A peça decide-se aqui.",
      credit: PDM("Biodiversity Heritage Library", "https://www.flickr.com/photos/61021753@N02/49168917853") },
    { title: "Preparação", time: "2 — 4 semanas", src: "images/processo/02-preparacao.jpg",
      text: "A pele é retirada, limpa e curtida. Penas e pelo são lavados e secos com paciência — uma pena torta nota-se a três metros.",
      credit: BY2("avrene", "https://www.flickr.com/photos/23212428@N00/12055767433") },
    { title: "Escultura", time: "3 — 6 semanas", src: "images/processo/03-escultura.jpg",
      text: "Esculpimos o corpo à medida, músculo a músculo, a partir das medidas reais. Não usamos manequins genéricos sem os corrigir.",
      credit: BY2("Colin Davis Studio", "https://www.flickr.com/photos/87506973@N00/3470049822") },
    { title: "Montagem", time: "2 — 4 semanas", src: "images/processo/04-montagem.jpg",
      text: "A pele é assente no corpo, os olhos de vidro colocados e a expressão afinada durante dias, enquanto seca.",
      credit: BY2("brooklyntaxidermy", "https://www.flickr.com/photos/39181603@N00/26551792011") },
    { title: "Apresentação", time: "1 — 2 semanas", src: "images/processo/05-acabamento.jpg",
      text: "Pintura das partes sem pelo, base, cúpula ou diorama. Cada peça segue com ficha de catálogo e certificado de origem.",
      credit: BY2("PunkToad", "https://www.flickr.com/photos/83699771@N00/9323772851") }
  ],

  /* -----------------------------------------------------------------------
     IV · GAVETAS — 12 gavetas (4 × 3). label = etiqueta curta da gaveta
     ----------------------------------------------------------------------- */
  drawers: [
    { label: "Passeriformes", title: "Série de passeriformes", sci: "Passeriformes", count: "48 exemplares", src: "images/gavetas/01.jpg",
      desc: "Peles de estudo montadas em suporte, usadas como referência de cor e proporção.",
      credit: PDM("avidd", "https://www.flickr.com/photos/47132899@N00/1643228258") },
    { label: "Migradoras", title: "Aves de colisão", sci: "Aves migradoras", count: "112 exemplares", src: "images/gavetas/02.jpg",
      desc: "Aves recolhidas após colisão com vidros durante a migração e cedidas para estudo.",
      credit: PDM("Sam Droege", "https://www.flickr.com/photos/54563451@N08/8517895172") },
    { label: "Cabeças", title: "Estudo de cabeça", sci: "Spizella pusilla", count: "1 exemplar", src: "images/gavetas/03.jpg",
      desc: "Referência para o ângulo do bico e a inserção das penas à volta do olho.",
      credit: PDM("Sam Droege", "https://www.flickr.com/photos/54563451@N08/17108053758") },
    { label: "Osteologia", title: "Pata de quíscalo", sci: "Quiscalus quiscula", count: "6 exemplares", src: "images/gavetas/04.jpg",
      desc: "Patas secas para estudar a posição das garras quando a ave agarra um ramo.",
      credit: PDM("Sam Droege", "https://www.flickr.com/photos/54563451@N08/17181386189") },
    { label: "Insecta", title: "Abelha solitária", sci: "Ammobates muticus", count: "30 exemplares", src: "images/gavetas/05.jpg",
      desc: "Pequena coleção entomológica para dioramas — os insetos dão escala e vida às bases.",
      credit: PDM("Sam Droege", "https://www.flickr.com/photos/54563451@N08/15198948954") },
    { label: "Pranchas I", title: "Pranchas de coleópteros", sci: "Coleoptera", count: "12 pranchas", src: "images/gavetas/06.jpg",
      desc: "Ilustrações científicas do séc. XIX que servem de referência de cor.",
      credit: PDM("Biodiversity Heritage Library", "https://www.flickr.com/photos/61021753@N02/49169403466") },
    { label: "Pranchas II", title: "Bacalhau — desenho de estudo", sci: "Gadus morhua", count: "8 pranchas", src: "images/gavetas/07.jpg",
      desc: "Desenhos de peixes usados para recuperar o padrão de cor que a pele perde ao secar.",
      credit: PDM("Biodiversity Heritage Library", "https://www.flickr.com/photos/61021753@N02/49169366461") },
    { label: "Tetraodontes", title: "Peixe-porco-espinho", sci: "Diodon holocanthus", count: "2 exemplares", src: "images/gavetas/08.jpg",
      desc: "Exemplar insuflado à maneira antiga, com etiqueta original.",
      credit: CC0("Naturalis Biodiversity Center", "https://commons.wikimedia.org/w/index.php?curid=42431295") },
    { label: "Fósseis", title: "Milípede litificado", sci: "Diplopoda", count: "1 exemplar", src: "images/gavetas/09.jpg",
      desc: "Curiosidade geológica da coleção — nem tudo nas gavetas tem penas.",
      credit: BY2("James St. John", "https://commons.wikimedia.org/w/index.php?curid=89398793") },
    { label: "Conchas", title: "Conchas e corais", sci: "Mollusca · Cnidaria", count: "64 exemplares", src: "images/gavetas/10.jpg",
      desc: "Material para dioramas de costa e aquários secos.",
      credit: BY2("Jametiks", "https://www.flickr.com/photos/14247646@N00/3156856960") },
    { label: "Penas", title: "Pena de coruja-do-mato", sci: "Strix aluco", count: "200+ penas", src: "images/gavetas/11.jpg",
      desc: "Banco de penas de muda, usado para substituir penas danificadas em restauros.",
      credit: { author: "pete beard", license: "by", version: "2.0", url: "https://commons.wikimedia.org/w/index.php?curid=122235650" } },
    { label: "Ossos", title: "Esqueleto de orca (ref.)", sci: "Orcinus orca", count: "fotografias", src: "images/gavetas/12.jpg",
      desc: "Referência anatómica de grandes vertebrados para peças de museu.",
      credit: BY2("Elsie esq.", "https://www.flickr.com/photos/61132483@N00/6261587291") }
  ],

  /* -----------------------------------------------------------------------
     V · LUPA — pontos anotados (x / y em % da imagem images/detalhe/detalhe.jpg)
     ----------------------------------------------------------------------- */
  pins: [
    { x: 32, y: 22.5, title: "Olho", text: "Vidro soprado e pintado à mão, com o reflexo calibrado para a luz da sala." },
    { x: 31, y: 10, title: "Coroa", text: "Penas penteadas uma a uma com pinça e presas com alfinetes durante a secagem." },
    { x: 17, y: 46, title: "Bico", text: "Bico original, limpo e selado. A cor da base é reposta com pigmento." },
    { x: 52, y: 52, title: "Coberturas da asa", text: "Alinhadas pela ordem natural — é aqui que se nota a pressa." },
    { x: 49.5, y: 87, title: "Garras", text: "Fixadas ao ramo com arame interno, invisível de qualquer ângulo." }
  ],

  /* Outras imagens que precisam de crédito */
  extraCredits: [
    { what: "Capa · desfiladeiro", author: "Luís Ascenso", license: "by", version: "3.0", url: "https://commons.wikimedia.org/wiki/File:Fjath%C3%A1rgj%C3%BAfur_Canyon_(182065101).jpeg" },
    { what: "Fig. A · armário de coleção", author: "Jametiks", license: "by", version: "2.0", url: "https://www.flickr.com/photos/14247646@N00/3156859138" },
    { what: "Detalhe · guarda-rios", author: "Anagoria", license: "by", version: "3.0", url: "https://commons.wikimedia.org/w/index.php?curid=28126011" }
  ]
};
