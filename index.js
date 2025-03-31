const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');
const menu = JSON.parse(fs.readFileSync('menu.json'));

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth');
    const sock = makeWASocket({ auth: state });

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || !msg.key.remoteJid) return;
        const sender = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

        if (text) {
            if (text.startsWith('.allmenu')) {
                sock.sendMessage(sender, { text: JSON.stringify(menu, null, 2) });
            } else if (text.startsWith('.menu')) {
                sock.sendMessage(sender, { text: Object.keys(menu).join('\n') });
            }
        }
    });
}

startBot().catch(console.error);
