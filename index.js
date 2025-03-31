const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const { Boom } = require('@hapi/boom');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
    });

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom) && lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('Bot Connected as Dev Ganteng!');
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const sender = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

        if (text === '.allmenu') {
            await sock.sendMessage(sender, { text: 'Menu:
- .allmenu
- .menu
- .addowner
- .delowner
- .self
- .hidetag
- .tagall
- .kick
- .add
- .linkgc
- .resetlinkgc
- .antilinkgc
- .antivirus
- .antipromosi
- .totag
- .antitoxic
- .freezegc
- .spamsms
- .spamotp
- .tiktok <url>
- .ytmp3 <url>
- .ytmp4 <url>
- .pinterest <url>' });
        } else if (text === '.menu') {
            await sock.sendMessage(sender, { text: 'Menu tersedia: Owner Menu, Grup Menu, Bug WA Menu, Download Menu, Game Menu' });
        }
    });
}

startBot();
