# Root Config - Orquestrador de Microfrontends ByteBank

## 📋 Visão Geral

O **Root Config** é o coração da arquitetura de microfrontends do ByteBank. Ele atua como o orquestrador principal que gerencia o ciclo de vida de todos os outros microfrontends, definindo quando e onde cada aplicação deve ser montada e desmontada.

## 🎯 Responsabilidades

### 1. **Orquestração de Microfrontends**
- Registra todos os microfrontends disponíveis no sistema
- Define regras de ativação baseadas em rotas (URL)
- Gerencia o ciclo de vida (bootstrap, mount, unmount) de cada MFE
- Garante que apenas os microfrontends necessários estejam ativos

### 2. **Import Map Configuration**
- Define o mapeamento de módulos do SystemJS
- Especifica onde cada microfrontend está localizado
- Gerencia dependências compartilhadas (React, Redux, Single-SPA)

### 3. **Carregamento Inicial**
- Serve o HTML principal da aplicação
- Carrega o SystemJS (module loader)
- Inicializa o Single-SPA framework
- Apresenta tela de loading enquanto os MFEs são carregados

## 🏗️ Arquitetura

```
root-config/
├── src/
│   └── bytebank-root-config.ts    # Configuração Single-SPA
├── index.html                      # HTML principal com import map
├── vite.config.ts                  # Configuração Vite
├── package.json                    # Dependências
└── README.md                       # Este arquivo
```

## 📦 Estrutura de Arquivos

### `index.html`
O ponto de entrada da aplicação. Contém:

**Import Map:**
```javascript
{
  "imports": {
    "single-spa": "https://cdn.jsdelivr.net/npm/single-spa@5.9.5/...",
    "react": "https://cdn.jsdelivr.net/npm/react@18.2.0/...",
    "react-dom": "https://cdn.jsdelivr.net/npm/react-dom@18.2.0/...",
    "@bytebank/root-config": "//localhost:9000/bytebank-root-config.js",
    "@bytebank/base": "//localhost:9001/bytebank-base.js",
    "@bytebank/financeiro": "//localhost:9002/bytebank-financeiro.js",
    "@bytebank/dashboard": "//localhost:9003/bytebank-dashboard.js"
  }
}
```

**Elementos de Montagem:**
- `<nav id="navbar">` - Container para o componente Navbar do @bytebank/base
- `<main id="single-spa-application:@bytebank/financeiro">` - Container para o MFE Financeiro
- `<main id="single-spa-application:@bytebank/dashboard">` - Container para o MFE Dashboard

**Loading State:**
- Exibe logo animado do ByteBank durante carregamento
- Oculto automaticamente após Single-SPA inicializar

### Observações sobre ajustes recentes
- O `index.html` do `root-config` constrói o `importmap` em runtime e permite que `window.__BYTEBANK_IMPORTMAP__` sobrescreva o mapa para ambientes de deploy (útil para apontar MFEs para URLs externas em produção).
- Exponibilizamos `window.__BYTEBANK_API_BASE__` e `window.__BYTEBANK_ASSET_BASE__` como variáveis globais de runtime para configurar base de APIs e assets sem recompilar os MFEs.
- Predicados de rota e `createDomGetter` foram movidos para `@bytebank/shared` quando aplicável, reduzindo duplicação entre MFEs.


### `src/bytebank-root-config.ts`
Arquivo de configuração principal do Single-SPA:

**Registro de Aplicações:**

1. **@bytebank/base** (Global)
   - Sempre ativo em todas as rotas (`activeWhen: ['/']`)
   - Carrega componentes compartilhados (Navbar, Store)

2. **@bytebank/financeiro**
   - Ativo nas rotas: `/financeiro`, `/transacoes`, `/extrato`
   - Gerencia transações e histórico financeiro

3. **@bytebank/dashboard**
   - Ativo nas rotas: `/dashboard`, `/` (home)
   - Exibe visão geral das contas

**Código de Registro:**
```typescript
import { registerApplication, start, LifeCycles } from 'single-spa';

registerApplication({
  name: '@bytebank/base',
  app: () => System.import('@bytebank/base') as Promise<LifeCycles>,
  activeWhen: ['/'],
});

registerApplication({
  name: '@bytebank/financeiro',
  app: () => System.import('@bytebank/financeiro') as Promise<LifeCycles>,
  activeWhen: ['/financeiro', '/transacoes', '/extrato'],
});

registerApplication({
  name: '@bytebank/dashboard',
  app: () => System.import('@bytebank/dashboard') as Promise<LifeCycles>,
  activeWhen: ['/dashboard', '/'],
});

start({
  urlRerouteOnly: true, // Apenas roteamento por URL
});
```

## 🔄 Fluxo de Execução

```
1. Usuário acessa http://localhost:9000
   ↓
2. index.html é carregado
   ↓
3. SystemJS carrega o import map
   ↓
4. System.import('@bytebank/root-config') é executado
   ↓
5. Single-SPA registra todos os microfrontends
   ↓
6. Single-SPA.start() inicializa o framework
   ↓
7. @bytebank/base é montado (sempre ativo)
   ↓
8. Baseado na URL, outros MFEs são montados:
   - "/" → @bytebank/dashboard
   - "/financeiro" → @bytebank/financeiro
   - "/dashboard" → @bytebank/dashboard
   ↓
9. Loading state é ocultado
   ↓
10. Aplicação está pronta para uso
```

## 🚀 Como Funciona o Single-SPA

### Ciclo de Vida dos Microfrontends

Cada microfrontend passa por 4 fases:

1. **LOAD**: Carrega o código do microfrontend via SystemJS
2. **BOOTSTRAP**: Inicializa configurações (executado apenas uma vez)
3. **MOUNT**: Monta o componente React no DOM
4. **UNMOUNT**: Remove o componente do DOM quando inativo

### Ativação por Rota

O Single-SPA monitora mudanças na URL e:
- Desmonta (unmount) MFEs que não correspondem mais à rota
- Monta (mount) MFEs que agora correspondem à rota
- Mantém montados MFEs que estão sempre ativos

**Exemplo:**
```
URL: "/"
Ativos: @bytebank/base, @bytebank/dashboard

Usuário navega para "/financeiro"

URL: "/financeiro"
Ativos: @bytebank/base, @bytebank/financeiro
Desmontado: @bytebank/dashboard
```

## 🔧 Configuração do Vite

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      input: 'src/bytebank-root-config.ts',
      output: {
        format: 'system',              // Formato SystemJS
        entryFileNames: 'bytebank-root-config.js',
      },
      external: ['single-spa'],        // Não bundlar Single-SPA
    },
    outDir: 'dist',
    lib: {
      entry: 'src/bytebank-root-config.ts',
      formats: ['system'],
    },
  },
  server: {
    port: 9000,
    cors: true,                        // Habilitar CORS
  },
  preview: {
    port: 9000,
    cors: true,
  },
});
```

**Pontos Importantes:**
- `format: 'system'`: Gera código compatível com SystemJS
- `external: ['single-spa']`: Single-SPA vem do CDN, não deve ser bundlado
- `cors: true`: Permite que outros MFEs sejam carregados

## 📡 Comunicação entre Microfrontends

### Via Event Bus
O root-config não implementa comunicação direta, mas os MFEs podem se comunicar através de:

1. **Custom Events (window.dispatchEvent)**
2. **Redux Store Compartilhado** (@bytebank/base)
3. **URL/Query Parameters**
4. **LocalStorage/SessionStorage**

## 🎨 Design System

### Cores ByteBank (CSS Variables)
```css
:root {
  --bytebank-green: #47A138;
  --bytebank-green-dark: #3a8a2e;
  --bytebank-green-light: #59b449;
  --bytebank-black: #000000;
  --bytebank-gray: #CCCCCC;
  --bytebank-gray-light: #e4e1e1;
  --bytebank-gray-medium: #666666;
}
```

### Tipografia
- Fonte: **Inter** (Google Fonts)
- Pesos: 400 (regular), 500 (medium), 600 (semi-bold), 700 (bold)

## 🛠️ Comandos Disponíveis

### Desenvolvimento
```bash
npm run dev
```
Inicia o servidor de desenvolvimento na porta 9000.

### Build
```bash
npm run build
```
Cria build de produção na pasta `dist/`.

### Preview
```bash
npm run preview
```
Serve o build de produção para testes.

## 📊 Dependências

### Produção
```json
{
  "single-spa": "^5.9.5",           // Framework de microfrontends
  "single-spa-layout": "^2.2.0"     // Layout helper (futuro uso)
}
```

### Desenvolvimento
```json
{
  "vite": "^5.1.0",                 // Build tool
  "vite-plugin-single-spa": "^0.8.0" // Plugin Vite para Single-SPA
}
```

## 🔍 Troubleshooting

### Problema: Microfrontend não carrega (404)
**Causa:** O servidor do microfrontend não está rodando ou na porta errada.

**Solução:**
```bash
# Verificar se todos os servidores estão rodando
lsof -i :9000  # Root Config
lsof -i :9001  # Base
lsof -i :9002  # Financeiro
lsof -i :9003  # Dashboard

# Iniciar todos os servidores
cd /caminho/projeto && ./start-preview.sh
```

### Problema: CORS Error
**Causa:** Configuração CORS desabilitada.

**Solução:** Verificar `vite.config.ts` de todos os projetos tem `cors: true`.

### Problema: Single-SPA não inicializa
**Causa:** Erro JavaScript em algum microfrontend.

**Solução:**
1. Abrir DevTools (F12)
2. Verificar erros no Console
3. Verificar aba Network se todos os arquivos carregaram
4. Verificar logs individuais em `logs-*.log`

### Problema: Loading state não desaparece
**Causa:** Erro no carregamento do root-config.

**Solução:**
```bash
# Verificar se o arquivo foi gerado
ls -lh dist/bytebank-root-config.js

# Testar acesso direto
curl http://localhost:9000/bytebank-root-config.js

# Verificar logs
tail -f logs-root-config.log
```

## 📈 Melhorias Futuras

### 1. Single-SPA Layout
Implementar `single-spa-layout` para gerenciamento declarativo de rotas:
```typescript
import { constructRoutes, constructApplications, constructLayoutEngine } from 'single-spa-layout';

const routes = constructRoutes(document.querySelector('#single-spa-layout'));
const applications = constructApplications({ routes });
const layoutEngine = constructLayoutEngine({ routes, applications });
```

### 2. Error Boundaries Globais
Adicionar tratamento de erros global:
```typescript
window.addEventListener('single-spa:routing-event', (evt) => {
  console.log('Route change:', evt.detail);
});

window.addEventListener('single-spa:app-change', (evt) => {
  console.log('App change:', evt.detail);
});
```

### 3. Performance Monitoring
Adicionar métricas de performance:
```typescript
performance.mark('spa-start');
start().then(() => {
  performance.mark('spa-ready');
  performance.measure('spa-boot', 'spa-start', 'spa-ready');
});
```

### 4. Lazy Loading com Preload
Otimizar carregamento:
```typescript
// Preload de microfrontends em idle time
requestIdleCallback(() => {
  System.import('@bytebank/financeiro');
  System.import('@bytebank/dashboard');
});
```

## 📚 Recursos Adicionais

- [Single-SPA Documentation](https://single-spa.js.org/)
- [SystemJS Documentation](https://github.com/systemjs/systemjs)
- [Vite Documentation](https://vitejs.dev/)
- [Microfrontends.info](https://microfrontends.info/)

## 👥 Equipe

**FIAP Grupo 30 - Tech Challenge 2**

## 📄 Licença

MIT License
