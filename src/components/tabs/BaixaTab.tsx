import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSession } from '@/store/useSession';
import { get, put, postJson, mainApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Play } from 'lucide-react';
import { toast } from 'sonner';
import { RequestPanel } from '../RequestPanel';
import { ResponsePanel } from '../ResponsePanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const listSchema = z.object({
  ids: z.string().min(1, 'Pelo menos um ID obrigatório (separado por vírgula)'),
});

const medicoesGetSchema = z.object({
  tarefaId: z.string().min(1, 'ID da tarefa obrigatório'),
});

const baixaSchema = z.object({
  tarefasIds: z.string().min(1, 'IDs das tarefas obrigatórios (separados por vírgula)'),
  siteId: z.string().min(1, 'SiteId obrigatório'),
  dataRealizada: z.string().min(1, 'Data obrigatória (YYYY-MM-DD)'),
  tempoTotal: z.coerce.number().min(0, 'Tempo total obrigatório'),
  plataforma: z.coerce.number().default(8),
  statusId: z.coerce.number().min(0, 'StatusId obrigatório'),
  observacoes: z.string().optional(),
});

const medicoesPostSchema = z.object({
  tarefasIds: z.string().min(1, 'IDs das tarefas obrigatórios'),
  medicoes: z.string().min(1, 'Medições em JSON (array)'),
});

type ListData = z.infer<typeof listSchema>;
type MedicoesGetData = z.infer<typeof medicoesGetSchema>;
type BaixaData = z.infer<typeof baixaSchema>;
type MedicoesPostData = z.infer<typeof medicoesPostSchema>;

export function BaixaTab() {
  const { empresaId } = useSession();
  const [loading, setLoading] = useState(false);
  const [requestInfo, setRequestInfo] = useState<any>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  const listForm = useForm<ListData>({ resolver: zodResolver(listSchema) });
  const medicoesGetForm = useForm<MedicoesGetData>({ resolver: zodResolver(medicoesGetSchema) });
  const baixaForm = useForm<BaixaData>({ resolver: zodResolver(baixaSchema) });
  const medicoesPostForm = useForm<MedicoesPostData>({ resolver: zodResolver(medicoesPostSchema) });

  const handleList = async (data: ListData) => {
    setLoading(true);
    setError(null);
    setResponseData(null);

    const ids = data.ids.split(',').map(id => id.trim());
    const query: Record<string, any> = {};
    ids.forEach(id => {
      if (!query.ids) query.ids = [];
      query.ids.push(id);
    });

    setRequestInfo({
      method: 'GET',
      url: '/v1/atividades/baixa/list',
      query,
    });

    try {
      const response = await get(mainApi, '/v1/atividades/baixa/list', {
        params: query,
        paramsSerializer: (params) => {
          return ids.map(id => `ids=${id}`).join('&');
        },
      });
      setResponseData(response.data);
      toast.success('Lista carregada');
    } catch (err: any) {
      setError(err);
      toast.error('Erro ao buscar lista');
    } finally {
      setLoading(false);
    }
  };

  const handleGetMedicoes = async (data: MedicoesGetData) => {
    setLoading(true);
    setError(null);
    setResponseData(null);

    setRequestInfo({
      method: 'GET',
      url: `/v1/atividades/${data.tarefaId}/medicoes`,
    });

    try {
      const response = await get(mainApi, `/v1/atividades/${data.tarefaId}/medicoes`);
      setResponseData(response.data);
      toast.success('Medições carregadas');
    } catch (err: any) {
      setError(err);
      toast.error('Erro ao buscar medições');
    } finally {
      setLoading(false);
    }
  };

  const handleGetJustificativas = async () => {
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
      url: '/v1/atividades/justificativas',
      headers,
    });

    try {
      const response = await get(mainApi, '/v1/atividades/justificativas', { headers });
      setResponseData(response.data);
      toast.success('Justificativas carregadas');
    } catch (err: any) {
      setError(err);
      toast.error('Erro ao buscar justificativas');
    } finally {
      setLoading(false);
    }
  };

  const handleBaixa = async (data: BaixaData) => {
    setLoading(true);
    setError(null);
    setResponseData(null);

    const tarefasIds = data.tarefasIds.split(',').map(id => id.trim());
    const body = {
      tarefasIds,
      siteId: data.siteId,
      dataRealizada: data.dataRealizada,
      tempoTotal: data.tempoTotal,
      plataforma: data.plataforma,
      statusId: data.statusId,
      observacoes: data.observacoes,
    };

    setRequestInfo({
      method: 'PUT',
      url: '/v1/atividades/baixa',
      data: body,
    });

    try {
      const response = await put(mainApi, '/v1/atividades/baixa', body);
      setResponseData(response.data);
      toast.success('Baixa realizada');
    } catch (err: any) {
      setError(err);
      toast.error('Erro ao realizar baixa');
    } finally {
      setLoading(false);
    }
  };

  const handlePostMedicoes = async (data: MedicoesPostData) => {
    setLoading(true);
    setError(null);
    setResponseData(null);

    try {
      const tarefasIds = data.tarefasIds.split(',').map(id => id.trim());
      const medicoes = JSON.parse(data.medicoes);

      const body = {
        tarefasIds,
        medicoes,
      };

      setRequestInfo({
        method: 'POST',
        url: '/v1/atividades/medicoes',
        data: body,
      });

      const response = await postJson(mainApi, '/v1/atividades/medicoes', body);
      setResponseData(response.data);
      toast.success('Medições enviadas');
    } catch (err: any) {
      setError(err);
      toast.error('Erro ao enviar medições');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Tabs defaultValue="list">
          <TabsList className="grid w-full grid-cols-5 text-xs">
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="medicoes-get">Medições</TabsTrigger>
            <TabsTrigger value="just">Justif.</TabsTrigger>
            <TabsTrigger value="baixa">Baixa</TabsTrigger>
            <TabsTrigger value="medicoes-post">Post Med.</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <form onSubmit={listForm.handleSubmit(handleList)} className="space-y-4">
              <div className="space-y-2">
                <Label>IDs (separados por vírgula) *</Label>
                <Input {...listForm.register('ids')} placeholder="1,2,3" />
                {listForm.formState.errors.ids && (
                  <p className="text-sm text-destructive">
                    {listForm.formState.errors.ids.message}
                  </p>
                )}
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                <Play className="mr-2 h-4 w-4" />
                GET Lista
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="medicoes-get">
            <form onSubmit={medicoesGetForm.handleSubmit(handleGetMedicoes)} className="space-y-4">
              <div className="space-y-2">
                <Label>Tarefa ID *</Label>
                <Input {...medicoesGetForm.register('tarefaId')} />
                {medicoesGetForm.formState.errors.tarefaId && (
                  <p className="text-sm text-destructive">
                    {medicoesGetForm.formState.errors.tarefaId.message}
                  </p>
                )}
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                <Play className="mr-2 h-4 w-4" />
                GET Medições
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="just">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Buscar justificativas disponíveis
              </p>
              <Button onClick={handleGetJustificativas} disabled={loading} className="w-full">
                <Play className="mr-2 h-4 w-4" />
                GET Justificativas
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="baixa">
            <form onSubmit={baixaForm.handleSubmit(handleBaixa)} className="space-y-4">
              <div className="space-y-2">
                <Label>Tarefas IDs *</Label>
                <Input {...baixaForm.register('tarefasIds')} placeholder="1,2,3" />
                {baixaForm.formState.errors.tarefasIds && (
                  <p className="text-sm text-destructive">
                    {baixaForm.formState.errors.tarefasIds.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Site ID *</Label>
                <Input {...baixaForm.register('siteId')} />
              </div>
              <div className="space-y-2">
                <Label>Data Realizada * (YYYY-MM-DD)</Label>
                <Input type="date" {...baixaForm.register('dataRealizada')} />
              </div>
              <div className="space-y-2">
                <Label>Tempo Total *</Label>
                <Input type="number" {...baixaForm.register('tempoTotal')} />
              </div>
              <div className="space-y-2">
                <Label>Plataforma</Label>
                <Input type="number" {...baixaForm.register('plataforma')} />
              </div>
              <div className="space-y-2">
                <Label>Status ID *</Label>
                <Input type="number" {...baixaForm.register('statusId')} />
              </div>
              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea {...baixaForm.register('observacoes')} />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                <Play className="mr-2 h-4 w-4" />
                PUT Baixa
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="medicoes-post">
            <form onSubmit={medicoesPostForm.handleSubmit(handlePostMedicoes)} className="space-y-4">
              <div className="space-y-2">
                <Label>Tarefas IDs *</Label>
                <Input {...medicoesPostForm.register('tarefasIds')} placeholder="1,2,3" />
              </div>
              <div className="space-y-2">
                <Label>Medições (JSON Array) *</Label>
                <Textarea
                  {...medicoesPostForm.register('medicoes')}
                  placeholder='[{"campo":"valor"}]'
                  rows={6}
                />
                {medicoesPostForm.formState.errors.medicoes && (
                  <p className="text-sm text-destructive">
                    {medicoesPostForm.formState.errors.medicoes.message}
                  </p>
                )}
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                <Play className="mr-2 h-4 w-4" />
                POST Medições
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
