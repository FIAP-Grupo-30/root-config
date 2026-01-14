/// <reference types="react" />

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
