import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSession } from '@/store/useSession';
import { get, postJson, mainApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Play } from 'lucide-react';
import { toast } from 'sonner';
import { RequestPanel } from '../RequestPanel';
import { ResponsePanel } from '../ResponsePanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const getOcorrenciasSchema = z.object({
  PageIndex: z.coerce.number().min(0),
  PageSize: z.coerce.number().min(1).max(100),
});

const postOcorrenciaSchema = z.object({
  titulo: z.string().min(1, 'Título obrigatório'),
  descricao: z.string().optional(),
  prioridade: z.coerce.number().optional(),
});

type GetOcorrenciasData = z.infer<typeof getOcorrenciasSchema>;
type PostOcorrenciaData = z.infer<typeof postOcorrenciaSchema>;

export function OcorrenciasTab() {
  const { empresaId, unidadeId } = useSession();
  const [loading, setLoading] = useState(false);
  const [requestInfo, setRequestInfo] = useState<any>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  // GET form
  const getForm = useForm<GetOcorrenciasData>({
    resolver: zodResolver(getOcorrenciasSchema),
    defaultValues: { PageIndex: 0, PageSize: 10 },
  });

  // POST form
  const postForm = useForm<PostOcorrenciaData>({
    resolver: zodResolver(postOcorrenciaSchema),
  });

  const handleGet = async (data: GetOcorrenciasData) => {
    if (!empresaId) {
      toast.error('EmpresaId não configurado');
      return;
    }

    setLoading(true);
    setError(null);
    setResponseData(null);

    const headers = { EmpresaId: empresaId };
    const query = { PageIndex: data.PageIndex, PageSize: data.PageSize };

    setRequestInfo({
      method: 'GET',
      url: '/v1/ocorrencias',
      headers,
      query,
    });

    try {
      const response = await get(mainApi, '/v1/ocorrencias', {
        headers,
        params: query,
      });
      setResponseData(response.data);
      toast.success('Ocorrências carregadas');
    } catch (err: any) {
      setError(err);
      toast.error('Erro ao buscar ocorrências');
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (data: PostOcorrenciaData) => {
    if (!empresaId || !unidadeId) {
      toast.error('EmpresaId e UnidadeId devem ser configurados');
      return;
    }

    setLoading(true);
    setError(null);
    setResponseData(null);

    const headers = { EmpresaId: empresaId, UnidadeId: unidadeId };

    setRequestInfo({
      method: 'POST',
      url: '/v1/ocorrencias',
      headers,
      data,
    });

    try {
      const response = await postJson(mainApi, '/v1/ocorrencias', data, { headers });
      setResponseData(response.data);
      toast.success('Ocorrência criada');
    } catch (err: any) {
      setError(err);
      toast.error('Erro ao criar ocorrência');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Tabs defaultValue="get">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="get">GET Ocorrências</TabsTrigger>
            <TabsTrigger value="post">POST Ocorrência</TabsTrigger>
          </TabsList>

          <TabsContent value="get">
            <form onSubmit={getForm.handleSubmit(handleGet)} className="space-y-4">
              <div className="space-y-2">
                <Label>PageIndex</Label>
                <Input type="number" {...getForm.register('PageIndex')} />
              </div>
              <div className="space-y-2">
                <Label>PageSize</Label>
                <Input type="number" {...getForm.register('PageSize')} />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                <Play className="mr-2 h-4 w-4" />
                Executar GET
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="post">
            <form onSubmit={postForm.handleSubmit(handlePost)} className="space-y-4">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input {...postForm.register('titulo')} />
                {postForm.formState.errors.titulo && (
                  <p className="text-sm text-destructive">
                    {postForm.formState.errors.titulo.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea {...postForm.register('descricao')} />
              </div>
              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Input type="number" {...postForm.register('prioridade')} />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                <Play className="mr-2 h-4 w-4" />
                Executar POST
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
            data={requestInfo.data}
          />
        )}
        <ResponsePanel status={responseData?.status} data={responseData} error={error} />
      </div>
    </div>
  );
}
