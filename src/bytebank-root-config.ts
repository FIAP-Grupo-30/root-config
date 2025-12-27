import { registerApplication, start, LifeCycles } from 'single-spa';

// Registra a aplicação global (navbar, componentes compartilhados)
registerApplication({
  name: '@bytebank/base',
  app: () => System.import('@bytebank/base') as Promise<LifeCycles>,
  activeWhen: ['/'],
});

// Registra o microfrontend financeiro
registerApplication({
  name: '@bytebank/financeiro',
  app: () => System.import('@bytebank/financeiro') as Promise<LifeCycles>,
  activeWhen: ['/financeiro', '/transacoes', '/extrato'],
});

// Registra o microfrontend dashboard
registerApplication({
  name: '@bytebank/dashboard',
  app: () => System.import('@bytebank/dashboard') as Promise<LifeCycles>,
  activeWhen: ['/dashboard', '/'],
});

// Inicia o Single SPA
start({
  urlRerouteOnly: true,
});

console.log('🏦 ByteBank Root Config carregado com sucesso!');
