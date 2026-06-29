document.addEventListener('DOMContentLoaded', () => {
  // Referências do DOM
  const statusEl = document.getElementById('status');
  const chatEl = document.getElementById('chat');
  const coreEl = document.getElementById('core');
  const textInput = document.getElementById('textInput');
  const sendBtn = document.getElementById('sendBtn');

  if (!statusEl || !chatEl || !coreEl || !textInput || !sendBtn) {
    console.error('[JARVIS] Elementos do DOM não encontrados. Verifique os IDs no index.html');
    return;
  }

  let isAwake = false;
  let recognition = null;
  let recognitionStarted = false;

  function wakeUp() {
    isAwake = true;
    statusEl.innerText = 'Sistemas online. Aguardando comando...';
    coreEl.classList.add('active');
    speak('Sistemas online. Como posso ajudar?');
  }

  function sleep() {
    isAwake = false;
    statusEl.innerText = "Sistema em repouso. Diga 'Jarvis' para iniciar.";
    coreEl.classList.remove('active');
  }

  async function processCommand(command) {
    appendMessage(`Você: ${command}`);
    statusEl.innerText = 'Processando requisição...';

    // Comando especial para fazê-lo dormir novamente
    if (command.includes('desativar') || command.includes('dormir') || command.includes('desligar')) {
      speak('Desativando sistemas. Até logo.');
      sleep();
      return;
    }

    try {
      // Importante: seu backend api/chat.js espera { mensagem }
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensagem: command })
      });


      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`Erro no servidor (${response.status}): ${errorText}`.trim());
      }

      const data = await response.json();
      const respostaDaIA = data?.resposta;

      if (!respostaDaIA) {
        throw new Error('Resposta inválida do servidor: faltou data.resposta');
      }

      appendMessage(`J.A.R.V.I.S.: ${respostaDaIA}`);
      speak(respostaDaIA);
      statusEl.innerText = 'Sistemas online. Aguardando comando...';
    } catch (error) {
      console.error('Erro na API:', error);
      const errorMsg = 'Desculpe, ocorreu um erro de conexão com os servidores centrais.';
      appendMessage(`J.A.R.V.I.S.: ${errorMsg}`);
      speak(errorMsg);
      statusEl.innerText = 'Sistemas online. Aguardando comando...';
    }
  }

  function speak(text) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';

    const voices = synth.getVoices();
    const ptVoice = voices.find((voice) => voice.lang === 'pt-BR' && voice.name.includes('Google'));
    if (ptVoice) utterance.voice = ptVoice;

    utterance.pitch = 0.8;
    utterance.rate = 1.1;

    synth.speak(utterance);
  }

  function appendMessage(message) {
    const p = document.createElement('p');
    p.innerText = message;
    chatEl.appendChild(p);
    chatEl.scrollTop = chatEl.scrollHeight;
  }

  // Reconhecimento de voz
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    statusEl.innerText = 'Seu navegador não suporta reconhecimento de voz. Use o Google Chrome.';
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = 'pt-BR';

  recognition.onresult = (event) => {
    const last = event.results.length - 1;
    const transcript = event.results[last][0].transcript.trim().toLowerCase();

    if (!transcript) return;

    if (!isAwake) {
      if (transcript.includes('jarvis')) wakeUp();
    } else {
      processCommand(transcript);
    }
  };

  recognition.onend = () => {
    // Evita “não controlado”/loop agressivo: só reinicia se já foi iniciado.
    recognitionStarted = false;
    if (isAwake || true) {
      // continua tentando manter ativo (pode ser ajustado)
      startRecognitionSafe();
    }
  };

  function startRecognitionSafe() {
    if (!recognition) return;
    if (recognitionStarted) return;

    try {
      recognition.start();
      recognitionStarted = true;
    } catch (e) {
      // Alguns navegadores lançam quando start é chamado em estado inválido.
      recognitionStarted = false;
    }
  }

  // Inicia ao carregar
  startRecognitionSafe();

  // Entrada por texto
  sendBtn.addEventListener('click', () => {
    const text = textInput.value.trim();
    if (!text) return;

    if (!isAwake) wakeUp();
    processCommand(text);
    textInput.value = '';
  });

  textInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendBtn.click();
  });
});

