import axios from 'axios';
import crypto from 'crypto';
import { config } from '../config/index.js';
import { logger } from '../lib/logger.js';

export async function sendToLaravel(payload) {
  const urlBase = (config.laravelApiUrl || '').replace(/\/$/, '');
  const url = `${urlBase}/api/reward-user`;

  try {
    const wrapped = { task: payload };
    const body = JSON.stringify(wrapped);

    const hmac = crypto
      .createHmac('sha256', config.botSecret)
      .update(body)
      .digest('hex');

    const res = await axios.post(url, body, {
      headers: {
        'Content-Type': 'application/json',
        'X-Bot-Signature': hmac,
      },
      timeout: 10_000,
      validateStatus: (s) => s >= 200 && s < 500,
    });

    if (res.data && typeof res.data === 'object' && 'code' in res.data) {
      logger.info({ code: res.data.code }, 'Laravel responded');
      return res.data;
    }

    logger.warn({ status: res.status }, 'Unexpected Laravel response shape');
    return { code: 'INVALID_RESPONSE' };
  } catch (err) {
    const message = err?.message || 'Unknown error';
    const status = err?.response?.status;
    const code = err?.response?.data?.code;
    logger.error({ message, status, code }, 'Failed to notify Laravel');

    if (code) {
      return { code };
    }

    return { code: 'SERVER_ERROR' };
  }
}
