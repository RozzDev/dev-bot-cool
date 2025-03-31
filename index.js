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
        
        await handleCommand(sock, sender, text);
    });
}

async function handleCommand(sock, sender, text) {
    if (text === '.allmenu') {
        await sock.sendMessage(sender, { text: 'Menu:\n- .allmenu\n- .menu\n- .addowner\n- .delowner\n- .self\n- .hidetag\n- .tagall\n- .kick\n- .add\n- .linkgc\n- .resetlinkgc\n- .antilinkgc\n- .antivirus\n- .antipromosi\n- .totag\n- .antitoxic\n- .freezegc\n- .spamsms\n- .spamotp\n- .tiktok <url>\n- .ytmp3 <url>\n- .ytmp4 <url>\n- .pinterest <url>' });
    } else if (text === '.menu') {
        await sock.sendMessage(sender, { text: 'Menu tersedia: Owner Menu, Grup Menu, Bug WA Menu, Download Menu, Game Menu' });
    }
}

startBot();
