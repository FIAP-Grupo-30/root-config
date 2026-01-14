# Root Config - Host Application ByteBank

## 📋 Visão Geral

O **Root Config** é a aplicação host principal da arquitetura de microfrontends do ByteBank. Ele utiliza **Module Federation** para carregar e orquestrar os microfrontends remotes, servindo como ponto de entrada único da aplicação.

## 🎯 Responsabilidades

### 1. **Host Application (Module Federation)**
- Configura o Module Federation como container host
- Carrega microfrontends remotes dinamicamente
- Gerencia dependências compartilhadas (React, React-DOM, etc)
- Serve como ponto de entrada único da aplicação

### 2. **Layout e Roteamento**
- Fornece estrutura base da aplicação
- Renderiza o microfrontend base que contém header/footer/navbar
- Gerencia carregamento lazy dos remotes

### 3. **Configuração Global**
- Define configurações globais (fontes, estilos base)
- Mantém variáveis CSS do design system
- Configura Tailwind CSS para estilização

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────┐
│         root-config (HOST)              │
│  - Consome remotes via Module Fed       │
│  - Renderiza BaseApp                    │
│  - Tailwind CSS próprio                 │
└─────────────────────────────────────────┘
           │
           │ Module Federation
           │
    ┌──────▼──────┐
    │ BaseApp     │
    │ (Remote)    │
    │ - Header    │
    │ - Footer    │
    │ - Routes    │
    └─────────────┘
```

## 📦 Estrutura de Arquivos

### `src/main.tsx`
Ponto de entrada da aplicação React. Renderiza o componente App.

### `src/App.tsx`
Componente principal que carrega o BaseApp via Module Federation usando lazy loading.

### `src/index.css`
Estilos globais e diretivas do Tailwind CSS. Contém variáveis CSS do design system ByteBank.

### `vite.config.ts`
Configuração do Vite com Module Federation:

```typescript
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'root_config',
      remotes: {
        '@bytebank/base': 'http://localhost:9001/assets/remoteEntry.js',
        '@bytebank/financeiro': 'http://localhost:9002/assets/remoteEntry.js',
        '@bytebank/dashboard': 'http://localhost:9003/assets/remoteEntry.js',
      },
      shared: ['react', 'react-dom', 'react-router-dom'],
    }),
  ],
});
```

### `index.html`
HTML principal simplificado contendo apenas:
- Meta tags básicas
- Links para Google Fonts (Inter)
- Container `#root` para React
- Script para importar `main.tsx`

### `tailwind.config.js`
Configuração do Tailwind CSS com tema customizado ByteBank (cores, tipografia).

### `biome.json`
Configuração do BiomeJS para lint e formatação de código.

## 🔄 Fluxo de Execução

```
1. Usuário acessa http://localhost:9000
   ↓
2. index.html é carregado
   ↓
3. main.tsx inicializa React
   ↓
4. App.tsx renderiza
   ↓
5. BaseApp é carregado via Module Federation (lazy)
   ↓
6. BaseApp gerencia rotas e carrega outros microfrontends
   ↓
7. Aplicação está pronta para uso
```

## 🚀 Como Funciona o Module Federation

### Shared Dependencies
O Module Federation compartilha dependências entre host e remotes:
- `react`
- `react-dom`
- `react-router-dom`

Isso garante que apenas uma versão dessas bibliotecas seja carregada, otimizando o tamanho do bundle.

### Remote Loading
Os microfrontends são carregados dinamicamente quando necessário:
- `@bytebank/base`: Sempre carregado (header/footer/routes)
- `@bytebank/financeiro`: Carregado nas rotas `/financeiro`, `/transacoes`, `/extrato`
- `@bytebank/dashboard`: Carregado nas rotas `/dashboard`, `/`

### Lazy Loading
O React.Suspense é usado para carregamento assíncrono dos remotes, exibindo um loading state durante o carregamento.

## 🎨 Design System

### Cores ByteBank (CSS Variables e Tailwind)

```css
:root {
  --bytebank-green: #47a138;
  --bytebank-green-dark: #3a8a2e;
  --bytebank-green-light: #59b449;
  --bytebank-black: #000000;
  --bytebank-gray: #cccccc;
  --bytebank-gray-light: #e4e1e1;
  --bytebank-gray-medium: #666666;
}
```

Classes Tailwind disponíveis:
- `bg-bytebank-green`
- `text-bytebank-green`
- `bg-bytebank-gray`
- etc.

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

### Linting e Formatação
```bash
npm run lint      # Verifica problemas de código
npm run format    # Formata o código
npm run check     # Executa lint + format
```

## 📊 Dependências

### Produção
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.30.2",
  "@bytebank/shared": "git+https://github.com/FIAP-Grupo-30/shared.git"
}
```

### Desenvolvimento
```json
{
  "vite": "^5.1.0",
  "@originjs/vite-plugin-federation": "^1.3.5",
  "@vitejs/plugin-react": "^4.2.1",
  "tailwindcss": "^3.4.19",
  "@biomejs/biome": "^1.9.4",
  "typescript": "^5.3.3"
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

# Iniciar todos os servidores em terminais separados
cd root-config && npm run dev
cd tech-challenge-2-base && npm run dev
cd tech-challenge-2-financeiro && npm run dev
cd tech-challenge-2-dashboard && npm run dev
```

### Problema: Erro de Module Federation
**Causa:** Versões incompatíveis ou configuração incorreta.

**Solução:**
1. Verificar se as versões do React são compatíveis entre host e remotes
2. Verificar se os remotes estão exportando corretamente
3. Verificar console do navegador para erros específicos

### Problema: Estilos não aplicados
**Causa:** Tailwind CSS não está compilando corretamente.

**Solução:**
1. Verificar se `tailwind.config.js` está configurado corretamente
2. Verificar se `src/index.css` importa as diretivas do Tailwind
3. Limpar cache: `rm -rf node_modules/.vite`

## 📈 Melhorias Futuras

### 1. Error Boundaries
Adicionar tratamento de erros global para microfrontends:
```typescript
<ErrorBoundary fallback={<ErrorFallback />}>
  <BaseApp />
</ErrorBoundary>
```

### 2. Performance Monitoring
Adicionar métricas de performance:
- Tempo de carregamento dos remotes
- Bundle size tracking
- Lighthouse CI

### 3. Preloading de Remotes
Otimizar carregamento antecipado:
```typescript
// Preload em idle time
requestIdleCallback(() => {
  import('@bytebank/financeiro');
  import('@bytebank/dashboard');
});
```

### 4. Versionamento de Remotes
Implementar estratégia de versionamento para remotes em produção.

## 📚 Recursos Adicionais

- [Module Federation Documentation](https://module-federation.io/)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [BiomeJS Documentation](https://biomejs.dev/)

## 🔧 Gerenciamento de Versões

### Node.js
O projeto utiliza **Node.js LTS 24.12.0**, gerenciado via **asdf**. A versão está especificada no `package.json` (engines).

Para configurar o ambiente:
```bash
asdf install nodejs 24.12.0
asdf local nodejs 24.12.0
```

## 👥 Equipe

**FIAP Grupo 30 - Tech Challenge 2**

## 📄 Licença

MIT License
