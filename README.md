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
Estilos globais com Tailwind CSS v4. Usa `@import "tailwindcss"` para importar o Tailwind. Contém variáveis CSS do design system ByteBank.

### `vite.config.ts`
Configuração do Vite com Module Federation e Tailwind CSS v4:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
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
  server: {
    port: 9000,
  },
});
```

### `index.html`
HTML principal simplificado contendo apenas:
- Meta tags básicas
- Links para Google Fonts (Inter)
- Container `#root` para React
- Script para importar `main.tsx`

### Tailwind CSS v4
O Tailwind CSS é configurado via plugin Vite (`@tailwindcss/vite`) no `vite.config.ts`. Não há necessidade de `tailwind.config.js` - as configurações são feitas via CSS usando `@theme` se necessário.

### `biome.json`
Configuração do BiomeJS para lint e formatação de código.

### `types.d.ts`
Arquivo de declaração de tipos TypeScript para os módulos federados. Define as tipagens para os imports dos microfrontends remotes:

```typescript
declare module '@bytebank/base/bytebank-base' {
  import type { ComponentType } from 'react';
  const BaseApp: ComponentType;
  export default BaseApp;
}

declare module '@bytebank/financeiro/bytebank-financeiro' {
  import type { ComponentType } from 'react';
  const FinanceiroApp: ComponentType;
  export default FinanceiroApp;
}

declare module '@bytebank/dashboard/bytebank-dashboard' {
  import type { ComponentType } from 'react';
  const DashboardApp: ComponentType;
  export default DashboardApp;
}
```

Este arquivo permite que o TypeScript reconheça os módulos federados e forneça autocompletar e verificação de tipos adequados.

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

### Uso de Prefixos Tailwind CSS

⚠️ **IMPORTANTE**: Este projeto utiliza o prefixo `root:` para todas as classes Tailwind CSS para evitar conflitos com outros microfrontends.

#### Configuração

O prefixo é configurado no arquivo `src/globals.css`:

```css
@import "tailwindcss" prefix(root);
```

#### Como Usar Classes Tailwind

Todas as classes Tailwind usadas diretamente no JSX devem incluir o prefixo `root:`:

```tsx
// ✅ CORRETO - Com prefixo
<div className="root:flex root:items-center root:justify-center">
  <p className="root:text-2xl root:font-bold root:text-white">Conteúdo</p>
</div>

// ❌ ERRADO - Sem prefixo (pode causar conflitos)
<div className="flex items-center justify-center">
  <p className="text-2xl font-bold text-white">Conteúdo</p>
</div>
```

#### Variantes e Responsividade

Para variantes como `hover:`, `focus:`, e breakpoints responsivos (`md:`, `lg:`, etc.), use o formato `[prefixo]:[variante]:[classe]`:

```tsx
// Hover
<button className="root:bg-green-500 root:hover:bg-green-600">

// Responsividade
<div className="root:flex root:flex-col root:md:flex-row">

// Classes arbitrárias
<div className="root:bg-[#47A138] root:w-[170px]">
```

#### No @apply (globals.css)

Quando usar `@apply` dentro de `@layer components`, use o formato `[prefixo]:[variante]:[classe]`:

```css
@layer components {
  .minha-classe {
    @apply root:bg-white root:hover:bg-gray-100 root:md:flex;
  }
}
```

#### Classes Customizadas (NÃO precisam de prefixo)

Classes customizadas definidas em `@layer components` (como `.btn-bytebank-primary`) **NÃO** precisam de prefixo, pois já são nomes únicos:

```tsx
// ✅ CORRETO - Classe customizada sem prefixo
<button className="btn-bytebank-primary">Clique aqui</button>
```

### Tipografia
- Fonte: **Inter** (Google Fonts)
- Pesos: 400 (regular), 500 (medium), 600 (semi-bold), 700 (bold)

## 🛠️ Comandos Disponíveis

### Desenvolvimento
```bash
npm run dev
```
Inicia o servidor de desenvolvimento na porta 9000 e abre o navegador automaticamente.

### Build
```bash
npm run build        # Build de produção
npm run build:watch # Build em modo watch (para desenvolvimento com Module Federation)
```

### Preview
```bash
npm run preview
```
Serve o build de produção para testes.

### Module Federation (Desenvolvimento)
```bash
npm run federation
```
Executa build em watch mode e preview simultaneamente. Útil para testar Module Federation localmente.

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
  "react": "^19.2.3",
  "react-dom": "^19.2.3",
  "react-router-dom": "^7.12.0"
}
```

### Desenvolvimento
```json
{
  "vite": "^7.3.1",
  "@originjs/vite-plugin-federation": "^1.4.1",
  "@vitejs/plugin-react": "^5.1.2",
  "@tailwindcss/vite": "^4.1.18",
  "tailwindcss": "^4.1.18",
  "@biomejs/biome": "^2.3.11",
  "@types/react": "^19.2.8",
  "@types/react-dom": "^19.2.3",
  "concurrently": "^9.2.1",
  "typescript": "^5.9.3"
}
```

**Principais tecnologias:**
- **React 19**: Framework UI
- **Vite 7**: Build tool e dev server
- **Tailwind CSS v4**: Framework CSS (via plugin Vite)
- **Module Federation**: Microfrontends
- **BiomeJS 2.3**: Linter e formatter
- **TypeScript 5.9**: Tipagem estática

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
**Causa:** Tailwind CSS v4 não está compilando corretamente.

**Solução:**
1. Verificar se o plugin `@tailwindcss/vite` está configurado no `vite.config.ts`
2. Verificar se `src/index.css` importa `@import "tailwindcss";`
3. Limpar cache: `rm -rf node_modules/.vite`
4. Verificar se `tailwindcss` e `@tailwindcss/vite` estão instalados

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
- [React 19 Documentation](https://react.dev/)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [BiomeJS Documentation](https://biomejs.dev/)

## 🔧 Gerenciamento de Versões

### Node.js
O projeto utiliza **Node.js LTS 24.12.0**, gerenciado via **asdf**. A versão está especificada no `package.json` (engines).

Para configurar o ambiente:
```bash
asdf install nodejs 24.12.0
asdf local nodejs 24.12.0
```

## 🆕 Tecnologias e Versões

### Stack Principal
- **React 19.2.3**: Framework UI com novas features e melhorias de performance
- **Vite 7.3.1**: Build tool de próxima geração com HMR ultra-rápido
- **Tailwind CSS v4.1.18**: Framework CSS com plugin Vite nativo
- **TypeScript 5.9.3**: Tipagem estática
- **BiomeJS 2.3.11**: Linter e formatter moderno e rápido

### Module Federation
- **@originjs/vite-plugin-federation 1.4.1**: Plugin para Module Federation no Vite

### Características do Tailwind CSS v4
- Configuração via plugin Vite (`@tailwindcss/vite`)
- Não requer `tailwind.config.js` (configuração via CSS com `@theme`)
- Importação simplificada: `@import "tailwindcss";`
- Melhor performance e menor bundle size

## 🛠️ Plataforma de hospedagem

Vercel - https://vercel.com/

## 👥 Equipe

**FIAP Grupo 30 - Tech Challenge 2**

## 📄 Licença

MIT License
