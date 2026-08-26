const interesses = [
  "Automação Industrial",
  "IIoT",
  "Assistência Técnica",
  "Manutenção Preditiva",
  "Agendar uma Visita",
  "Outro"
];

const SCRIPT_URL = "https://google.com";

// IMPORTANTE: Mantém exatamente o array original que o seu Google Sheets exige
const campos = [
  "nome",
  "empresa",
  "whatsapp",
  "categoria",
  "necessidade",
  "urgencia",
  "porte"
];

const perguntas = {
  nome: "Olá 👋 Seja bem-vindo à ProtoNest Automação. Para melhor atender você, recomendamos responder apenas 3 perguntas rápidas. Qual é o seu nome?",
  whatsapp: "Qual seu WhatsApp (com DDD) para contato?",
  categoria: "Qual o seu principal interesse hoje?",
  necessidade: "Qual a sua necessidade específica?"
};

let etapa = 0;
let lead = {};

// Injeta o HTML idêntico ao original com o botão de pular embutido
document.body.insertAdjacentHTML("beforeend", `
<div class="chat-overlay"></div>
<div class="chat-btn">
  <span class="desktop-chat">💬 Atendimento</span>
  <span class="mobile-chat">💬</span>
</div>
<div class="chat-window">
  <div class="chat-header" style="display: flex; justify-content: space-between; align-items: center;">
    <span>ProtoNest Assistente</span>
    <div style="display: flex; align-items: center; gap: 15px;">
      <span id="chatSkipBtn" style="font-size: 12px; background: rgba(255, 255, 255, 0.2); padding: 4px 8px; border-radius: 4px; cursor: pointer; text-transform: uppercase;">Não responder</span>
      <span class="chat-close" style="cursor: pointer; font-size: 18px; font-weight: bold;">✖</span>
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

  // Mapeia as respostas curtas para dentro do modelo de dados exigido pela sua planilha
  if (etapa === 0) {
    lead["nome"] = valor;
    lead["empresa"] = "ProtoNest QR"; // Preenche automático
    etapa = 2; // Pula direto para o WhatsApp
    bot(perguntas.whatsapp);
  } else if (etapa === 2) {
    lead["whatsapp"] = valor;
    etapa = 3; // Vai para o interesse (categoria)
    bot(perguntas.categoria);
    mostrarBotoes(interesses);
  } else if (etapa === 3) {
    lead["categoria"] = valor; // Salva o interesse na coluna categoria da planilha
    
    if (valor === "Outro") {
      etapa = 4; // Abre a pergunta oculta se for outro
      bot(perguntas.necessidade);
    } else {
      lead["necessidade"] = "Preenchido via Opção Direta";
      lead["urgencia"] = "Não aplicável";
      lead["porte"] = "Não informado";
      finalizar();
    }
  } else if (etapa === 4) {
    lead["necessidade"] = valor;
    lead["urgencia"] = "Não aplicável";
    lead["porte"] = "Não informado";
    finalizar();
  }

  input.value = "";
}

async function finalizar() {
  lead.dataHora = new Date().toLocaleString("pt-BR");
  
  bot("🤖 Guardando seus dados de contato...");

  // Envia o JSON exatamente como o código do IEL fazia antes
  fetch(SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead)
  }).catch(err => console.log("Erro enviado:", err));

  bot(`✅ Obrigado, ${lead.nome}! Dados salvos. Direcionando você de volta...`);
  
  setTimeout(() => {
    fecharChat();
  }, 2500);
}

const input = document.getElementById("chatInput");
input.addEventListener("focus", () => {
  setTimeout(() => mensagens.scrollTop = mensagens.scrollHeight, 300);
});
