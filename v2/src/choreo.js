/* =========================================================================
   COREOGRAFIA — quando acontece cada coisa, em fração do scroll de cada cena (0 → 1).
   Partilhada pelo texto (cartões) e pelo 3D, para estarem sempre em sincronia.
   ========================================================================= */

/* I · Abertura: o habitat (vídeo) recua até ser o fundo do diorama; a luz acende. */
export const OPEN = {
  dolly: [0.03, 0.8],      // a câmara recua do vídeo até à vitrine inteira
  glass: [0.15, 0.5],      // o vidro ganha reflexos
  grade: [0.18, 0.62],     // o habitat passa a sépia: torna-se diorama
  appear: [0.3, 0.52],     // a peça surge em silhueta
  light: [0.46, 0.62],     // a luz do museu acende (com cintilação)
  frame: [0.3, 0.85],      // a composição abre espaço para o cartão
};

/* II · Em volta: a cúpula sobe e a câmara orbita a peça, parando em cada nota.
   az = ângulo à volta da peça (graus, 0 = de frente), el = altura (graus), r = distância (m),
   aim = quanto o olhar vai do centro da peça para o ponto anotado (0 → 1). */
export const ORBIT = {
  hood: [0, 0.1],
  intro: [0, 0.13],
  stops: [
    { travel: [0.06, 0.2], dwell: [0.2, 0.34], az: 14, el: 6, r: 0.92, aim: 0.6 },
    { travel: [0.34, 0.43], dwell: [0.43, 0.56], az: 98, el: 14, r: 0.96, aim: 0.55 },
    { travel: [0.56, 0.69], dwell: [0.69, 0.81], az: 328, el: -3, r: 0.84, aim: 0.7, bump: 0.6 },
    { travel: [0.81, 0.87], dwell: [0.87, 1.0], az: 382, el: 26, r: 0.8, aim: 0.8 },
  ],
};

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const seg = (p, [a, b]) => clamp((p - a) / (b - a));
export const smooth = (t) => t * t * (3 - 2 * t);
export const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const lerp = (a, b, t) => a + (b - a) * t;
