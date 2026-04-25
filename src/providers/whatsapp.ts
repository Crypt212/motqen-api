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

// ─── Redis Helpers ─────────────────────────────────────────

async function readData(key: string): Promise<any> {
  const raw = await redisClient.get(KEY_PREFIX + key);
  if (!raw) return null;
  return JSON.parse(raw as string, BufferJSON.reviver);
}

async function writeData(key: string, data: any): Promise<void> {
  await redisClient.set(KEY_PREFIX + key, JSON.stringify(data, BufferJSON.replacer));
}

async function removeData(key: string): Promise<void> {
  await redisClient.del(KEY_PREFIX + key);
}

async function clearRedisAuth(): Promise<void> {
  const keys = await redisClient.keys(`${KEY_PREFIX}*`);
  if (keys.length) {
    await redisClient.del(keys);
  }
  logger.warn('🗑️ Cleared WA session from Redis');
}

// ─── Auth State ─────────────────────────────────────────

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

      await Promise.all(tasks);
    },
    clear: async () => {},
  };

  return {
    state: { creds, keys },
    saveCreds,
  };
}

// ─── WA Manager ─────────────────────────────────────────

let sock: WASocket | null = null;
let isConnecting = false;

// 🔴 قفل socket
async function destroySocket() {
  try {
    if (sock) {
      sock.ev.removeAllListeners('creds.update');
      sock.ev.removeAllListeners('connection.update');
      sock.ws.close();
      sock = null;
    }
  } catch (err) {
    logger.error('Error destroying socket:', err);
  }
}

export async function connectWhatsApp(): Promise<void> {
  if (isConnecting) return;
  isConnecting = true;

  try {
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
        logger.info('📱 Scan QR code');
        qrcode.generate(qr, { small: true });
      }

      if (connection === 'close') {
        const error = lastDisconnect?.error as Boom;
        const statusCode = error?.output?.statusCode;

        logger.warn(`WA closed. Status: ${statusCode}`);

        const isConflict =
          error?.message?.includes('conflict') ||
          error?.data?.toString()?.includes('conflict');

        if (statusCode === DisconnectReason.loggedOut || isConflict) {
          logger.warn('⚠️ Conflict / Logged out → resetting session');

          await destroySocket();
          await clearRedisAuth();

          setTimeout(() => connectWhatsApp(), 2000);
        } else {
          await destroySocket();

          setTimeout(() => connectWhatsApp(), 2000);
        }
      }

      if (connection === 'open') {
        logger.info('✅ WhatsApp connected');
      }
    });

  } catch (err) {
    logger.error('WA connection error:', err);
  } finally {
    isConnecting = false;
  }
}

// ─── Send Message ─────────────────────────────────────────

export async function sendMessage(phone: string, message: string): Promise<void> {
  if (!sock) {
    throw new Error('WhatsApp not connected');
  }

  const cleanPhone = phone.replace(/\D/g, '');
  const jid = `${cleanPhone}@s.whatsapp.net`;

  try {
    await sock.sendMessage(jid, { text: message });
  } catch (err: any) {
    logger.error(`Failed to send message: ${err.message}`);
  }
}