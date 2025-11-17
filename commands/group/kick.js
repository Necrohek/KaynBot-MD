import fs from "fs";
import path from "path";
import logger from "../../logger.js";
import config from "../../config.js";

// Ruta del archivo de configuración de activación/desactivación
const settingsPath = path.resolve("./database/settings.json");

// Cargar settings
function loadSettings() {
    try {
        if (!fs.existsSync(settingsPath)) return {};
        return JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
    } catch (err) {
        logger.error("settings.json corrupto. Se regenerará.");
        return {};
    }
}

export default {
    name: ["kick", "ban", "expulsar"],
    category: "group",
    description: "Expulsa a un miembro del grupo.",
    use: ".kick @usuario | .kick (responder mensaje)",

    async execute(m, { sock, args, isGroupAdmins, isBotGroupAdmins }) {
        try {
            // Validar grupo
            if (!m.isGroup) {
                return m.reply("✖️ Este comando solo funciona en grupos.");
            }

            // Validar admin
            if (!isGroupAdmins) {
                return m.reply("✖️ Solo los administradores pueden expulsar miembros.");
            }

            // Validar admin bot
            if (!isBotGroupAdmins) {
                return m.reply("✖️ Necesito ser administrador para expulsar miembros.");
            }

            // Cargar settings
            const settings = loadSettings();

            // Función desactivada
            if (!settings.ban) {
                return m.reply("🚫 *El comando kick está desactivado.*");
            }

            // Obtener info del grupo
            const metadata = await sock.groupMetadata(m.chat);
            const participants = metadata.participants.map(v => v.id);

            let target;

            // 1️⃣ Usuario citado
            if (m.quoted?.sender) {
                target = m.quoted.sender;
            }

            // 2️⃣ Mención @usuario
            else if (m.mentionedJid?.length > 0) {
                target = m.mentionedJid[0];
            }

            // 3️⃣ Número escrito manualmente
            else if (args[0]) {
                const number = args[0].replace(/[^0-9]/g, "");
                if (number.length > 5) {
                    target = number + "@s.whatsapp.net";
                }
            }

            // Si no hay objetivo
            if (!target) {
                return m.reply("🇪🇪 Usa:\n.kick @usuario\n.kick (citar mensaje)\n.kick 521xxxxxxx");
            }

            // No permitir expulsar al dueño del bot
            const isOwnerNumber = config.ownerNumbers.includes(target.split("@")[0]);
            if (isOwnerNumber) {
                return m.reply("✖️ No puedo expulsar al dueño del bot.");
            }

            // Verificar que el usuario esté en el grupo
            if (!participants.includes(target)) {
                return m.reply("⚠️ Ese usuario no está en el grupo.");
            }

            // Expulsar miembro
            await sock.groupParticipantsUpdate(m.chat, [target], "remove");

            // Mensaje final
            await sock.sendMessage(
                m.chat,
                {
                    text: `🇪🇪 *Usuario expulsado*\n@${target.split("@")[0]} ha sido eliminado.`,
                    mentions: [target]
                },
                { quoted: m }
            );

            logger.info(`Miembro ${target} expulsado en ${m.chat} por ${m.sender}`);

        } catch (err) {
            logger.error("Error en KICK: " + err.message);
            return m.reply("✖️ No pude expulsarlo, algo salió mal.");
        }
    }
};
