module.exports = {
  name: 'menu',
  alias: ['help','menú','menu'],
  desc: 'Muestra el menú principal con logo y estilo KaynBot',
  run: async (sock, m, args) => {
    const fs = await import('fs');
    const path = './media/logo.jpg';
    const caption = `❛ㅤ 𝖪𝖺𝗒𝗇 𝖡𝗈𝗍 ㅤᅠ▮▖ㅤ🇪🇪。
ㅤㅤ𝄙ㅤㅤㅤㅤㅤㅤ( 🇪🇪 )ㅤㅤ𝗞𝗮𝘆𝗻 : 𝖻𝗈𝗍.
\n██▛▞   ───  𝖠𝗍𝖾𝗇𝖼𝗂𝗈́𝗇 ❕\nㅤㅤㅤ  𝗆𝖾𝗇𝖼𝗂𝗈𝗇𝖾𝗌  @ripperfile ❜\n\n𝗠𝗲𝗻𝘀𝗮𝗷𝗲: Aquí el mensaje opcional que manden junto al .tagall\n\n→ 𝗠𝗲𝗻𝘂\n\nGrupo\n→ .tagall: menciona a todos\n\nMedia\n→ .sticker: crear sticker\n\nPPT\n→ .ppt: crear presentación\n\nExclusivo (owner)\n→ .ban: banear usuario\n\n(Powered by Kayn Necrohëk)`;
    try {
      const img = fs.readFileSync(path);
      await sock.sendMessage(m.chat, { image: img, caption, mentions: [m.sender] }, { quoted: null });
    } catch (e) {
      console.error('Error enviando menú:', e);
      await sock.sendMessage(m.chat, { text: caption }, { quoted: null });
    }
  }
};
