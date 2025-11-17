import fs from "fs";
import path from "path";
import config from "../../config.js";
import logger from "../../logger.js";

const dbPath = path.resolve("./database/disabled.json");

// Cargar BD
function loadDB() {
    try {
        if (!fs.existsSync(dbPath)) return {};
        return JSON.parse(fs.readFileSync(dbPath, "utf8"));
    } catch (err) {
        logger.error("disabled.json corrupto, regenerando...");
        return {};
    }
}

// Guardar BD
function saveDB(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

export default {
    name: ["off", "on"],
    category: "owner",
    description: "Activa o desactiva comandos del bot.",

    async execute(m, { text }) {
        try {
            const sender = m.sender.split("@")[0];
            const owner = config.ownerNumbers.includes(sender);

            if (!owner) {
                return m.reply("✖️ Solo la dueña del bot puede usar este comando.");
            }

            if (!text) {
                return m.reply("❗ Debes especificar un comando.\nEjemplo:\n.off welcome\n.on kick");
            }

            const feature = text.toLowerCase();
            const db = loadDB();

            if (m.command === "off") {
                db[feature] = true;
                saveDB(db);
                logger.info(`Comando ${feature} desactivado por ${m.sender}`);
                return m.reply(`🇪🇪 *${feature} ha sido desactivado.*`);
            }

            if (m.command === "on") {
                delete db[feature];
                saveDB(db);
                logger.info(`Comando ${feature} activado por ${m.sender}`);
                return m.reply(`✔️ *${feature} ha sido activado.*`);
            }

        } catch (err) {
            logger.error("Error en ON/OFF: " + err.message);
            m.reply("✖️ Error al cambiar el estado del comando.");
        }
    }
};
