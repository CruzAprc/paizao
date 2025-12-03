import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Paizao',
  description: 'Sistema de gerenciamento de dietas e treinos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <nav className="bg-purple-600 text-white shadow-md">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-xl">PZ</span>
                </div>
                <h1 className="text-2xl font-bold">Paizao</h1>
              </Link>

              <div className="flex space-x-4">
                <Link
                  href="/diets/new"
                  className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition font-semibold"
                >
                  Nova Dieta
                </Link>
                <Link
                  href="/workouts/new"
                  className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition font-semibold"
                >
                  Novo Treino
                </Link>
                <Link
                  href="/templates/diets"
                  className="px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition font-semibold"
                >
                  Templates
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="container mx-auto py-8 px-4">
          {children}
        </main>
      </body>
    </html>
  )
}
