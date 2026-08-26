const interesses = [
  "Automação Industrial",
  "IIoT",
  "Assistência Técnica",
  "Manutenção Preditiva",
  "Agendar uma Visita",
  "Outro"
];

const SCRIPT_URL = "https://google.com";

const campos = ["nome", "whatsapp", "interesse", "necessidade"];

const perguntas = {
  nome: "Olá 👋 Seja bem-vindo à ProtoNest Automação. Para melhor atender você, recomendamos responder apenas 3 perguntas rápidas. Qual é o seu nome?",
  whatsapp: "Qual seu WhatsApp com DDD?",
  interesse: "Qual o seu principal interesse hoje?",
  necessidade: "Qual a sua necessidade específica?"
};

let etapa = 0;
let lead = {};

document.body.insertAdjacentHTML("beforeend", `
<div class="chat-overlay"></div>
<div class="chat-btn">
  <span class="desktop-chat">💬 Atendimento</span>
  <span class="mobile-chat">💬</span>
</div>
<div class="chat-window">
  <div class="chat-header">
    <span>ProtoNest Automação</span>
    <div class="chat-header-actions">
      <span class="chat-skip" id="chatSkipBtn">Não responder</span>
      <span class="chat-close">✖</span>
    </div>
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
const pular = document.getElementById("chatSkipBtn");
const overlay = document.querySelector(".chat-overlay");

function fecharChat() {
  overlay.style.display = "none";
  janela.style.display = "none";
  etapa = 0;
  lead = {};
  mensagens.innerHTML = "";
}

fechar.onclick = fecharChat;
pular.onclick = fecharChat;

btn.onclick = () => {
  overlay.style.display = "block";
  janela.style.display = "flex";
  if (mensagens.innerHTML === "") bot(perguntas.nome);
};

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
  etapa++;

  if (campos[etapa - 1] === "interesse" && valor !== "Outro") {
    lead.necessidade = "Preenchido via Opção Direta";
    etapa = campos.length; 
  }

  if (etapa < campos.length) {
    bot(perguntas[campos[etapa]]);
    if (campos[etapa] === "interesse") mostrarBotoes(interesses);
  } else {
    finalizar();
  }
}

// CORREÇÃO AQUI: Mudança do formato de envio para simular um formulário válido
async function finalizar() {
  lead.dataHora = new Date().toLocaleString("pt-BR");

  bot("🔍 Gravando seus dados...");

  // Transforma o objeto JavaScript em formato URL Form Encoded aceito pelo Apps Script
  const formData = new URLSearchParams();
  for (const param in lead) {
    formData.append(param, lead[param]);
  }

  fetch(SCRIPT_URL, {
    method: "POST",
    mode: "no-cors", // Ignora o bloqueio do navegador
    headers: { "Content-Type": "application/x-www-form-urlencoded" }, // Formato correto para no-cors
    body: formData.toString()
  }).catch(err => console.log("Erro controlado:", err));

  bot(`✅ Perfeito, ${lead.nome}! Seus dados foram salvos.`);
  
  setTimeout(() => {
    fecharChat();
  }, 2500);
}

const input = document.getElementById("chatInput");
input.addEventListener("focus", () => {
  setTimeout(() => mensagens.scrollTop = mensagens.scrollHeight, 300);
});
