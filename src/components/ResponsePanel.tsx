import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { JsonViewer } from './JsonViewer';
import { Badge } from '@/components/ui/badge';

interface ResponsePanelProps {
  status?: number;
  data?: any;
  error?: any;
}

export function ResponsePanel({ status, data, error }: ResponsePanelProps) {
  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Response
            <Badge variant="destructive">
              {error.response?.status || 'Error'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-destructive/10 p-4 rounded-md">
            <p className="text-sm font-semibold text-destructive mb-2">
              {error.message}
            </p>
            {error.response?.data && (
              <JsonViewer data={error.response.data} />
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Response</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhuma resposta ainda. Execute uma requisição para ver o resultado.
          </p>
        </CardContent>
      </Card>
    );
  }

  const statusColor = status && status >= 200 && status < 300 ? 'default' : 'destructive';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          Response
          {status && (
            <Badge variant={statusColor}>
              {status}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <JsonViewer data={data} />
      </CardContent>
    </Card>
  );
}
