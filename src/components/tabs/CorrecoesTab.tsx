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

const getCorrecoesSchema = z.object({
  ocorrenciaId: z.string().min(1, 'OcorrenciaId obrigatório'),
});

const getToEditSchema = z.object({
  correcaoId: z.string().min(1, 'CorrecaoId obrigatório'),
});

const postCorrecaoSchema = z.object({
  ocorrenciaId: z.string().min(1, 'OcorrenciaId obrigatório'),
  descricao: z.string().min(1, 'Descrição obrigatória'),
  tipoId: z.coerce.number().optional(),
});

type GetCorrecoesData = z.infer<typeof getCorrecoesSchema>;
type GetToEditData = z.infer<typeof getToEditSchema>;
type PostCorrecaoData = z.infer<typeof postCorrecaoSchema>;

export function CorrecoesTab() {
  const { empresaId } = useSession();
  const [loading, setLoading] = useState(false);
  const [requestInfo, setRequestInfo] = useState<any>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  const getForm = useForm<GetCorrecoesData>({
    resolver: zodResolver(getCorrecoesSchema),
  });

  const getToEditForm = useForm<GetToEditData>({
    resolver: zodResolver(getToEditSchema),
  });

  const postForm = useForm<PostCorrecaoData>({
    resolver: zodResolver(postCorrecaoSchema),
  });

  const handleGetCorrecoes = async (data: GetCorrecoesData) => {
    if (!empresaId) {
      toast.error('EmpresaId não configurado');
      return;
    }

    setLoading(true);
    setError(null);
    setResponseData(null);

    const query = { ocorrenciaId: data.ocorrenciaId, EmpresaId: empresaId };

    setRequestInfo({
      method: 'GET',
      url: '/v1/correcoes',
      query,
    });

    try {
      const response = await get(mainApi, '/v1/correcoes', { params: query });
      setResponseData(response.data);
      toast.success('Correções carregadas');
    } catch (err: any) {
      setError(err);
      toast.error('Erro ao buscar correções');
    } finally {
      setLoading(false);
    }
  };

  const handleGetToEdit = async (data: GetToEditData) => {
    if (!empresaId) {
      toast.error('EmpresaId não configurado');
      return;
    }

    setLoading(true);
    setError(null);
    setResponseData(null);

    const headers = { EmpresaId: empresaId };

    setRequestInfo({
      method: 'GET',
      url: `/v1/correcoes/${data.correcaoId}/toedit`,
      headers,
      query: { EmpresaId: empresaId },
    });

    try {
      const response = await get(mainApi, `/v1/correcoes/${data.correcaoId}/toedit`, {
        headers,
        params: { EmpresaId: empresaId },
      });
      setResponseData(response.data);
      toast.success('Correção para edição carregada');
    } catch (err: any) {
      setError(err);
      toast.error('Erro ao buscar correção');
    } finally {
      setLoading(false);
    }
  };

  const handleGetTipos = async () => {
    if (!empresaId) {
      toast.error('EmpresaId não configurado');
      return;
    }

    setLoading(true);
    setError(null);
    setResponseData(null);

    const headers = { EmpresaId: empresaId };

    setRequestInfo({
      method: 'GET',
      url: '/v1/correcoes/tipos',
      headers,
    });

    try {
      const response = await get(mainApi, '/v1/correcoes/tipos', { headers });
      setResponseData(response.data);
      toast.success('Tipos de correção carregados');
    } catch (err: any) {
      setError(err);
      toast.error('Erro ao buscar tipos');
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (data: PostCorrecaoData) => {
    setLoading(true);
    setError(null);
    setResponseData(null);

    setRequestInfo({
      method: 'POST',
      url: '/v1/correcoes',
      data,
    });

    try {
      const response = await postJson(mainApi, '/v1/correcoes', data);
      setResponseData(response.data);
      toast.success('Correção criada');
    } catch (err: any) {
      setError(err);
      toast.error('Erro ao criar correção');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Tabs defaultValue="get">
          <TabsList className="grid w-full grid-cols-4 text-xs">
            <TabsTrigger value="get">GET</TabsTrigger>
            <TabsTrigger value="toedit">ToEdit</TabsTrigger>
            <TabsTrigger value="tipos">Tipos</TabsTrigger>
            <TabsTrigger value="post">POST</TabsTrigger>
          </TabsList>

          <TabsContent value="get">
            <form onSubmit={getForm.handleSubmit(handleGetCorrecoes)} className="space-y-4">
              <div className="space-y-2">
                <Label>Ocorrência ID *</Label>
                <Input {...getForm.register('ocorrenciaId')} />
                {getForm.formState.errors.ocorrenciaId && (
                  <p className="text-sm text-destructive">
                    {getForm.formState.errors.ocorrenciaId.message}
                  </p>
                )}
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                <Play className="mr-2 h-4 w-4" />
                GET Correções
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="toedit">
            <form onSubmit={getToEditForm.handleSubmit(handleGetToEdit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Correção ID *</Label>
                <Input {...getToEditForm.register('correcaoId')} />
                {getToEditForm.formState.errors.correcaoId && (
                  <p className="text-sm text-destructive">
                    {getToEditForm.formState.errors.correcaoId.message}
                  </p>
                )}
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                <Play className="mr-2 h-4 w-4" />
                GET ToEdit
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="tipos">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Buscar tipos de correção disponíveis
              </p>
              <Button onClick={handleGetTipos} disabled={loading} className="w-full">
                <Play className="mr-2 h-4 w-4" />
                GET Tipos
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="post">
            <form onSubmit={postForm.handleSubmit(handlePost)} className="space-y-4">
              <div className="space-y-2">
                <Label>Ocorrência ID *</Label>
                <Input {...postForm.register('ocorrenciaId')} />
                {postForm.formState.errors.ocorrenciaId && (
                  <p className="text-sm text-destructive">
                    {postForm.formState.errors.ocorrenciaId.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Descrição *</Label>
                <Textarea {...postForm.register('descricao')} />
                {postForm.formState.errors.descricao && (
                  <p className="text-sm text-destructive">
                    {postForm.formState.errors.descricao.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Tipo ID</Label>
                <Input type="number" {...postForm.register('tipoId')} />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                <Play className="mr-2 h-4 w-4" />
                POST Correção
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
