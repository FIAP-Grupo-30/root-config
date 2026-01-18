import { lazy, Suspense } from "react";

const BaseApp = lazy(() => import("@bytebank/base/bytebank-base"));

function LoadingFallback() {
	return (
		<div className="root:flex root:flex-col root:items-center root:justify-center root:min-h-screen root:bg-gradient-to-br root:from-black root:to-gray-900">
			<div className="root:w-20 root:h-20 root:bg-[#47A138] root:rounded-2xl root:flex root:items-center root:justify-center root:mb-6">
				<span className="root:text-4xl root:font-bold root:text-white">B</span>
			</div>
			<p className="root:text-white root:text-lg root:font-medium">Carregando ByteBank...</p>
		</div>
	);
}

function App() {
	return (
		<Suspense fallback={<LoadingFallback />}>
			<BaseApp />
		</Suspense>
	);
}

export default App;
