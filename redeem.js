// ==========================
//   KaynBot — STARTUP PRO
// ==========================

import chalk from "chalk";
import figlet from "figlet";
import chalkAnimation from "chalk-animation";
import readlineSync from "readline-sync";
import fs from "fs";
import path from "path";
import logger from "./logger.js";
import config from "./config.js";

const runDir = path.join("database", "run-codes");

// Crear carpeta RUN si no existe
if (!fs.existsSync(runDir)) {
    fs.mkdirSync(runDir, { recursive: true });
    logger.info("Carpeta /database/run-codes creada.");
}

// Animación simple
function animate(text, duration = 1500) {
    return new Promise((resolve) => {
        const anim = chalkAnimation.rainbow(text);
        setTimeout(() => {
            anim.stop();
            resolve();
        }, duration);
    });
}

// ASCII
function ascii(text) {
    console.log(
        chalk.cyan(
            figlet.textSync(text, {
                font: "Ghost",
                horizontalLayout: "default"
            })
        )
    );
}

// GENERADOR DE RUN-CODES (NO requiere creds.json)
function createRunRequest(number) {
    const code = Math.floor(10000000 + Math.random() * 90000000).toString();
    const file = path.join(runDir, `${code}.json`);

    const request = {
        runCode: code,
        number,
        createdAt: new Date().toISOString(),
        status: "pending" // redeem.js la cambiará a "validated"
    };

    fs.writeFileSync(file, JSON.stringify(request, null, 2));

    return code;
}

// PANTALLA PRINCIPAL
export async function startScreen() {
    console.clear();

    ascii("Kayn");
    ascii("Bot");

    console.log(chalk.blueBright(`Creado por ${config.ownerName}\n`));
    await animate(chalk.yellow("Bienvenido a KaynBot v1.0"));

    console.log(chalk.cyan("Selecciona el método de inicio:\n"));
    console.log(chalk.green("1 → Vincular con QR"));
    console.log(chalk.magenta("2 → Solicitar Run-Code\n"));

    const option = readlineSync.question("Opción (1/2): ").trim();

    let authMethod = "qr";
    let runCode = null;

    switch (option) {
        case "2": {
            authMethod = "run";

            console.log("\n📱 Ingrese el número que desea vincular (sin +):");
            const number = readlineSync.question("Número: ").trim();

            if (!number.match(/^[0-9]{8,15}$/)) {
                console.log("\n❌ Número inválido.");
                process.exit(1);
            }

            runCode = createRunRequest(number);

            console.log(
                chalk.green(`\n✔ Solicitud creada para el número ${number}`)
            );
            console.log(
                chalk.yellow(`✔ Código RUN generado: ${runCode}`)
            );
            console.log(
                chalk.cyan(
                    "\n📨 Entrega este código al Owner para validarlo con:\n" +
                    "   node redeem.js\n"
                )
            );

            console.log(chalk.magenta("⏳ Esperando a que el Owner valide el código…\n"));

            break;
        }

        default:
            console.log(chalk.yellow("\n✔ Se usará autenticación por QR.\n"));
            break;
    }

    logger.handler(`Método seleccionado: ${authMethod.toUpperCase()}`);

    // devolvemos datos a index.js
    return { authMethod, runCode };
}

export { createRunRequest };
