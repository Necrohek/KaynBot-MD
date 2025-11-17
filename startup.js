import chalk from "chalk";
import figlet from "figlet";
import chalkAnimation from "chalk-animation";
import readline from "readline";
import fs from "fs";
import path from "path";
import logger from "./logger.js";
import config from "./config.js";

const runDir = path.join("database", "run-codes");
if (!fs.existsSync(runDir)) fs.mkdirSync(runDir, { recursive: true });

// readline promisificado
function ask(query) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(query, ans => { rl.close(); resolve(ans.trim()); }));
}

function animateText(text, duration = 2000) {
  return new Promise(resolve => {
    const anim = chalkAnimation.rainbow(text);
    setTimeout(() => { anim.stop(); resolve(); }, duration);
  });
}

function printAscii(text) {
  console.log(chalk.cyan(figlet.textSync(text, { font: "Ghost", horizontalLayout: "default", verticalLayout: "default" })));
}

// Genera RUN-CODE y lo guarda
export function generateRunCode(creds) {
  const code = Math.floor(10000000 + Math.random() * 90000000).toString();
  fs.writeFileSync(path.join(runDir, `${code}.json`), JSON.stringify(creds, null, 2));
  return code;
}

// Pantalla de inicio
export async function startScreen() {
  console.clear();
  printAscii("Kayn");
  printAscii("Bot");

  console.log(chalk.blueBright(`Creado por ${config.ownerName}\n`));
  await animateText(chalk.yellow("Bienvenido a KaynBot v1.0"), 1500);

  console.log(chalk.cyan("Selecciona el método de vinculación:\n"));
  console.log(chalk.green("1 → QR (recomendado)"));
  console.log(chalk.magenta("2 → Vincular con número (RUN-Code Oficial)\n"));

  const option = await ask("Opción (1/2): ");
  let authMethod = option === "2" ? "run" : "qr";

  logger.handler(`Método seleccionado: ${authMethod.toUpperCase()}`);
  return { authMethod };
}
