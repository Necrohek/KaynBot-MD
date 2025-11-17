import logger from "../../logger.js";

export default {
    name: ["tagall", "todos", "here"],
    category: "group",
    description: "Menciona a todos los miembros del grupo.",

    async execute(m, { sock, args, isGroupAdmins, isBotGroupAdmins }) {
        try {

            if (!m.isGroup) {
                return m.reply("✖️ Este comando solo funciona en grupos.");
            }

            if (!isGroupAdmins) {
                return m.reply("✖️ Solo administradores pueden usar *tagall*.");
            }

            if (!isBotGroupAdmins) {
                return m.reply("✖️ Necesito ser administrador para mencionar a todos.");
            }

            const group = await sock.groupMetadata(m.chat);
            const participants = group.participants;
            const memberIds = participants.map(p => p.id);

            const msg = args.join(" ") || "Sin mensaje.";

            let text = `ㅤㅤ𝄙ㅤㅤㅤㅤㅤㅤ( 🇪🇪 )ㅤㅤ𝗞𝗮𝘆𝗻 : 𝖻𝗈𝗍.\n`;
            text += `ㅤㅤㅤ██▛▞ㅤㅤ───ㅤㅤ𝖠𝗍𝖾𝗇𝖼𝗂𝗈́𝗇 ❕\n`;
            text += `ㅤㅤㅤ ㅤ 𝗆𝖾𝗇𝖼𝗂𝗈𝗇𝖾𝗌  @${m.pushName.replace(/ /g, "_")}\n\n`;
            text += `𝗠𝗲𝗻𝘀𝗮𝗷𝗲: ${msg}\n\n`;

            for (let p of participants) {
                text += ` @${p.id.split("@")[0]}\n`;
            }

            await sock.sendMessage(
                m.chat,
                { text, mentions: memberIds },
                { quoted: m }
            );

            logger.info(`TAGALL ejecutado en ${m.chat} por ${m.sender}`);

        } catch (err) {
            logger.error("Error en TAGALL: " + err.message);
            return m.reply("✖️ Hubo un error con *tagall*.");
        }
    }
};
