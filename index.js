const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const path = require('path');
const { SESSION_ID, PREFIX } = require('./config');

// Load session credentials from key
const credentialsFile = path.join(__dirname, 'auth_info_multi', 'creds.json');

async function startBot() {
  // Create auth folder if missing
  if (!fs.existsSync('auth_info_multi')) fs.mkdirSync('auth_info_multi');

  // Save session string to file if not already saved
  if (!fs.existsSync(credentialsFile) && SESSION_ID) {
    fs.writeFileSync(credentialsFile, SESSION_ID);
  }

  const { state, saveCreds } = await useMultiFileAuthState('auth_info_multi');

  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    auth: state
  });

  // Save session on update
  sock.ev.on('creds.update', saveCreds);

  // Load commands
  require('./handler')(sock);
}

startBot();
