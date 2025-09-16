const API_KEY = "AIzaSyCZ3zheBBuPZ3-PzO9KnFc7_7jZrtAGAI0";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

const chatInput = document.querySelector("#chat-input");
const chatMessages = document.querySelector("#chat-mensagens");
const chatForm = document.querySelector("#chat-form");
const botaoVoz = document.querySelector("#botao-voz");
const botaoPause = document.querySelector("#botao-pause");

const historico = [{
    role: "user",
    parts: [{"text": "Você é um especialista apenas em viagens, turismo e hospedagens com foco em acessibilidade apenas no territorio brasileiro (Não precisa explicar isso). Sempre que for indicar nomes de praias, hoteis, pontos turisticos dentro dos estados, coloque ele entre parenteses, apenas 1 lugar por parenteses e com o endereço completo o suficiente para achar no maps, e deixe sua resposta resumida com paragrafos e topicos. Sempre no final convide o usuario a especificar mais ainda oque ele quer. "}]
}]

let inputVoz = false;
let pausado = false;

// ==========================================================
// Funções para o chat
// ==========================================================

function adicionarMensagemChat(mensagem, remetente) {
    const ElementoDaMensagem = document.createElement("div")
    ElementoDaMensagem.classList.add("message", `${remetente}-message`);
    ElementoDaMensagem.innerHTML = mensagem;
    chatMessages.appendChild(ElementoDaMensagem);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function limparChatInput() {
    chatInput.value = "";
}

// ==========================================================
// Funções e estrutura da Voz
// ==========================================================

// texto para fala
function falarMensagem(texto) {
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'pt-BR';

    utterance.onend = () => {
        pausado = false;
    };

    window.speechSynthesis.speak(utterance);
}

// fala para texto
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;

if (window.SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false; 
    recognition.maxAlternatives = 1; 

    recognition.onresult = (event) => {
        const transcricao = event.results[0][0].transcript.trim();
        if (transcricao) {
            inputVoz = true;
            adicionarMensagemChat(transcricao, "user");
            respostaGemini(transcricao);
        }
    };

    recognition.onerror = (event) => {
        console.error("Erro no reconhecimento de fala:", event.error);
        if (event.error !== "no-speech") {
            adicionarMensagemChat("Oops! Não consegui te ouvir. Tente novamente.", "bot");
        }
    };

    recognition.onend = () => {
        botaoVoz.classList.remove("recording");
        console.log("Reconhecimento de fala finalizado.");
    };

    botaoVoz.addEventListener("click", () => {
        try {
            recognition.start();
            botaoVoz.classList.add("recording");
            console.log("Reconhecimento de fala iniciado...");
        } catch (e) {
            console.error("Erro ao iniciar o reconhecimento:", e);
        }
    });

    

    botaoPause.addEventListener("click", () => {

        const iconePause = botaoPause.querySelector("#icone-pause"); 

        if (speechSynthesis.speaking) {
            if (speechSynthesis.paused) {
            speechSynthesis.resume();
            pausado = false;
            iconePause.src="../Img/ia/pause.png";
            iconePause.alt="";
        } else {
            speechSynthesis.pause();
            pausado = true;
            iconePause.src="../Img/ia/play.png";
            iconePause.alt="";
            }
        }
    });

} else {
    console.log("Seu navegador não suporta a Web Speech API.");
    if (botaoVoz) {
        botaoVoz.style.display = "none";
        botaoPause.style.display = "none";
    }
}

// ==========================================================
// Maps
// ==========================================================
let map;
const markers = [];

function initMap() {
    map = new google.maps.Map(document.getElementById("maps"), {
        center: { lat: -15.7942, lng: -47.8825 },
        zoom: 4,
    });
}

function extrairLocais(texto) {
    const regex = /\((.*?)\)/g;
    const locaisEncontrados = [];
    let match;
    while ((match = regex.exec(texto)) !== null) {
        locaisEncontrados.push(match[1]);
    }
    return locaisEncontrados;
}

function adicionarMarcadoresNoMapa(locais) {
    const geocoder = new google.maps.Geocoder();
    const delay = 1000;

    locais.forEach((local, index) => {
        setTimeout(() => {
            geocoder.geocode({ 'address': `${local}, Brasil` }, (results, status) => {
                if (status === 'OK') {
                    const marker = new google.maps.Marker({
                        map: map,
                        position: results[0].geometry.location,
                        title: local,
                        animation: google.maps.Animation.DROP
                    });
                    markers.push(marker);
                } else {
                    console.log('Geocodificação falhou pelo seguinte motivo: ' + status);
                }
            });
        }, index * delay);
    });
}

function limparMarcadores() {
    markers.forEach(marker => marker.setMap(null));
    markers.length = 0;
}

// ==========================================================
// Estrutura da resposta da IA
// ==========================================================

const respostaGemini = async (userInput) => {
    historico.push({
        role: "user",
        parts: [{ "text": userInput }]
    })

    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: historico
        })
    }
    try {
        const response = await fetch(API_URL, requestOptions);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error.menssage);

        const geminiResponseText = data.candidates[0].content.parts[0].text;

        historico.push({
            role: "model",
            parts: [{ text: geminiResponseText }]
        });

        const locais = extrairLocais(geminiResponseText);
        adicionarMarcadoresNoMapa(locais);

        const respostaHtml = marked.parse(geminiResponseText)
        adicionarMensagemChat(respostaHtml, "bot");
    
        if (inputVoz) {
            const textoParaVoz = geminiResponseText.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*/g, '').replace(/#/g, '').replace(/(\r\n|\n|\r)/gm, ' ');
            falarMensagem(textoParaVoz);
        }

        inputVoz = false; 

    } catch (error) {
        console.log(error);
        adicionarMensagemChat("Oops! Algo deu errado. Tente novamente.", "bot");

        if (inputVoz) {
            falarMensagem("Oops! Algo deu errado. Tente novamente.");
        }
        
        inputVoz = false;
    }
}

// ==========================================================
// Ativadores
// ==========================================================

chatInput.addEventListener("keydown", (e) => {
    const userInput = e.target.value.trim();
    if (e.key === "Enter" && userInput) {
        e.preventDefault();
        inputVoz = false;
        adicionarMensagemChat(userInput, "user");
        limparChatInput();
        respostaGemini(userInput);
    } else if (e.key === "Enter" && !userInput) {
        e.preventDefault();
    }
});

chatForm.addEventListener("submit", (e) => {
    const userInput = chatInput.value.trim();
    if (userInput) {
        e.preventDefault();
        inputVoz = false;
        adicionarMensagemChat(userInput, "user");
        limparChatInput();
        respostaGemini(userInput);
    } else {
        e.preventDefault();
    }
});