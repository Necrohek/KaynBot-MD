// logger.js — Versión PRO para KaynBot 🇪🇪
// Compatible con ESM y con config.js

import fs from "fs";
import path from "path";
import config from "./config.js";

// Crear carpeta logs si no existe
const logDir = path.resolve("logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

// Archivo de logs diarios
const logFile = path.join(
  logDir,
  `kayn-${new Date().toISOString().slice(0, 10)}.log`
);

// Colores modo hacker
const color = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",

  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
};

// Timestamp estilo militar
function timestamp() {
  return new Date().toLocaleString("es-MX", {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

// Guardar log en archivo si está activado en config
function writeToFile(type, msg) {
  if (!config.saveLogs) return;

  const line = `[${timestamp()}] [${type}] ${msg}\n`;
  fs.appendFile(logFile, line, () => {});
}

function format(type, emoji, colorCode, msg) {
  return `${color.bold}${colorCode}${emoji} ${type}${color.reset} `
    + `${color.yellow}[${timestamp()}]${color.reset} `
    + `${color.magenta}—${color.reset} ${msg}`;
}

const logger = {

  info(msg) {
    console.log(format("INFO", "❖", color.cyan, msg));
    writeToFile("INFO", msg);
  },

  warn(msg) {
    console.warn(format("WARN", "⚠", color.yellow, msg));
    writeToFile("WARN", msg);
  },

  error(msg) {
    console.error(format("ERROR", "✖", color.red, msg));
    writeToFile("ERROR", msg);
  },

  success(msg) {
    console.log(format("SUCCESS", "✔", color.green, msg));
    writeToFile("SUCCESS", msg);
  },

  debug(msg) {
    if (!config.debug) return; // solo si debug está activado
    console.log(format("DEBUG", "◆", color.magenta, msg));
    writeToFile("DEBUG", msg);
  },

  // NUEVO: logs específicos del handler
  handler(msg) {
    console.log(format("HANDLER", "⚡", color.blue, msg));
    writeToFile("HANDLER", msg);
  },

  // NUEVO: logs para comandos
  command(cmd, user) {
    const message = `Comando ejecutado: ${cmd} — Usuario: ${user}`;
    console.log(format("CMD", "➤", color.green, message));
    writeToFile("CMD", message);
  },

  // NUEVO: logs para eventos (welcome, detect, joins…)
  event(msg) {
    console.log(format("EVENT", "◆", color.cyan, msg));
    writeToFile("EVENT", msg);
  }
};

export default logger;
