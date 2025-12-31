import { registerApplication, start } from 'single-spa';

console.log('🟢 Root Config - Inicializando...');

// Função para verificar se está na Home (apenas rota raiz exata)
function isHomeActive(location: Location): boolean {
  return location.pathname === '/';
}

// Função para verificar se está na rota do dashboard
function isDashboardActive(location: Location): boolean {
  const path = location.pathname;
  return path === '/dashboard' || path.startsWith('/dashboard/');
}

// Função para verificar se está na rota do financeiro
function isFinanceiroActive(location: Location): boolean {
  const path = location.pathname;
  return path === '/financeiro' || path.startsWith('/financeiro/') ||
         path === '/transacoes' || path.startsWith('/transacoes/') ||
         path === '/extrato' || path.startsWith('/extrato/');
}

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
