import { useSession } from '@/store/useSession';
import { redactResponse } from '@/lib/redact';
import { Card } from '@/components/ui/card';

interface JsonViewerProps {
  data: any;
  title?: string;
}

export function JsonViewer({ data, title }: JsonViewerProps) {
  const { redactMode } = useSession();

  const displayData = redactMode ? redactResponse(data) : data;

  return (
    <Card className="p-4">
      {title && <h3 className="font-semibold mb-2">{title}</h3>}
      <pre className="bg-code-bg p-4 rounded-md overflow-auto text-xs">
        {JSON.stringify(displayData, null, 2)}
      </pre>
    </Card>
  );
}
