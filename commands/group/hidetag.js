import logger from "../../logger.js";

export default {
    name: ["hidetag", "ht", "notify", "tag"],
    category: "group",
    description: "Menciona a todos los miembros de forma oculta.",
    use: ".hidetag [mensaje] o responde a un mensaje",

    async execute(m, { sock, args, isGroupAdmins, isBotGroupAdmins }) {
        try {
            // Validar grupo
            if (!m.isGroup) {
                return m.reply("✖️ Este comando solo funciona en grupos.");
            }

            // Validar si el usuario es admin
            if (!isGroupAdmins) {
                return m.reply("✖️ Solo los administradores pueden usar este comando.");
            }

            // Validar si el bot es admin
            if (!isBotGroupAdmins) {
                return m.reply("✖️ Necesito ser administrador para etiquetar a todos.");
            }

            // Obtener IDs del grupo
            const metadata = await sock.groupMetadata(m.chat);
            const members = metadata.participants.map(p => p.id);

            const text = args.join(" ") || "";

            // ============================
            // 1️⃣ REENVÍO DE MENSAJE CITADO
            // ============================

            const quoted = m.quoted ? m.quoted : null;

            if (quoted) {
                const forwardContent = await generateForwardMessage(sock, quoted);

                await sock.sendMessage(
                    m.chat,
                    {
                        ...forwardContent,
                        mentions: members
                    },
                    { quoted: m }
                );

                // Texto adicional opcional
                if (text) {
                    await sock.sendMessage(
                        m.chat,
                        { text, mentions: members },
                        { quoted: m }
                    );
                }

                logger.info(`hidetag con mensaje citado en ${m.chat}`);
                return;
            }

            // ============================
            // 2️⃣ SIN CITA — SOLO MENSAJE
            // ============================

            await sock.sendMessage(
                m.chat,
                {
                    text: text || "@everyone",
                    mentions: members
                },
                { quoted: m }
            );

            logger.info(`hidetag enviado en ${m.chat}`);

        } catch (err) {
            logger.error("Error en HIDETAG: " + err.message);
            m.reply("✖️ Ocurrió un error en el comando *hidetag*.");
        }
    }
};


// =======================================
// 🔧 Función auxiliar para reenviar mensajes
// =======================================

async function
