let utterances = [];
let index = 0;

// Mostrar/ocultar controles
document.getElementById('abrirLeitor').addEventListener('click', () => {
  document.querySelector('.leitor-controles').classList.toggle('ativo');
});

// Função de leitura
function lerPagina() {
  const elementos = document.querySelectorAll('h1, h2, h3, p, span, button, a');
  utterances = [];
  index = 0;
  elementos.forEach(el => {
    if(el.innerText.trim() !== "") utterances.push(el.innerText);
  });
  falarProximo();
}

function falarProximo() {
  if(index < utterances.length) {
    const utterance = new SpeechSynthesisUtterance(utterances[index]);
    utterance.lang = 'pt-BR';
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onend = () => {
      index++;
      falarProximo();
    };
    window.speechSynthesis.speak(utterance);
  }
}

// Botão Ler
document.getElementById('lerPagina').addEventListener('click', () => {
  window.speechSynthesis.cancel();
  lerPagina();
});

// Botão Pausar
document.getElementById('pausarAudio').addEventListener('click', () => {
  window.speechSynthesis.pause();
});

// Botão Retomar
document.getElementById('retomarAudio').addEventListener('click', () => {
  window.speechSynthesis.resume();
});