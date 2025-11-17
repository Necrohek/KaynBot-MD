import pkg from "@whiskeysockets/baileys";
import logger from "../../logger.js";
const { Sticker, StickerTypes } = pkg;

export default {
    name: ["sticker", "s"],
    category: "media",
    description: "Convierte una imagen en un sticker.",

    async execute(m, { sock }) {
        try {
            const quoted = m.quoted ? m.quoted : m;
            const mime = quoted.mimetype || quoted.msg?.mimetype || "";

            if (!mime.startsWith("image/")) {
                return m.reply("📸 *Envía o cita una imagen para convertirla en sticker.*");
            }

            const buffer = await quoted.download();

            if (!buffer) {
                return m.reply("⚠️ No pude obtener la imagen.");
            }

            const sticker = new Sticker(buffer, {
                pack: "❛ㅤ 𝖪𝖺𝗒𝗇 𝖡𝗈𝗍 ㅤᅠ▮▖ㅤ🇪🇪",
                author: "Kayn Necrohëk",
                type: StickerTypes.FULL,
                quality: 70
            });

            const output = await sticker.toBuffer();

            await sock.sendMessage(
                m.chat,
                { sticker: output },
                { quoted: m }
            );

            logger.info(`Sticker enviado por ${m.sender}`);

        } catch (err) {
            logger.error("Error en STICKER: " + err.message);
            m.reply("⚠️ Hubo un problema al crear el sticker.");
        }
    }
};
