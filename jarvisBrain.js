// Brain/roteiro de respostas do J.A.R.V.I.S.
// (Você pode importar esse arquivo no front-end ou usar como referência.)

const jarvisBrain = {
  criador: {
    inputs: [
      'quem te criou',
      'quem é seu dono',
      'quem fez você',
      'quem é seu desenvolvedor'
    ],
    outputs: [
      'Fui desenvolvido e programado por Harashi.',
      'Meu criador é o Harashi. Sou o resultado das suas linhas de código e modificações.'
    ]
  },
  proposito: {
    inputs: ['qual seu proposito', 'para que voce serve', 'por que voce foi criada'],
    outputs: [
      'Fui projetada para ser o assistente virtual do Harashi, auxiliando em desenvolvimento, automação e gerenciamento.'
    ]
  }
};

// Compatibilidade: expõe no window se estiver no navegador.
if (typeof window !== 'undefined') {
  window.jarvisBrain = jarvisBrain;
}

// Compatibilidade: exporta em ambientes de módulos.
export { jarvisBrain };

