// index.js — KaynBot v1.0 PRO Edition 🇪🇪

import { loadCommands, attachCommandHandler } from './lib/commandLoader.js';
import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import P from "pino";

import config from "./config.js";
import logger from "./logger.js";
import { startScreen } from "./startup.js";

const commands = new Map();

// ----------------------------------------------------------
// CARGADOR DE COMANDOS
// ----------------------------------------------------------

async function loadAllCommands(dir = "./commands") {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const full = path.join(dir, file);

    if (fs.lstatSync(full).isDirectory()) {
      await loadAllCommands(full);
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

// ----------------------------------------------------------
// DATABASE HELPERS
// ----------------------------------------------------------

const getJSON = (file) =>
  fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : {};

const getDisabled = () => getJSON("./database/disabled.json");
const getDetect = () => getJSON("./database/detect.json");

// ----------------------------------------------------------
// INICIO PRINCIPAL DEL BOT
// ----------------------------------------------------------

async function startBot() {

  // Cargar comandos antes de iniciar el socket
  await loadAllCommands();
  console.log("✔ Comandos cargados correctamente.");

  if (!fs.existsSync("auth")) fs.mkdirSync("auth", { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState("auth");

  const { authMethod } = await startScreen(state);
  const isUsingRun = authMethod === "run";

  // ==========================================
  //          MODO RUN-CODE
  // ==========================================

  if (isUsingRun) {

    console.log("\n📞 Vinculación por número seleccionada.");
    console.log("Escribe tu número en formato internacional:");
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
        return process.exit(1)
