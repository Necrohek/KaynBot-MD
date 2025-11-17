import config from "../../config.js";
import logger from "../../logger.js";

export default {
    name: ["demote", "deladmin", "quitaradmin"],
    category: "group",
    description: "Quita el rol de administrador a un miembro del grupo.",
    use: ".demote @usuario o respondiendo a un mensaje",

    async execute(m, { sock, args, isGroupAdmins, isBotGroupAdmins }) {
        try {
            // Validar grupo
            if (!m.isGroup) {
                return m.reply("✖️ Este comando solo funciona en grupos.");
            }

            // Verificar si el usuario que usa el comando es admin
            if (!isGroupAdmins && !config.ownerNumbers.includes(m.sender.split("@")[0])) {
                return m.reply("✖️ Solo los administradores pueden usar este comando.");
            }

            // Verificar si el bot es admin
            if (!isBotGroupAdmins) {
                return m.reply("✖️ Necesito ser administrador para ejecutar este comando.");
            }

            // Obtener info del grupo
            const groupMetadata = await sock.groupMetadata(m.chat);
            const participants = groupMetadata.participants;

            let target;

            // ✓ 1. Usuario citado
            if (m.message?.extendedTextMessage?.contextInfo?.participant) {
                target = m.message.extendedTextMessage.contextInfo.participant;
            }

            // ✓ 2. Mención @usuario
            else if (args[0]?.startsWith("@")) {
                target = args[0].replace("@", "") + "@s.whatsapp.net";
            }

            // ✓ Si no hay objetivo
            if (!target) {
                return m.reply("❗ Debes mencionar a un usuario o responder a su mensaje.");
            }

            // Verificar si existe en el grupo
            const participant = participants.find(p => p.id === target);

            if (!participant) {
                return m.reply("✖️ El usuario no está en el grupo.");
            }

            // Prevenir degradar al dueño real del grupo
            if (participant.admin === "superadmin") {
                return m.reply("✖️ No puedes degradar al creador del grupo.");
            }

            // Verificar si ya es miembro normal
            if (!participant.admin) {
                return m.reply("⚠️ Ese usuario ya no es administrador.");
            }

            // Ejecutar degradación
            await sock.groupParticipantsUpdate(m.chat, [target], "demote");

            await sock.sendMessage(
                m.chat,
                {
                    text: `🇪🇪 *Administrador degradado*\n\n@${target.split("@")[0]} ha perdido sus privilegios.`,
                    mentions: [target]
                },
                { quoted: m }
            );

            logger.info(`Usuario ${target} degradado por ${m.sender} en ${m.chat}`);

        } catch (err) {
            logger.error("Error en comando DEMOTE: " + err.message);
            return m.reply("✖️ Ocurrió un error al degradar al usuario.");
        }
    }
};
