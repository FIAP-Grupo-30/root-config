import { lazy, Suspense } from 'react';

// const BaseApp = lazy(() => import('@bytebank/base/bytebank-base'));
const DashboardApp = lazy(() => import('@bytebank/dashboard/bytebank-dashboard'));
const FinanceiroApp = lazy(() => import('@bytebank/financeiro/bytebank-financeiro'));

function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-black to-gray-900">
      <div className="w-20 h-20 bg-[#47A138] rounded-2xl flex items-center justify-center mb-6">
        <span className="text-4xl font-bold text-white">B</span>
      </div>
      <p className="text-white text-lg font-medium">Carregando ByteBank...</p>
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      {/* <BaseApp /> */}
      <DashboardApp />
      <FinanceiroApp />
    </Suspense>
  );
}

export default App;
