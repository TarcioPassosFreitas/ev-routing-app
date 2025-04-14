const net = require("net");
const WebSocket = require("ws");

const backendHost = "server";
const backendPort = 8888;
const bridgePort = 4000;

const tcpClient = new net.Socket();
const wss = new WebSocket.Server({ port: bridgePort });

console.log(`[BRIDGE] 🌐 WebSocket escutando em ws://0.0.0.0:${bridgePort}`);
console.log(
  `[BRIDGE] 🔌 Conectando ao backend TCP em ${backendHost}:${backendPort}...`
);

tcpClient.connect(backendPort, backendHost, () => {
  console.log(
    `[BRIDGE] ✅ TCP conectado ao backend em ${backendHost}:${backendPort}`
  );
});

wss.on("connection", (ws) => {
  console.log("[BRIDGE] 🌐 Cliente WebSocket conectado!");

  ws.on("message", (message) => {
    console.log(
      "[BRIDGE] 📦 Mensagem recebida do frontend:",
      message.toString()
    );
    tcpClient.write(message + "\n");
  });

  tcpClient.on("data", (data) => {
    try {
      const parsed = JSON.parse(data.toString());
      const type = parsed.type || "UNKNOWN";

      console.log("[BRIDGE] 📨 Mensagem recebida do backend:", parsed);
      ws.send(JSON.stringify({ type, data: parsed }));
    } catch (err) {
      console.error("[BRIDGE] ❌ Erro ao parsear resposta do backend:", err);
    }
  });

  ws.on("close", () => {
    console.log("[BRIDGE] 🔌 Cliente WebSocket desconectado.");
  });
});

tcpClient.on("close", () => {
  console.log("[BRIDGE] ⚠️ Desconectado do backend.");
});

tcpClient.on("error", (err) => {
  console.error("[BRIDGE] ❌ Erro ao conectar ao backend:", err.message);
});
