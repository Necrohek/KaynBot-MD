import fs from "fs";
import path from "path";
import config from "../../config.js";
import logger from "../../logger.js";

export default {
    name: ["menu", "menú", "help", "ayuda"],
    category: "general",
    description: "Muestra el menú de comandos disponibles.",

    async execute(m, { sock }) {
        try {
            const botName = config.botName;
            const botEmoji = config.botEmoji;
            const prefix = config.prefix;

            // Ruta segura para Termux o cualquier entorno
            const logoPath = path.resolve("./media/logos/logo.jpg");

            // Si no existe la imagen, no fallará
            const image = fs.existsSync(logoPath)
                ? fs.readFileSync(logoPath)
                : null;

            const text = `
ㅤㅤ𝄙ㅤㅤㅤㅤㅤㅤ(${botEmoji})ㅤㅤ${botName}
ㅤㅤㅤ██▛▞ㅤㅤ───ㅤㅤ𝗆𝖾𝗇𝗎 ❕

📂 *GRUPO*
→ ${prefix}welcome — Bienvenida (on/off)
→ ${prefix}kick — Expulsar usuario
→ ${prefix}promote — Dar admin
→ ${prefix}demote — Quitar admin
→ ${prefix}open — Abrir grupo
→ ${prefix}close — Cerrar grupo
→ ${prefix}tagall — Mencionar a todos
→ ${prefix}hidetag / ${prefix}tag — Oculto a todos

🎵 *MEDIA*
→ ${prefix}sticker — Convertir imagen en sticker
→ ${prefix}play — Descargar audio de YouTube

🎮 *PPT*
→ ${prefix}piedra / ${prefix}papel / ${prefix}tijera

🛡️ *DUEÑO*
→ ${prefix}on / ${prefix}off — Activar o desactivar funciones
`;

            await sock.sendMessage(
                m.chat,
                image
                    ? { image, caption: text }
                    : { text: text + "\n⚠️ *No se encontró el logo.*" },
                { quoted: m }
            );

            logger.info(`Menú enviado a ${m.sender}`);

        } catch (err) {
            logger.error("Error en MENU: " + err.message);
            return m.reply("✖️ Ocurrió un error al mostrar el menú.");
        }
    }
};
