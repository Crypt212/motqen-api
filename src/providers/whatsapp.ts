/**
 * @fileoverview WhatsApp Provider - Baileys-based WhatsApp Web integration with Redis auth state
 * @module providers/whatsapp
 */

import makeWASocket, {
  BufferJSON,
  initAuthCreds,
  AuthenticationState,
  AuthenticationCreds,
  WASocket,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  proto,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode-terminal';
import redisClient from '../libs/redis.js';
import { logger } from '../libs/winston.js';

const KEY_PREFIX = 'wa:auth:';

// ─── Redis Auth State ────────────────────────────────────────────────────────

async function readData(key: string): Promise<any> {
  const raw = await redisClient.get(KEY_PREFIX + key);
  if (!raw) {
    logger.warn(`WA auth key not found: ${KEY_PREFIX + key}`); // ✅
    return null;
  }
  return JSON.parse(raw as string, BufferJSON.reviver);
}

async function writeData(key: string, data: any): Promise<void> {
  await redisClient.set(KEY_PREFIX + key, JSON.stringify(data, BufferJSON.replacer));
}

async function removeData(key: string): Promise<void> {
  await redisClient.del(KEY_PREFIX + key);
}

async function useRedisAuthState(): Promise<{
  state: AuthenticationState;
  saveCreds: () => Promise<void>;
}> {
  let creds: AuthenticationCreds = (await readData('creds')) || initAuthCreds();

  const saveCreds = async () => {
    await writeData('creds', creds);
  };

  const keys = {
    get: async (type: string, ids: string[]) => {
      const data: Record<string, any> = {};
      for (const id of ids) {
        const value = await readData(`${type}-${id}`);
        if (type === 'app-state-sync-key' && value) {
          data[id] = proto.Message.AppStateSyncKeyData.fromObject(value);
        } else if (value) {
          data[id] = value;
        }
      }
      return data;
    },
    set: async (data: Record<string, Record<string, any>>) => {
      const tasks: Promise<void>[] = [];

      for (const type in data) {
        for (const id in data[type]) {
          const value = data[type][id];
          const key = `${type}-${id}`;
          tasks.push(value ? writeData(key, value) : removeData(key));
        }
      }

      await Promise.all(tasks); // ✅ ده المهم
    },
    clear: async () => {
      // Not implemented – auth keys are managed individually
    },
  };

  return {
    state: { creds, keys },
    saveCreds,
  };
}

// ─── WhatsApp Manager ────────────────────────────────────────────────────────

let sock: WASocket | null = null;

export async function connectWhatsApp(): Promise<void> {
  const { version } = await fetchLatestBaileysVersion();
  logger.info(`Using WA version: ${version.join('.')}`);

  const { state, saveCreds } = await useRedisAuthState();

  const waLogger = {
    level: 'silent' as const,
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
    trace: () => {},
    fatal: () => {},
    child: () => waLogger,
  };

  sock = makeWASocket({
    version,
    defaultQueryTimeoutMs: undefined,
    syncFullHistory: false,
    getMessage: async () => undefined,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, waLogger),
    },
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      logger.info('WA QR code received – scan it in WhatsApp Linked Devices');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      logger.warn(`WA connection closed. Reconnecting: ${shouldReconnect}`);

      if (shouldReconnect) {
        connectWhatsApp();
      }
    } else if (connection === 'open') {
      logger.info('WA connection opened');
    }
  });
}

export async function sendMessage(phone: string, message: string): Promise<void> {
  if (!sock) {
    throw new Error('WhatsApp socket not initialized. Call connectWhatsApp() first.');
  }

  
  const cleanPhone = phone.replace(/\D/g, '');
  const jid = `${cleanPhone}@s.whatsapp.net`;
  console.log(`Sending WA message to JID: ${jid}`);
  sock.sendMessage(jid, { text: message }).catch((err) => {
    console.error(`Failed to send WA message to ${phone}: ${err.message}`);
  });
}
