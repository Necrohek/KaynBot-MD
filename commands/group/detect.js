import fs from "fs";
import path from "path";
import logger from "../../logger.js";
import config from "../../config.js";

// Ruta segura y absoluta
const dbPath = path.resolve("./database/detect.json");

// Cargar DB o crearla
function loadDetectDB() {
    try {
        if (!fs.existsSync(dbPath)) return {};
        return JSON.parse(fs.readFileSync(dbPath, "utf-8"));
    } catch (err) {
        logger.error("detect.json corrupto. Se regenerará.");
        return {};
    }
}

// Guardar DB
function saveDetectDB(data) {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    } catch (err) {
        logger.error("No se pudo guardar detect.json: " + err.message);
    }
}

export default {
    name: ["detect", "ondetect", "offdetect"],
    category: "group",
    description: "Muestra o controla el sistema detect del grupo.",

    async execute(m, { sock, command, text }) {
        try {
            const db = loadDetectDB();

            // 📌 1. Mostrar estado con ".detect"
            if (command === "detect") {
                const status = db[m.chat] ? "✔️ Activado" : "🇪🇪 Desactivado";
                return m.reply(`📡 *Estado de detect:* ${status}`);
            }

            // Solo owner puede activar/desactivar
            const sender = m.sender.split("@")[0];
            const isOwner = config.ownerNumbers.includes(sender);

            if (!isOwner) {
                return m.reply("✖️ Solo el dueño del bot puede activar/desactivar detect.");
            }

            // 📌 2. .ondetect
            if (command === "ondetect") {
                db[m.chat] = true;
                saveDetectDB(db);

                logger.info(`Detect activado en ${m.chat} por ${m.sender}`);
                return m.reply("✔️ *Detect activado* en este grupo.");
            }

            // 📌 3. .offdetect
            if (command === "offdetect") {
                delete db[m.chat];
                saveDetectDB(db);

                logger.info(`Detect desactivado en ${m.chat} por ${m.sen
