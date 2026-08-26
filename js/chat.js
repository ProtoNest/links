const interesses = [
  "Automação Industrial",
  "IIoT",
  "Assistência Técnica",
  "Manutenção Preditiva",
  "Agendar uma Visita",
  "Outro"
];

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzjvMJiTwh8M7w5sOMx3rN008VID2qRBOpgCTNJMG4LniiJoBG4e5UqhJjgaJfAMJuJ/exec";

// Campos organizados conforme o novo fluxo
const campos = ["nome", "whatsapp", "interesse", "necessidade"];

const perguntas = {
  nome: "Olá 👋 Seja bem-vindo à ProtoNest Automação. Para melhor atender você, recomendamos responder apenas 3 perguntas rápidas. Qual é o seu nome?",
  whatsapp: "Qual seu WhatsApp (com DDD) para contato?",
  interesse: "Qual o seu principal interesse hoje?",
  necessidade: "Qual a sua necessidade específica?"
};

let etapa = 0;
let lead = {};

// Injeta a estrutura HTML na página
document.body.insertAdjacentHTML("beforeend", `
<div class="chat-overlay"></div>
<div class="chat-btn">
  <span class="desktop-chat">💬 Atendimento</span>
  <span class="mobile-chat">💬</span>
</div>
<div class="chat-window">
  <div class="chat-header">
    <span>ProtoNest Assistente</span>
    <span class="chat-close">✖</span>
  </div>
  <div class="chat-messages"></div>
  <div class="chat-input">
    <input type="text" id="chatInput" placeholder="Digite sua resposta...">
    <button id="sendBtn">Enviar</button>
  </div>
</div>
`);

const btn = document.querySelector(".chat-btn");
const janela = document.querySelector(".chat-window");
const mensagens = document.querySelector(".chat-messages");
const fechar = document.querySelector(".chat-close");
const overlay = document.querySelector(".chat-overlay");

fechar.onclick = fecharChat;

function fecharChat() {
  overlay.style.display = "none";
  janela.style.display = "none";
  etapa = 0;
  lead = {};
  mensagens.innerHTML = "";
}

btn.onclick = () => {
  overlay.style.display = "block";
  janela.style.display = "flex";
  if (mensagens.innerHTML === "") bot(perguntas.nome);
};

// Dispara sozinho 1 segundo após carregar a página
window.addEventListener("load", () => {
  setTimeout(() => {
    overlay.style.display = "block";
    janela.style.display = "flex";
    if (mensagens.innerHTML === "") bot(perguntas.nome);
  }, 1000);
});

function bot(msg) {
  mensagens.innerHTML += `<div class="bot">${msg}</div>`;
  mensagens.scrollTop = mensagens.scrollHeight;
}

function user(msg) {
  mensagens.innerHTML += `<div class="user">${msg}</div>`;
  mensagens.scrollTop = mensagens.scrollHeight;
}

function mostrarBotoes(lista) {
  let html = '<div class="opcoes">';
  lista.forEach(item => {
    html += `<button class="opcao-btn">${item}</button>`;
  });
  html += '</div>';
  mensagens.innerHTML += html;

  document.querySelectorAll(".opcao-btn").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".opcoes").forEach(op => op.remove());
      document.getElementById("chatInput").value = btn.innerText;
      enviar();
    };
  });
}

document.getElementById("sendBtn").onclick = enviar;
document.getElementById("chatInput").addEventListener("keypress", e => {
  if (e.key === "Enter") enviar();
});

function enviar() {
  const input = document.getElementById("chatInput");
  const valor = input.value.trim();
  if (!valor) return;

  user(valor);
  lead[campos[etapa]] = valor;
  input.value = "";
  
  // Avança para a próxima etapa
  etapa++;

  // Lógica da Pergunta Oculta: Se o interesse NÃO for "Outro", pula a pergunta 'necessidade'
  if (campos[etapa - 1] === "interesse" && valor !== "Outro") {
    lead.necessidade = "Não aplicável"; // Preenche por padrão para a planilha
    etapa = campos.length; // Força ir direto para o salvamento final
  }

  if (etapa < campos.length) {
    bot(perguntas[campos[etapa]]);
    if (campos[etapa] === "interesse") mostrarBotoes(interesses);
  } else {
    finalizar();
  }
}

async function finalizar() {
  lead.dataHora = new Date().toLocaleString("pt-BR");
  
  bot("🤖 Guardando seus dados de contato...");

  fetch(SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead)
  }).catch(err => console.log("Erro enviado:", err));

  bot(`✅ Obrigado, ${lead.nome}! Dados salvos. Direcionando você de volta...`);
  
  // Fecha o assistente sozinho após 3 segundos do envio
  setTimeout(() => {
    fecharChat();
  }, 3000);
}

const input = document.getElementById("chatInput");
input.addEventListener("focus", () => {
  setTimeout(() => mensagens.scrollTop = mensagens.scrollHeight, 300);
});
