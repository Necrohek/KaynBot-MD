// config.js — versión optimizada para KaynBot 🇪🇪

export default {

  // ▬▬▬ PREFIX ▬▬▬
  prefix: ".",

  // ▬▬▬ IDENTIDAD DEL BOT ▬▬▬
  botEmoji: "🇪🇪",
  botName: "❛ㅤ 𝖪𝖺𝗒𝗇 𝖡𝗈𝗍 ㅤᅠ▮▖ㅤ🇪🇪。",
  emojis: ["🇪🇪","✔️","✖️","📘","⛸️","🪼","🔵"],
  botNumber: "523347646525", // número oficial del bot

  // ▬▬▬ DUEÑO / OWNERS ▬▬▬
  ownerName: "Kayn Necrohëk",
  ownerNumbers: [
    "523115194331" // puedes agregar más owners sin romper nada
  ],

  // ▬▬▬ MENSAJES ▬▬▬
  messages: {
    success: "✔️ Listo!",
    error: "✖️ Ocurrió un error inesperado.",
    ownerOnly: "🇪🇪 Este comando es solo para el dueño.",
    groupOnly: "✖️ Este comando funciona solo en grupos.",
    adminOnly: "✖️ Necesitas ser admin para usar este comando.",
    botAdminOnly: "✖️ Necesito ser admin para ejecutar esto.",
    botInfo: "🇪🇪 Información del bot 🇪🇪"
  },

  // ▬▬▬ WELCOME ▬▬▬
  welcomeText:
    "🇪🇪 ¡Bienvenid@ @user al grupo! Lee las reglas y disfruta tu estancia. 🇪🇪",

  // ▬▬▬ DEFAULT SETTINGS ▬▬▬
  // Esto se usa cuando un comando no tiene configuración previa
  defaultSettings: {
    kick: true,
    welcome: true,
    tagall: true,
    hidetag: true,
    promote: true,
    demote: true,
    open: true,
    close: true
  },

  // ▬▬▬ STICKERS ▬▬▬
  stickerPack: "❛ㅤ 𝖪𝖺𝗒𝗇 𝖡𝗈𝗍 ㅤᅠ▮▖ㅤ🇪🇪.",
  stickerAuthor: "Kayn Necrohëk",

  // ▬▬▬ OPCIONES AVANZADAS ▬▬▬
  debug: false, // cambia a true para ver más logs
  saveLogs: true, // activa/desactiva tu logger
  autoReload: true, // recarga comandos automáticamente al editar

};
