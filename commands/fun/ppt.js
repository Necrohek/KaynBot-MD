import fs from "fs";
import path from "path";
import logger from "../../logger.js"; // Ajusta ruta si tu logger está en raíz

export default {
    name: ["piedra", "papel", "tijera"],
    category: "fun",
    description: "Juega piedra, papel o tijera contra el bot.",

    async execute(m, { sock, command }) {
        try {
            const usuario = command?.toLowerCase();
            const opciones = ["piedra", "papel", "tijera"];

            // Validar entrada
            if (!opciones.includes(usuario)) {
                return await sock.sendMessage(
                    m.chat,
                    {
                        text: `❗ Debes elegir *piedra*, *papel* o *tijera*.\nEjemplo:\n> *.piedra*`
                    },
                    { quoted: m }
                );
            }

            // Elección del bot
            const bot = opciones[Math.floor(Math.random() * 3)];

            // Emojis
            const emojis = {
                piedra: "🪨",
                papel: "📄",
                tijera: "✂️"
            };

            // Resultado
            let resultado;
            if (usuario === bot) {
                resultado = "🇪🇪 *Empate*";
            } else if (
                (usuario === "piedra" && bot === "tijera") ||
                (usuario === "papel" && bot === "piedra") ||
                (usuario === "tijera" && bot === "papel")
            ) {
                resultado = "😾 *Ganaste... Por hoy*";
            } else {
                resultado = "😝 *Perdiste, lerolero*";
            }

            // Texto final
            const texto = `
*🎮 Piedra, Papel o Tijera*

*Tú:* ${emojis[usuario]} ${usuario}
*Bot:* ${emojis[bot]} ${bot}

${resultado}
            `.trim();

            await sock.sendMessage(m.chat, { text: texto }, { quoted: m });

            logger.info(`Comando PPT ejecutado: usuario=${usuario}, bot=${bot}, resultado=${resultado}`);
        } catch (err) {
            logger.error(`Error en comando PPT: ${err.message}`);

            await sock.sendMessage(
                m.chat,
                { text: "⚠️ Ocurrió un error ejecutando el comando." },
                { quoted: m }
            );
        }
    }
};
