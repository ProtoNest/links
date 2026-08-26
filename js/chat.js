const interesses = [
  "Automação Industrial",
  "IIoT",
  "Assistência Técnica",
  "Manutenção Preditiva",
  "Agendar uma Visita",
  "Outro"
];

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyGbXj0yuCjQoc6ytfdQsHDdTT3KwZ6f2k2F5np1f83M6wMEfzwfRpSA1ytNZhE2miu8Q/exec";

const campos = [
  "nome",
  "empresa",
  "whatsapp",
  "categoria",
  "necessidade",
  "urgencia",
  "potencial"
];

// Fluxo de perguntas limpo e sem emojis
const perguntas = {
  nome: "Olá. Seja bem-vindo à ProtoNest Automação. Para melhor atender você, recomendamos responder apenas 3 perguntas rápidas. Qual é o seu nome?",
  whatsapp: "Qual seu WhatsApp (com DDD) para contato?",
  categoria: "Qual o seu principal interesse hoje?",
  necessidade: "Qual a sua necessidade específica?"
};

let etapa = 0;
let lead = {};

// Injeta a estrutura HTML com design moderno escuro e sem emojis nos botões de controle
document.body.insertAdjacentHTML("beforeend", `
<div class="chat-overlay"></div>
<div class="chat-btn" style="background: #1f2937; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
  <span class="desktop-chat">Atendimento</span>
  <span class="mobile-chat">Atendimento</span>
</div>
<div class="chat-window" style="background: #1e1e1e; border: 1px solid #333333;">
  <div class="chat-header" style="display: flex; justify-content: space-between; align-items: center; background: #111111; border-bottom: 1px solid #333333;">
    <span>🤖 ProtoNest Assistente</span>
    <div style="display: flex; align-items: center; gap: 15px;">
      <span id="chatSkipBtn" style="font-size: 12px; background: rgba(255, 255, 255, 0.1); padding: 4px 8px; border-radius: 4px; cursor: pointer; text-transform: uppercase; color: #a0aec0;">Não responder</span>
      <span class="chat-close" style="cursor: pointer; font-size: 18px; font-weight: bold; color: #a0aec0;">✖</span>
    </div>
  </div>
  <div class="chat-messages" style="background: #141414;"></div>
  <div class="chat-input" style="border-top: 1px solid #333333; background: #111111;">
    <input type="text" id="chatInput" placeholder="Digite sua resposta..." style="background: #262626; color: #ffffff; border: 1px solid #444444; border-radius: 4px; padding: 10px;">
    <button id="sendBtn" style="background: #5897fb; color: white;">Enviar</button>
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

// Balões de mensagens customizados para o estilo dark moderno
function bot(msg) {
  mensagens.innerHTML += `<div class="bot" style="background: #262626; border: 1px solid #3a3a3a; color: #ffffff; padding: 10px; border-radius: 8px; margin-bottom: 10px; line-height: 1.5; align-self: flex-start; max-width: 85%;">${msg}</div>`;
  mensagens.scrollTop = mensagens.scrollHeight;
}

function user(msg) {
  mensagens.innerHTML += `<div class="user" style="background: #5897fb; color: white; padding: 10px; border-radius: 8px; margin-bottom: 10px; text-align: left; line-height: 1.5; align-self: flex-end; max-width: 85%; margin-left: auto;">${msg}</div>`;
  mensagens.scrollTop = mensagens.scrollHeight;
}

function mostrarBotoes(lista) {
  let html = '<div class="opcoes" style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; margin-bottom: 10px;">';
  lista.forEach(item => {
    html += `<button class="opcao-btn" style="background: #2d3748; color: white; border: 1px solid #4a5568; padding: 8px 12px; border-radius: 20px; cursor: pointer; font-size: 12px; transition: .2s;">${item}</button>`;
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

  if (etapa === 0) {
    lead["nome"] = valor;
    lead["empresa"] = "ProtoNest QR"; 
    etapa = 2; 
    bot(perguntas.whatsapp);
  } else if (etapa === 2) {
    lead["whatsapp"] = valor;
    etapa = 3; 
    bot(perguntas.categoria);
    mostrarBotoes(interesses);
  } else if (etapa === 3) {
    lead["categoria"] = valor; 
    
    if (valor === "Outro") {
      etapa = 4; 
      bot(perguntas.necessidade);
    } else {
      lead["necessidade"] = "Preenchido via Opção Direta";
      lead["urgencia"] = "Não aplicável";
      lead["potencial"] = "Não informado";
      finalizar();
    }
  } else if (etapa === 4) {
    lead["necessidade"] = valor;
    lead["urgencia"] = "Não aplicável";
    lead["potencial"] = "Não informado";
    finalizar();
  }

  input.value = "";
}

async function finalizar() {
  lead.dataHora = new Date().toLocaleString("pt-BR");
  
  bot("Processando seus dados de contato...");

  fetch(SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead)
  }).catch(err => console.log("Erro enviado:", err));

  bot(`Obrigado, ${lead.nome}. Seus dados foram guardados.`);
  
  setTimeout(() => {
    fecharChat();
  }, 2500);
}

const input = document.getElementById("chatInput");
input.addEventListener("focus", () => {
  setTimeout(() => mensagens.scrollTop = mensagens.scrollHeight, 300);
});

