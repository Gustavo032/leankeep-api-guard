import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OcorrenciasTab } from './tabs/OcorrenciasTab';
import { CorrecoesTab } from './tabs/CorrecoesTab';
import { AtividadesTab } from './tabs/AtividadesTab';
import { BaixaTab } from './tabs/BaixaTab';

export function Runner() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Endpoints</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="ocorrencias">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ocorrencias">Ocorrências</TabsTrigger>
            <TabsTrigger value="correcoes">Correções</TabsTrigger>
            <TabsTrigger value="atividades">Atividades</TabsTrigger>
            <TabsTrigger value="baixa">Baixa</TabsTrigger>
          </TabsList>

          <TabsContent value="ocorrencias" className="mt-6">
            <OcorrenciasTab />
          </TabsContent>

          <TabsContent value="correcoes" className="mt-6">
            <CorrecoesTab />
          </TabsContent>

          <TabsContent value="atividades" className="mt-6">
            <AtividadesTab />
          </TabsContent>

          <TabsContent value="baixa" className="mt-6">
            <BaixaTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
