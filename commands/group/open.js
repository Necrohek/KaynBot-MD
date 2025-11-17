import logger from "../../logger.js";

export default {
    name: ["open", "abrir"],
    category: "group",
    description: "Abre el grupo y permite que todos escriban.",

    async execute(m, { sock, isGroupAdmins, isBotGroupAdmins }) {
        try {

            if (!m.isGroup) {
                return m.reply("✖️ Este comando solo funciona en grupos.");
            }

            if (!isGroupAdmins) {
                return m.reply("✖️ Necesitas ser administrador para usar *open*.");
            }

            if (!isBotGroupAdmins) {
                return m.reply("✖️ Necesito permisos de administrador para abrir el grupo.");
            }

            await sock.groupSettingUpdate(m.chat, "not_announcement");

            await sock.sendMessage(
                m.chat,
                {
                    text: `🇪🇪 *Grupo abierto*\nEl grupo ha sido abierto por @${m.sender.split("@")[0]}.`,
                    mentions: [m.sender]
                },
                { quoted: m }
            );

            logger.info(`Grupo ${m.chat} abierto por ${m.sender}`);

        } catch (err) {
            logger.error("Error en OPEN: " + err.message);
            return m.reply("✖️ Ocurrió un error al abrir el grupo.");
        }
    }
};
