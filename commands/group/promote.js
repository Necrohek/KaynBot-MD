import config from "../../config.js";
import logger from "../../logger.js";

export default {
    name: ["promote", "addadmin", "daradmin"],
    category: "group",
    description: "Otorga permisos de administrador a un miembro.",

    async execute(m, { sock, args, isGroupAdmins, isBotGroupAdmins }) {
        try {
            // Validar grupo
            if (!m.isGroup) {
                return m.reply("✖️ Este comando solo funciona en grupos.");
            }

            // Validar admin
            if (!isGroupAdmins) {
                return m.reply("✖️ Solo los administradores pueden promover usuarios.");
            }

            // Validar admin bot
            if (!isBotGroupAdmins) {
                return m.reply("✖️ Necesito permisos de administrador para promover.");
            }

            // Obtener metadata del grupo
            const group = await sock.groupMetadata(m.chat);
            const participants = group.participants;

            let target;

            // 1️⃣ Usuario citado
            if (m.quoted?.sender) {
                target = m.quoted.sender;
            }

            // 2️⃣ @mención
            else if (m.mentionedJid?.length) {
                target = m.mentionedJid[0];
            }

            // 3️⃣ Número manual
            else if (args[0]) {
                const number = args[0].replace(/[^0-9]/g, "");
                if (number.length > 5) {
                    target = number + "@s.whatsapp.net";
                }
            }

            if (!target) {
                return m.reply("❗ Menciona a un usuario o responde a su mensaje.");
            }

            // Verificar si está en el grupo
            const member = participants.find(p => p.id === target);
            if (!member) return m.reply("⚠️ Ese usuario no está en el grupo.");

            // No permitir promover al dueño del bot
            const isOwner = config.ownerNumbers.includes(target.split("@")[0]);
            if (isOwner) {
                return m.reply("✖️ No puedo promover al dueño del bot.");
            }

            // Verificar si ya es admin
            if (member.admin === "admin" || member.admin === "superadmin") {
                return m.reply("⚠️ Ese usuario ya es administrador.");
            }

            // Promover
            await sock.groupParticipantsUpdate(m.chat, [target], "promote");

            await sock.sendMessage(
                m.chat,
                {
                    text: `✨ *Nuevo administrador asignado*\n\n👤 *Usuario:* @${target.split("@")[0]}\n👑 *Promovido por:* ${m.pushName}`,
                    mentions: [target]
                },
                { quoted: m }
            );

            logger.info(`Usuario ${target} promovido por ${m.sender} en ${m.chat}`);

        } catch (err) {
            logger.error("Error en PROMOTE: " + err.message);
            return m.reply("✖️ Ocurrió un error al promover al usuario.");
        }
    }
};
