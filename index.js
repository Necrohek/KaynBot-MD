import { loadCommands, attachCommandHandler } from './lib/commandLoader.js';
// index.js — KaynBot v1.0 PRO Edition 🇪🇪
import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import P from "pino";

import config from "./config.js";
import logger from "./logger.js";
import { startScreen } from "./startup.js";

// ----------------------------------------------------------
// CARGADOR DE COMANDOS
// ----------------------------------------------------------

const commands = new Map();

async function loadCommands(dir = "./commands") {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const full = path.join(dir, file);

    if (fs.lstatSync(full).isDirectory()) {
      await loadCommands(full);
      continue;
    }

    if (!file.endsWith(".js")) continue;

    try {
      const moduleURL = pathToFileURL(full).href;
      const cmdModule = await import(moduleURL);

      for (const key in cmdModule) {
        const cmd = cmdModule[key];
        if (!cmd?.name) continue;

        if (Array.isArray(cmd.name)) {
          cmd.name.forEach(n => commands.set(n.toLowerCase(), cmd));
        } else {
          commands.set(cmd.name.toLowerCase(), cmd);
        }
      }

      logger.success(`Comando cargado: ${file}`);

    } catch (err) {
      logger.error(`Error cargando comando ${file}: ${err}`);
    }
  }
}

await loadCommands();

// ----------------------------------------------------------
// DATABASE HELPERS
// ----------------------------------------------------------

const getJSON = (file) =>
  fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : {};

const getDisabled = () => getJSON("./database/disabled.json");
const getDetect = () => getJSON("./database/detect.json");


// ----------------------------------------------------------
// INICIO
// ----------------------------------------------------------

async function startBot() {

  if (!fs.existsSync("auth")) fs.mkdirSync("auth", { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState("auth");

  const { authMethod } = await startScreen(state);
  const isUsingRun = authMethod === "run";

  // ==========================================
  //       RUN-CODE: Vincular por número
  // ==========================================
  if (isUsingRun) {

    console.log("\n📞 Vinculación por número seleccionada.");
    console.log("Escribe tu número en formato internacional, ej:");
    console.log("👉 +521234567890\n");

    const readline = await import("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question("> Tu número: ", async (phone) => {
      phone = phone.trim();

      if (!/^\+?\d{8,15}$/.test(phone)) {
        console.log("\n❌ Número inválido.");
        rl.close();
        return process.exit(1);
      }

      console.log(`\n📲 Número ingresado: ${phone}`);
      console.log("🔑 Solicitando RUN-CODE a WhatsApp...\n");

      try {

      const sock = makeWASocket({
        logger: P({ level: "silent" })
  await loadCommands();
  attachCommandHandler(sock);
,
        auth: state,
        printQRInTerminal: false,
        browser: ["KaynBot", "Chrome", "1.0"],
        usePairingCode: true
      });

      sock.ev.on("creds.update", saveCreds);

      sock.ev.on("connection.update", ({ connection, pairingCode }) => {

        if (pairingCode) {
          console.log("\n========================================");
          console.log("        🔐 TU CÓDIGO RUN (PAIR)         ");
          console.log("========================================\n");
          console.log("➡ Ingresa este código en tu WhatsApp:");
          console.log(`\n🔑  ${pairingCode}\n`);
          console.log("📱 Ajustes → Dispositivos vinculados → Vincular con código.\n");
        }

        if (connection === "open") {
          logger.success("✔ KaynBot vinculado correctamente con RUN-CODE.");
        }

        if (connection === "close") {
          logger.warn("⚠ Conexión cerrada. Ejecuta nuevamente para reconectar RUN.");
        }
      });

    } catch (err) {
      console.log("\n❌ Error generando el RUN-CODE:");
      console.log(err.message);
      process.exit(1);
    }
      
    });

    return; // prevenimos continuar hacia QR
  }

  // ==========================================
  //                MODO QR NORMAL
  // ==========================================

  const sock = makeWASocket({
    logger: P({ level: "silent" })
  await loadCommands();
  attachCommandHandler(sock);
,
    auth: state,
    printQRInTerminal: true,
    browser: ["KaynBot", "Chrome", "1.0"]
  });

  sock.ev.on("creds.update", saveCreds);

  // ----------------------------------------------------------
  // EVENTO: detect (cambio de título)
  // ----------------------------------------------------------
  sock.ev.on("groups.update", async update => {
    try {
      const db = getDetect();
      const info = update[0];

      if (!info.subject) return;
      if (!db[info.id]) return;

      const text = `📢 *Nuevo título:*\n${info.subject}\n\n🇪🇪 Detect activo.`;

      await sock.sendMessage(info.id, { text });
      logger.event(`Detect → ${info.id}`);

    } catch (e) {
      logger.error("Error detect: " + e);
    }
  });

  // ----------------------------------------------------------
  // EVENTO: welcome
  // ----------------------------------------------------------

  sock.ev.on("group-participants.update", async update => {
    if (update.action !== "add") return;

    try {
      const disabled = getDisabled();
      if (disabled["welcome"]) return;

      const welcomeDB = getJSON("./database/welcome.json");
      let text = welcomeDB.message;

      const user = update.participants[0];
      text = text.replace(/@user/gi, `@${user.split("@")[0]}`);

      await sock.sendMessage(update.id, {
        text,
        mentions: [user]
      });

      logger.event(`Welcome → ${update.id}`);

    } catch (e) {
      logger.error("Error welcome: " + e);
    }
  });

  // ----------------------------------------------------------
  // EVENTO: MENSAJES — Handler
  // ----------------------------------------------------------

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0];
    if (!m.message) return;

    const from = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;
    const isGroup = from.endsWith("@g.us");

    m.text =
      m.message.conversation ||
      m.message.extendedTextMessage?.text ||
      m.message.imageMessage?.caption ||
      "";

    if (!m.text.startsWith(config.prefix)) return;

    const args = m.text.slice(config.prefix.length).trim().split(/\s+/);
    const name = args.shift().toLowerCase();

    const cmd = commands.get(name);
    if (!cmd) return;

    const disabled = getDisabled();
    if (disabled[name]) {
      return sock.sendMessage(from, {
        text: `✖️ El comando *${name}* está desactivado.`
      });
    }

    const metadata = isGroup ? await sock.groupMetadata(from) : null;

    const isGroupAdmins = isGroup &&
      metadata.participants.some(p =>
        p.id === sender &&
        (p.admin === "admin" || p.admin === "superadmin")
      );

    const isBotGroupAdmins = isGroup &&
      metadata.participants.some(p =>
        p.id === sock.user.id &&
        (p.admin === "admin" || p.admin === "superadmin")
      );

    m.reply = (text) =>
      sock.sendMessage(from, { text }, { quoted: m });

    try {
      await cmd.run({
        sock,
        m,
        args,
        text: args.join(" "),
        isGroup,
        isGroupAdmins,
        isBotGroupAdmins
      });

      logger.command(name, sender);

    } catch (e) {
      logger.error("Error comando: " + e);
      m.reply("✖️ Error ejecutando el comando.");
    }
  });

  // ----------------------------------------------------------
  // RECONEXIÓN
  // ----------------------------------------------------------

  sock.ev.on("connection.update", ({ connection }) => {

    if (connection === "open") {
      logger.success("✔ KaynBot está listo.");
    }

    if (connection === "close") {
      logger.warn("❌ Conexión cerrada, reconectando...");
      startBot();
    }
  });
}

startBot();
