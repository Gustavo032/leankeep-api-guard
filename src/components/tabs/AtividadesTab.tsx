import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSession } from '@/store/useSession';
import { get, mainApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play } from 'lucide-react';
import { toast } from 'sonner';
import { RequestPanel } from '../RequestPanel';
import { ResponsePanel } from '../ResponsePanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const atividadesSchema = z.object({
  StatusId: z.coerce.number().min(0, 'StatusId obrigatório'),
  SelectedDate: z.string().min(1, 'Data obrigatória (YYYY-MM-DD)'),
});

type AtividadesData = z.infer<typeof atividadesSchema>;

export function AtividadesTab() {
  const { empresaId, xTransactionId, siteId } = useSession();
  const [loading, setLoading] = useState(false);
  const [requestInfo, setRequestInfo] = useState<any>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  const form = useForm<AtividadesData>({
    resolver: zodResolver(atividadesSchema),
    defaultValues: {
      SelectedDate: new Date().toISOString().split('T')[0],
    },
  });

  const handleRequest = async (endpoint: string, data: AtividadesData) => {
    if (!empresaId || !xTransactionId) {
      toast.error('EmpresaId e X-Transaction-Id devem ser configurados');
      return;
    }

    setLoading(true);
    setError(null);
    setResponseData(null);

    const headers: Record<string, string> = {
      EmpresaId: empresaId,
      'X-Transaction-Id': xTransactionId,
    };

    // Aplicação pode usar SiteId
    const query: Record<string, any> = {
      StatusId: data.StatusId,
      SelectedDate: data.SelectedDate,
    };

    if (endpoint === '/v1/atividades/aplicacao' && siteId) {
      query.SiteId = siteId;
    }

    setRequestInfo({
      method: 'GET',
      url: endpoint,
      headers,
      query,
    });

    try {
      const response = await get(mainApi, endpoint, {
        headers,
        params: query,
      });
      setResponseData(response.data);
      toast.success('Atividades carregadas');
    } catch (err: any) {
      setError(err);
      toast.error('Erro ao buscar atividades');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Tabs defaultValue="list">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="list">Listagem</TabsTrigger>
            <TabsTrigger value="plano">Plano</TabsTrigger>
            <TabsTrigger value="aplicacao">Aplicação</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <form onSubmit={form.handleSubmit((data) => handleRequest('/v1/atividades', data))} className="space-y-4">
              <div className="space-y-2">
                <Label>Status ID *</Label>
                <Input type="number" {...form.register('StatusId')} />
                {form.formState.errors.StatusId && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.StatusId.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Data Selecionada * (YYYY-MM-DD)</Label>
                <Input type="date" {...form.register('SelectedDate')} />
                {form.formState.errors.SelectedDate && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.SelectedDate.message}
                  </p>
                )}
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                <Play className="mr-2 h-4 w-4" />
                GET Atividades
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="plano">
            <form onSubmit={form.handleSubmit((data) => handleRequest('/v1/atividades/plano', data))} className="space-y-4">
              <div className="space-y-2">
                <Label>Status ID *</Label>
                <Input type="number" {...form.register('StatusId')} />
              </div>
              <div className="space-y-2">
                <Label>Data Selecionada * (YYYY-MM-DD)</Label>
                <Input type="date" {...form.register('SelectedDate')} />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                <Play className="mr-2 h-4 w-4" />
                GET Atividades Plano
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="aplicacao">
            <form onSubmit={form.handleSubmit((data) => handleRequest('/v1/atividades/aplicacao', data))} className="space-y-4">
              <div className="space-y-2">
                <Label>Status ID *</Label>
                <Input type="number" {...form.register('StatusId')} />
              </div>
              <div className="space-y-2">
                <Label>Data Selecionada * (YYYY-MM-DD)</Label>
                <Input type="date" {...form.register('SelectedDate')} />
              </div>
              <p className="text-xs text-muted-foreground">
                {siteId ? `Usando SiteId: ${siteId}` : 'SiteId não configurado (opcional)'}
              </p>
              <Button type="submit" disabled={loading} className="w-full">
                <Play className="mr-2 h-4 w-4" />
                GET Atividades Aplicação
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>

      <div className="space-y-6">
        {requestInfo && (
          <RequestPanel
            method={requestInfo.method}
            url={requestInfo.url}
            headers={requestInfo.headers}
            query={requestInfo.query}
          />
        )}
        <ResponsePanel status={responseData?.status} data={responseData} error={error} />
      </div>
    </div>
  );
}
