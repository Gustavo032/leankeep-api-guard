import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSession } from '@/store/useSession';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Save } from 'lucide-react';

const envSchema = z.object({
  authHost: z.string().url('URL inválida'),
  apiHost: z.string().url('URL inválida'),
  empresaId: z.string().optional(),
  unidadeId: z.string().optional(),
  siteId: z.string().optional(),
  xTransactionId: z.string().optional(),
});

type EnvFormData = z.infer<typeof envSchema>;

export function EnvForm() {
  const { authHost, apiHost, empresaId, unidadeId, siteId, xTransactionId, redactMode, setEnvVars, toggleRedact } = useSession();

  const { register, handleSubmit, formState: { errors } } = useForm<EnvFormData>({
    resolver: zodResolver(envSchema),
    defaultValues: {
      authHost,
      apiHost,
      empresaId,
      unidadeId,
      siteId,
      xTransactionId,
    },
  });

  const onSubmit = (data: EnvFormData) => {
    setEnvVars(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração de Ambiente</CardTitle>
        <CardDescription>Configure os hosts e IDs da API</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="authHost">Auth Host</Label>
            <Input
              id="authHost"
              {...register('authHost')}
              placeholder="https://auth.lkp.app.br"
            />
            {errors.authHost && (
              <p className="text-sm text-destructive">{errors.authHost.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiHost">API Host</Label>
            <Input
              id="apiHost"
              {...register('apiHost')}
              placeholder="https://api.lkp.app.br"
            />
            {errors.apiHost && (
              <p className="text-sm text-destructive">{errors.apiHost.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="empresaId">Empresa ID</Label>
            <Input
              id="empresaId"
              {...register('empresaId')}
              placeholder="Ex: 123"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unidadeId">Unidade ID</Label>
            <Input
              id="unidadeId"
              {...register('unidadeId')}
              placeholder="Ex: 456"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteId">Site ID</Label>
            <Input
              id="siteId"
              {...register('siteId')}
              placeholder="Ex: 789"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="xTransactionId">X-Transaction-Id</Label>
            <Input
              id="xTransactionId"
              {...register('xTransactionId')}
              placeholder="UUID ou identificador"
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-md">
            <div className="space-y-0.5">
              <Label htmlFor="redact-mode">Modo de Redação</Label>
              <p className="text-sm text-muted-foreground">
                Ocultar dados sensíveis nas respostas
              </p>
            </div>
            <Switch
              id="redact-mode"
              checked={redactMode}
              onCheckedChange={toggleRedact}
            />
          </div>

          <Button type="submit" className="w-full">
            <Save className="mr-2 h-4 w-4" />
            Salvar Configuração
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
