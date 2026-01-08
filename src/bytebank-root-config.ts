import { registerApplication, start } from 'single-spa';
import { isHomeActive, isDashboardActive, isFinanceiroActive } from '@bytebank/shared';

console.log('🟢 Root Config - Inicializando...');

// Registra a aplicação global (navbar) - sempre ativa
registerApplication({
  name: '@bytebank/base',
  app: () => import('@bytebank/base'),
  activeWhen: () => true,
});

// Registra o microfrontend financeiro
registerApplication({
  name: '@bytebank/financeiro',
  app: () => import('@bytebank/financeiro'),
  activeWhen: isFinanceiroActive,
});

// Registra o microfrontend dashboard
registerApplication({
  name: '@bytebank/dashboard',
  app: () => import('@bytebank/dashboard'),
  activeWhen: isDashboardActive,
});

// Inicia o Single SPA
start({
  urlRerouteOnly: true,
});

console.log('🏦 ByteBank Root Config carregado com sucesso!');

// Esconder loading
setTimeout(() => {
  const loading = document.getElementById('loading');
  if (loading) loading.style.display = 'none';
}, 1000);
