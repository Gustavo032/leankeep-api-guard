import { AlertTriangle } from 'lucide-react';

export function DevBanner() {
  return (
    <div className="bg-destructive text-destructive-foreground py-2 px-4 flex items-center justify-center gap-2 font-semibold text-sm sticky top-0 z-50 shadow-md">
      <AlertTriangle className="h-4 w-4" />
      <span>⚠️ DEV ONLY – NÃO PUBLICAR EM PRODUÇÃO – DEVELOPMENT TOOL ONLY ⚠️</span>
      <AlertTriangle className="h-4 w-4" />
    </div>
  );
}
