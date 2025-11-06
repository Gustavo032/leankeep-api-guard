import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSession } from '@/store/useSession';
import { postFormUrlEncoded, postJson, authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { LogIn, RefreshCw, LogOut, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { truncateToken } from '@/lib/redact';

const authSchema = z.object({
  login: z.string().min(1, 'Login obrigatório'),
  password: z.string().min(1, 'Senha obrigatória'),
  platform: z.coerce.number().default(8),
  authtoken: z.boolean().default(true),
  stayConnected: z.boolean().default(true),
  expireCurrentSession: z.boolean().default(false),
});

type AuthFormData = z.infer<typeof authSchema>;

export function AuthForm() {
  const { token, refreshToken, setToken, logout } = useSession();
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      platform: 8,
      authtoken: true,
      stayConnected: true,
      expireCurrentSession: false,
    },
  });

  const onSubmit = async (data: AuthFormData) => {
    setLoading(true);
    try {
      const response = await postFormUrlEncoded('/v1/auth', data);
      
      const { authToken, refreshToken: refresh, expiresIn, refreshExpiresIn } = response.data;
      
      setToken({
        token: authToken.token,
        refreshToken: refresh.token,
        expiresIn: expiresIn,
        refreshExpiresIn: refreshExpiresIn,
      });

      toast.success('Autenticação realizada com sucesso!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao autenticar');
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!refreshToken) {
      toast.error('Refresh token não disponível');
      return;
    }

    setLoading(true);
    try {
      const response = await postJson(authApi, '/v1/refresh', {
        refreshToken: refreshToken,
      });

      const { authToken, refreshToken: newRefresh, expiresIn, refreshExpiresIn } = response.data;

      setToken({
        token: authToken.token,
        refreshToken: newRefresh.token,
        expiresIn: expiresIn,
        refreshExpiresIn: refreshExpiresIn,
      });

      toast.success('Token atualizado com sucesso!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar token');
      console.error('Refresh error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.info('Sessão limpa');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Autenticação</CardTitle>
        <CardDescription>Faça login na API Leankeep</CardDescription>
      </CardHeader>
      <CardContent>
        {token ? (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-md">
              <div className="flex items-center justify-between mb-2">
                <Label>Token Atual</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowToken(!showToken)}
                >
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <code className="text-xs break-all">
                {showToken ? token : truncateToken(token)}
              </code>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleRefresh} disabled={loading} className="flex-1">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Token
              </Button>
              <Button onClick={handleLogout} variant="destructive" className="flex-1">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login">Login</Label>
              <Input
                id="login"
                {...register('login')}
                autoComplete="off"
                placeholder="Seu login"
              />
              {errors.login && (
                <p className="text-sm text-destructive">{errors.login.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                autoComplete="off"
                placeholder="Sua senha"
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform">Platform ID</Label>
              <Input
                id="platform"
                type="number"
                {...register('platform')}
                placeholder="8"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="authtoken">Auth Token</Label>
                <Switch id="authtoken" {...register('authtoken')} defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="stayConnected">Stay Connected</Label>
                <Switch id="stayConnected" {...register('stayConnected')} defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="expireCurrentSession">Expire Current Session</Label>
                <Switch id="expireCurrentSession" {...register('expireCurrentSession')} />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              <LogIn className="mr-2 h-4 w-4" />
              {loading ? 'Autenticando...' : 'Autenticar'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
