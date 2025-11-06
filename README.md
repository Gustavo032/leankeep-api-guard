# Leankeep API Tester

⚠️ **DEV ONLY – NÃO PUBLICAR EM PRODUÇÃO** ⚠️

Esta é uma ferramenta de desenvolvimento para testar a Leankeep API. **NUNCA** publique este projeto em produção ou compartilhe com usuários finais.

## ⚠️ Avisos de Segurança

- **NÃO hardcode** credenciais, tokens ou IDs sensíveis no código
- **NÃO publique** este projeto em produção
- **NÃO compartilhe** tokens ou credenciais via screenshots ou logs
- **NÃO use** dados reais de clientes sem autorização
- **SEMPRE** limpe a sessão após o uso
- **NUNCA** use localStorage - apenas sessionStorage

## Recursos de Segurança

- ✅ Banner de aviso DEV ONLY permanente
- ✅ Tokens armazenados apenas em memória e sessionStorage
- ✅ Redação automática de dados sensíveis nas respostas
- ✅ Logger que remove headers sensíveis
- ✅ Inputs de senha sem autocomplete
- ✅ Opção de mostrar/ocultar tokens truncados
- ✅ cURL gerado com redação de Authorization por padrão
- ✅ Auto-logout quando token expira
- ✅ Validação forte de formulários com zod

## Tech Stack

- React 18 + TypeScript + Vite
- Axios (HTTP client)
- Zustand (state management)
- React Hook Form + Zod (forms & validation)
- TanStack Query (data fetching)
- Tailwind CSS + shadcn/ui

## Como Usar

### 1. Instalação

```bash
npm install
npm run dev
```

### 2. Configurar Ambiente

Na seção "Configuração de Ambiente", configure:
- **Auth Host**: URL do servidor de autenticação (default: https://auth.lkp.app.br)
- **API Host**: URL do servidor da API (default: https://api.lkp.app.br)
- **Empresa ID, Unidade ID, Site ID**: IDs necessários para as requisições
- **X-Transaction-Id**: ID de transação (UUID)
- **Modo de Redação**: ON para ocultar dados sensíveis (recomendado)

### 3. Autenticar

Na seção "Autenticação":
1. Insira suas credenciais
2. Configure Platform ID (default: 8)
3. Ajuste as opções de autenticação
4. Clique em "Autenticar"

O token será armazenado em memória e sessionStorage. Use "Refresh Token" para renovar ou "Logout" para limpar a sessão.

### 4. Testar Endpoints

Use as abas para testar diferentes endpoints:

#### Ocorrências
- **GET**: Listar ocorrências (paginado)
- **POST**: Criar nova ocorrência

#### Correções
- **GET**: Listar correções de uma ocorrência
- **ToEdit**: Obter correção para edição
- **Tipos**: Listar tipos de correção
- **POST**: Criar nova correção

#### Atividades
- **Listagem**: Listar atividades
- **Plano**: Listar atividades do plano
- **Aplicação**: Listar atividades de aplicação

#### Baixa
- **List**: Listar atividades para baixa
- **Medições**: Obter medições de uma tarefa
- **Justificativas**: Listar justificativas
- **Baixa**: Realizar baixa de atividades (PUT)
- **Post Medições**: Enviar medições

### 5. Visualizar Resultados

Cada requisição mostra:
- **Request**: Método, URL, headers (redigidos), query params e body
- **Response**: Status HTTP e dados JSON (com redação de campos sensíveis)
- **Botão "Copiar cURL"**: Gera comando cURL com Authorization redigido por padrão

## Modo de Redação

Quando **Redact Mode** está ON (padrão):
- Tokens aparecem truncados: `eyJhbG...abcd`
- E-mails são mascarados: `a***@domain.com`
- Campos sensíveis são ocultados: `***`
- cURL gerado redige o header Authorization

Para debug avançado, desative o modo de redação, mas **NUNCA** compartilhe screenshots ou logs com dados reais.

## Estrutura do Projeto

```
src/
├── components/
│   ├── tabs/           # Componentes de cada aba
│   ├── AuthForm.tsx    # Formulário de autenticação
│   ├── DevBanner.tsx   # Banner de aviso
│   ├── EnvForm.tsx     # Configuração de ambiente
│   ├── JsonViewer.tsx  # Visualizador JSON com redação
│   ├── RequestPanel.tsx # Painel de requisição
│   ├── ResponsePanel.tsx # Painel de resposta
│   └── Runner.tsx      # Container das abas
├── lib/
│   ├── api.ts         # Configuração Axios e helpers
│   ├── logger.ts      # Logger seguro
│   └── redact.ts      # Funções de redação
├── store/
│   └── useSession.ts  # Zustand store
└── pages/
    └── Index.tsx      # Página principal
```

## Endpoints Disponíveis

### Auth API (auth.lkp.app.br)
- `POST /v1/auth` - Autenticação (form-urlencoded)
- `POST /v1/refresh` - Refresh token (JSON)

### Main API (api.lkp.app.br)

**Ocorrências:**
- `GET /v1/ocorrencias` - Listar (requer EmpresaId, PageIndex, PageSize)
- `POST /v1/ocorrencias` - Criar (requer EmpresaId, UnidadeId + body)

**Correções:**
- `GET /v1/correcoes` - Listar (requer ocorrenciaId, EmpresaId)
- `GET /v1/correcoes/{id}/toedit` - Para edição (requer EmpresaId)
- `GET /v1/correcoes/tipos` - Tipos (requer EmpresaId)
- `POST /v1/correcoes` - Criar (body com ocorrenciaId, descrição, etc)

**Atividades:**
- `GET /v1/atividades` - Listar (requer EmpresaId, X-Transaction-Id, StatusId, SelectedDate)
- `GET /v1/atividades/plano` - Plano (mesmos headers/params)
- `GET /v1/atividades/aplicacao` - Aplicação (mesmos + SiteId opcional)

**Baixa:**
- `GET /v1/atividades/baixa/list` - Listar (query: ids[])
- `GET /v1/atividades/{tarefa}/medicoes` - Medições
- `GET /v1/atividades/justificativas` - Justificativas (requer EmpresaId)
- `PUT /v1/atividades/baixa` - Realizar baixa
- `POST /v1/atividades/medicoes` - Enviar medições

## Troubleshooting

### Token expirado
O sistema detecta automaticamente quando o token expira e faz logout. Use "Refresh Token" antes de expirar.

### Erro 401 Unauthorized
Verifique se:
1. Você está autenticado
2. O token não expirou
3. As credenciais estão corretas

### Erro 400 Bad Request
Verifique se:
1. Todos os campos obrigatórios estão preenchidos
2. Os IDs de configuração estão corretos
3. O formato dos dados está correto (ex: data em YYYY-MM-DD)

### Erro de CORS
Este projeto deve ser usado apenas em desenvolvimento local.

## Limpeza de Dados

Ao terminar de usar:
1. Clique em "Logout" para limpar tokens
2. Feche o navegador para limpar sessionStorage
3. Não deixe a aplicação aberta sem supervisão

## Licença e Uso

Esta ferramenta é de uso interno e desenvolvimento apenas. Não redistribuir.
