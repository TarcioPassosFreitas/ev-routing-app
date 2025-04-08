const net = require("net");
const WebSocket = require("ws");

const tcpClient = new net.Socket();
const wss = new WebSocket.Server({ port: 4000 });

tcpClient.connect(8888, "127.0.0.1", () => {
  console.log("[BRIDGE] ✅ TCP conectado ao Backend na porta 8888");
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
