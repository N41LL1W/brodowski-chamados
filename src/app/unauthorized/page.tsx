// src/app/unauthorized/page.tsx

import Link from 'next/link';

export default function UnauthorizedPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-center p-6">
            <h1 className="text-6xl font-extrabold text-red-600 dark:text-red-400 mb-4">
                Acesso Negado
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
                Você não possui o nível de permissão necessário para acessar esta página.
            </p>
            <div className="space-x-4">
                <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300">
                    Ir para a Página Inicial
                </Link>
                <Link href="/login" className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-300">
                    Tentar Novamente (Login)
                </Link>
            </div>
        </div>
    );
}