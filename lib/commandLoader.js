import fs from 'fs';
import path from 'path';
import config from '../config.js';

const commands = new Map();

export async function loadCommands() {
  const dir = path.join(process.cwd(), './commands');
  if (!fs.existsSync(dir)) return commands;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
  for (const file of files) {
    try {
      const mod = await import(path.join(dir, file));
      const cmd = mod.default || mod;
      if (cmd && cmd.name) commands.set(cmd.name, cmd);
      // register aliases
      if (cmd.alias && Array.isArray(cmd.alias)) {
        for (const a of cmd.alias) commands.set(a, cmd);
      }
    } catch (e) {
      console.error('Error cargando comando', file, e);
    }
  }
  return commands;
}

export function attachCommandHandler(sock) {
  // lightweight command handler: listens for text messages starting with prefix
  sock.ev.on('messages.upsert', async (m) => {
    try {
      const upsert = m.messages && m.messages[0];
      if (!upsert) return;
      if (upsert.key && upsert.key.remoteJid === 'status@broadcast') return;
      const message = upsert.message;
      if (!message) return;
      const text = (message.conversation || (message.extendedTextMessage && message.extendedTextMessage.text));
      if (!text) return;
      const prefix = config.prefix || '.';
      if (!text.startsWith(prefix)) return;
      const without = text.slice(prefix.length).trim();
      const parts = without.split(/\s+/);
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1);
      const command = commands.get(cmd);
      if (!command) return;
      const fakeMsg = {
        id: upsert.key.id,
        from: upsert.key.remoteJid,
        chat: upsert.key.remoteJid,
        sender: upsert.key.participant || upsert.key.remoteJid,
        body: text
      };
      await command.run(sock, fakeMsg, args);
    } catch (e) {
      console.error('Command handler error', e);
    }
  });
}
