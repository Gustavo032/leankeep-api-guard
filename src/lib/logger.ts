// Safe logger that redacts sensitive information

const SENSITIVE_KEYS = [
  'authorization',
  'password',
  'token',
  'refreshtoken',
  'refresh_token',
  'authtoken',
  'auth_token',
  'secret',
  'apikey',
  'api_key',
];

function isSensitiveKey(key: string): boolean {
  const lowerKey = key.toLowerCase().replace(/[-_]/g, '');
  return SENSITIVE_KEYS.some(sensitive => lowerKey.includes(sensitive));
}

function redactHeaders(headers: Record<string, any> | undefined): Record<string, any> {
  if (!headers) return {};
  
  const redacted: Record<string, any> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (isSensitiveKey(key)) {
      redacted[key] = '[REDACTED]';
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
}

function redactData(data: any): any {
  if (!data) return data;
  if (typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(redactData);
  }

  const redacted: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (isSensitiveKey(key)) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      redacted[key] = redactData(value);
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
}

export const logger = {
  request: (method: string, url: string, headers?: Record<string, any>, data?: any) => {
    console.log(`[API Request] ${method.toUpperCase()} ${url}`, {
      headers: redactHeaders(headers),
      data: redactData(data),
    });
  },

  response: (method: string, url: string, status: number, data?: any) => {
    console.log(`[API Response] ${method.toUpperCase()} ${url} - ${status}`, {
      data: redactData(data),
    });
  },

  error: (method: string, url: string, error: any) => {
    console.error(`[API Error] ${method.toUpperCase()} ${url}`, {
      message: error.message,
      status: error.response?.status,
    });
  },

  info: (...args: any[]) => {
    console.log('[INFO]', ...args);
  },

  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args);
  },
};
