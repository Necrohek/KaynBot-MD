import config from "../../config.js";
import logger from "../../logger.js";

export default {
    name: ["close", "cerrar"],
    category: "group",
    description: "Cierra el grupo (solo admins).",

    async execute(m, { sock, isGroupAdmins, isBotGroupAdmins }) {
        try {
            if (!m.isGroup) {
                return m.reply("✖️ Este comando solo funciona en grupos.");
            }

            if (!isGroupAdmins) {
                return m.reply("✖️ Necesitas ser admin para usar este comando.");
            }

            if (!isBotGroupAdmins) {
                return m.reply("✖️ Necesito ser admin para cerrar el grupo.");
            }

            // Cambia la configuración del grupo a Modo anuncio
            await sock.groupSettingUpdate(m.chat, "announcement");

            const senderTag = m.sender.split("@")[0];

            await sock.sendMessage(
                m.chat,
                {
                    text:
                        `🇪🇪 *Grupo cerrado*\n` +
                        `El grupo ha sido cerrado por @${senderTag}.`,
                    mentions: [m.sender]
                },
                { quoted: m }
            );

            logger.info(`Grupo cerrado por ${m.sender}`);

        } catch (error) {
            logger.error("Error en comando CLOSE: " + error.message);

            return m.reply("✖️ Ocurrió un error al cerrar el grupo.");
        }
    }
};
