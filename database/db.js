import fs from "fs";
import logger from "../logger.js";

const dbPath = "./database/";

// Crea carpeta database si no existe
if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath);
    logger.warn("Carpeta /database creada automáticamente.");
}

// Utilidad general segura
function readJSON(file, fallback = {}) {
    try {
        if (!fs.existsSync(file)) {
            fs.writeFileSync(file, JSON.stringify(fallback, null, 2));
            return fallback;
        }

        return JSON.parse(fs.readFileSync(file));
    } catch (err) {
        logger.error(`Error leyendo ${file}: ` + err.message);

        // Previene crasheo por JSON corrupto
        fs.writeFileSync(file, JSON.stringify(fallback, null, 2));
        return fallback;
    }
}

function writeJSON(file, data) {
    try {
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
    } catch (err) {
        logger.error(`Error escribiendo ${file}: ` + err.message);
    }
}

// ---------------------------------------------
// MANEJO: disabled.json
// ---------------------------------------------
export function getDisabled() {
    return readJSON(dbPath + "disabled.json", {});
}

export function setDisabled(command, state) {
    const file = dbPath + "disabled.json";
    const data = readJSON(file, {});
    data[command] = state;
    writeJSON(file, data);
}

// ---------------------------------------------
// MANEJO: detect.json
// ---------------------------------------------
export function getDetect() {
    return readJSON(dbPath + "detect.json", {});
}

export function setDetect(groupId, state) {
    const file = dbPath + "detect.json";
    const data = readJSON(file, {});
    data[groupId] = state;
    writeJSON(file, data);
}
