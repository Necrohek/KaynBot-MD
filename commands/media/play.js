import yts from "yt-search";
import logger from "../../logger.js";
import { ytmp3 } from "../../lib/ytmp3.js";

export default {
    name: ["play", "music", "song"],
    category: "media",
    description: "Busca una canción y envía el audio.",

    async execute(m, { sock, args }) {
        try {
            if (!args[0]) {
                return m.reply("🇪🇪 *Debes escribir el nombre de la canción.*\nEjemplo:\n.play Deftones - Cherry Waves");
            }

            const query = args.join(" ");
            m.reply("⏳ *Buscando la canción...*");

            // 🔍 Búsqueda en YouTube
            const search = await yts(query);
            const video = search.videos[0];

            if (!video) {
                return m.reply("⚠️ No encontré resultados.");
            }

            // Información del video
            await sock.sendMessage(
                m.chat,
                {
                    text:
                        `🎧 *Canción encontrada:*\n\n` +
                        `⭐ *${video.title}*\n` +
                        `📀 Autor: ${video.author.name}\n` +
                        `⏱️ Duración: ${video.timestamp}\n` +
                        `🔗 ${video.url}`
                },
                { quoted: m }
            );

            m.reply("🇪🇪 *Descargando audio...*");

            // Convertir a MP3
            const audio = await ytmp3(video.url);

            if (!audio || !audio.url) {
                return m.reply("⚠️ No pude convertir el audio.");
            }

            // Limpieza del nombre
            const cleanTitle = video.title
                .replace(/[\\/:*?"<>|]/g, "")
                .substring(0, 50);

            await sock.sendMessage(
                m.chat,
                {
                    audio: { url: audio.url },
                    mimetype: "audio/mpeg",
                    fileName: `${cleanTitle}.mp3`
                },
                { quoted: m }
            );

            logger.info(`Audio enviado: ${video.title} → ${m.sender}`);

        } catch (err) {
            logger.error("Error en PLAY: " + err.message);
            m.reply("⚠️ Ocurrió un error al procesar la canción.");
        }
    }
};
