import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Copy, AlertTriangle } from 'lucide-react';
import { buildCurl } from '@/lib/redact';
import { toast } from 'sonner';

interface RequestPanelProps {
  method: string;
  url: string;
  headers?: Record<string, string>;
  query?: Record<string, any>;
  data?: any;
}

export function RequestPanel({ method, url, headers, query, data }: RequestPanelProps) {
  const [includeSecrets, setIncludeSecrets] = useState(false);

  const copyCurl = () => {
    const curl = buildCurl({
      method,
      url,
      headers,
      query,
      data,
      redactSecrets: !includeSecrets,
    });

    navigator.clipboard.writeText(curl);
    toast.success('cURL copiado para a área de transferência');
  };

  const displayHeaders = { ...headers };
  if (displayHeaders.Authorization && !includeSecrets) {
    displayHeaders.Authorization = 'Bearer [REDACTED]';
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Request</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-semibold mb-1">Method & URL</p>
          <code className="text-xs bg-code-bg p-2 rounded block">
            {method.toUpperCase()} {url}
            {query && Object.keys(query).length > 0 && (
              <>
                ?
                {Object.entries(query)
                  .filter(([_, value]) => value !== undefined && value !== '')
                  .map(([key, value]) => {
                    if (Array.isArray(value)) {
                      return value.map(v => `${key}=${v}`).join('&');
                    }
                    return `${key}=${value}`;
                  })
                  .join('&')}
              </>
            )}
          </code>
        </div>

        {headers && Object.keys(headers).length > 0 && (
          <div>
            <p className="text-sm font-semibold mb-1">Headers</p>
            <pre className="text-xs bg-code-bg p-2 rounded overflow-auto">
              {JSON.stringify(displayHeaders, null, 2)}
            </pre>
          </div>
        )}

        {data && (
          <div>
            <p className="text-sm font-semibold mb-1">Body</p>
            <pre className="text-xs bg-code-bg p-2 rounded overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-secrets"
              checked={includeSecrets}
              onCheckedChange={(checked) => setIncludeSecrets(checked as boolean)}
            />
            <Label htmlFor="include-secrets" className="text-sm flex items-center gap-2">
              Incluir segredos no cURL
              {includeSecrets && (
                <span className="text-warning flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  <span className="text-xs">(perigoso!)</span>
                </span>
              )}
            </Label>
          </div>

          <Button onClick={copyCurl} variant="outline" size="sm" className="w-full">
            <Copy className="mr-2 h-4 w-4" />
            Copiar cURL
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
