import { useRouter } from 'next/router'
import Head from 'next/head'
import { useState } from 'react'
import NewsList from '../components/NewsList'

export default function ResearcherPage() {
  const router = useRouter()
  const { researcher } = router.query

  const [showRead, setShowRead] = useState(false)
  const [showImportant, setShowImportant] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-white">
      <Head>
        <title>{researcher} - Research Analyst News</title>
        <meta name="description" content={`News dashboard for ${researcher}`} />
      </Head>

      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-gray-800 tracking-tight">
            📰 News for {researcher}
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <label className="mr-4">
            <input type="checkbox" checked={showRead} onChange={e => setShowRead(e.target.checked)} />
            Show Read
          </label>
          <label className="ml-4">
            <input type="checkbox" checked={showImportant} onChange={e => setShowImportant(e.target.checked)} />
            Show Important
          </label>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <NewsList
            filters={{
              researcher: Array.isArray(researcher) ? researcher[0] : (researcher || 'all'),
              showRead,
              showImportant
            }}
          />
        </div>
      </main>
    </div>
  )
}
