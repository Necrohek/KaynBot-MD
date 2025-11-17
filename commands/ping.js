module.exports = {
  name: 'ping',
  alias: ['p'],
  desc: 'Ping command',
  run: async (sock, m, args) => {
    await sock.sendMessage(m.chat, { text: 'Pong!' }, { quoted: m });
  }
};