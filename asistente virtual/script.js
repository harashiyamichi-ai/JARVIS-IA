
// Referências do DOM
const statusEl = document.getElementById('status');
const chatEl = document.getElementById('chat');
const coreEl = document.getElementById('core');
const textInput = document.getElementById('textInput');
const sendBtn = document.getElementById('sendBtn');

// Variável de controle
let isAwake = false;

// ==========================================
// CONFIGURAÇÃO DE RECONHECIMENTO DE VOZ
// ==========================================
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    statusEl.innerText = "Seu navegador não suporta reconhecimento de voz. Use o Google Chrome.";
} else {
    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Continua ouvindo indefinidamente
    recognition.interimResults = false;
    recognition.lang = 'pt-BR';

    recognition.onresult = (event) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript.trim().toLowerCase();

        // Detectar Wake Word
        if (!isAwake) {
            if (transcript.includes('jarvis')) {
                wakeUp();
            }
        } else {
            // Se já estiver acordado, envia o que ouvir para a API
            if (transcript.length > 0) {
                processCommand(transcript);
            }
        }
    };

    // Reinicia automaticamente caso o reconhecimento caia (por silêncio)
    recognition.onend = () => {
        recognition.start();
    };

    // Inicia o microfone assim que a página carrega
    recognition.start();
}

function wakeUp() {
    isAwake = true;
    statusEl.innerText = "Sistemas online. Aguardando comando...";
    coreEl.classList.add('active'); // Ativa animação intensa
    speak("Sistemas online. Como posso ajudar?");
}

function sleep() {
    isAwake = false;
    statusEl.innerText = "Sistema em repouso. Diga 'Jarvis' para iniciar.";
    coreEl.classList.remove('active');
}

// ==========================================
// ÁREA DE INTEGRAÇÃO DA SUA API
// ==========================================
async function processCommand(command) {
    appendMessage(`Você: ${command}`);
    statusEl.innerText = "Processando requisição...";

    // Comando especial para fazê-lo dormir novamente
    if (
        command.includes("desativar") ||
        command.includes("dormir") ||
        command.includes("desligar")
    ) {
        speak("Desativando sistemas. Até logo.");
        sleep();
        return;
    }


    try {
        // --- INTEGRAÇÃO DA SUA API (Groq) ---
        // Nota: não é recomendado colocar API key diretamente no front-end em produção.
        // Para teste local/rápido, funciona, mas qualquer pessoa pode ver a chave no navegador.
        const response = await fetch('/api/chat', {
            headers: {
                'Content-Type': 'application/json'
            },
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

        // --- FIM DA INTEGRAÇÃO DA API (Groq via backend) ---


        appendMessage(`J.A.R.V.I.S.: ${respostaDaIA}`);
        speak(respostaDaIA);
        statusEl.innerText = "Sistemas online. Aguardando comando...";

    } catch (error) {
        console.error("Erro na API:", error);
        const errorMsg = "Desculpe, ocorreu um erro de conexão com os servidores centrais.";
        appendMessage(`J.A.R.V.I.S.: ${errorMsg}`);
        speak(errorMsg);
        statusEl.innerText = "Sistemas online. Aguardando comando...";
    }
}

// ==========================================
// FUNÇÕES AUXILIARES (FALA E CHAT)
// ==========================================
function speak(text) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    
    // Tenta encontrar uma voz que soe melhor (varia por navegador)
    const voices = synth.getVoices();
    const ptVoice = voices.find(voice => voice.lang === 'pt-BR' && voice.name.includes('Google'));
    if (ptVoice) {
        utterance.voice = ptVoice;
    }
    
    // Configurações de tom e velocidade para soar mais robótico/sério
    utterance.pitch = 0.8;
    utterance.rate = 1.1;

    synth.speak(utterance);
}

function appendMessage(message) {
    const p = document.createElement('p');
    p.innerText = message;
    chatEl.appendChild(p);
    chatEl.scrollTop = chatEl.scrollHeight; // Rola o chat para baixo
}

// Eventos para entrada por texto
sendBtn.addEventListener('click', () => {
    const text = textInput.value;
    if (text) {
        if (!isAwake) wakeUp(); // Se digitar, ele acorda automaticamente
        processCommand(text);
        textInput.value = '';
    }
});

textInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendBtn.click();
    }
});