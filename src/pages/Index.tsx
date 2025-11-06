import { useEffect } from 'react';
import { useSession } from '@/store/useSession';
import { DevBanner } from '@/components/DevBanner';
import { EnvForm } from '@/components/EnvForm';
import { AuthForm } from '@/components/AuthForm';
import { Runner } from '@/components/Runner';
import { toast } from 'sonner';

const Index = () => {
  const { fromSessionStorage, isTokenExpired, logout } = useSession();

  useEffect(() => {
    // Load from sessionStorage on mount
    fromSessionStorage();

    // Check token expiration every minute
    const interval = setInterval(() => {
      if (isTokenExpired()) {
        logout();
        toast.warning('Token expirado. Faça login novamente.');
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [fromSessionStorage, isTokenExpired, logout]);

  return (
    <div className="min-h-screen bg-background">
      <DevBanner />
      
      <div className="container mx-auto py-8 space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Leankeep API Tester</h1>
          <p className="text-muted-foreground">
            Ferramenta de desenvolvimento para testar a Leankeep API
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EnvForm />
          <AuthForm />
        </div>

        <Runner />
      </div>
    </div>
  );
};

export default Index;
