// Utilities to redact sensitive information

const EMAIL_REGEX = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g;

const SENSITIVE_FIELDS = [
  'token',
  'refreshToken',
  'authToken',
  'password',
  'senha',
  'email',
  'jti',
  'traceId',
  'cpf',
  'cnpj',
  'telefone',
  'celular',
];

export function redactResponse(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(redactResponse);
  }

  const redacted: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    
    if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field.toLowerCase()))) {
      if (typeof value === 'string' && value.length > 0) {
        // Show first 6 and last 4 characters for tokens
        if (value.length > 20) {
          redacted[key] = `${value.substring(0, 6)}...${value.substring(value.length - 4)}`;
        } else {
          redacted[key] = '***';
        }
      } else {
        redacted[key] = '***';
      }
    } else if (typeof value === 'string' && EMAIL_REGEX.test(value)) {
      // Mask emails: a***@domain.com
      redacted[key] = value.replace(EMAIL_REGEX, (match) => {
        const [local, domain] = match.split('@');
        return `${local[0]}***@${domain}`;
      });
    } else if (typeof value === 'object') {
      redacted[key] = redactResponse(value);
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}

export function truncateToken(token: string | null): string {
  if (!token) return '';
  if (token.length <= 20) return '***';
  return `${token.substring(0, 6)}...${token.substring(token.length - 4)}`;
}

export function buildCurl(options: {
  method: string;
  url: string;
  headers?: Record<string, string>;
  query?: Record<string, any>;
  data?: any;
  redactSecrets?: boolean;
}): string {
  const { method, url, headers = {}, query = {}, data, redactSecrets = true } = options;

  let curlCmd = `curl -X ${method.toUpperCase()}`;

  // Add headers
  const processedHeaders = { ...headers };
  if (redactSecrets && processedHeaders.Authorization) {
    processedHeaders.Authorization = 'Bearer [REDACTED]';
  }

  Object.entries(processedHeaders).forEach(([key, value]) => {
    curlCmd += ` \\\n  -H "${key}: ${value}"`;
  });

  // Build URL with query params
  let fullUrl = url;
  const queryString = Object.entries(query)
    .filter(([_, value]) => value !== undefined && value !== '')
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map(v => `${key}=${encodeURIComponent(v)}`).join('&');
      }
      return `${key}=${encodeURIComponent(value)}`;
    })
    .join('&');

  if (queryString) {
    fullUrl += `?${queryString}`;
  }

  // Add data
  if (data) {
    const dataStr = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    curlCmd += ` \\\n  -d '${dataStr}'`;
  }

  curlCmd += ` \\\n  "${fullUrl}"`;

  return curlCmd;
}
