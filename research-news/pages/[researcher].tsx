import { useRouter } from 'next/router'
import Head from 'next/head'
import { useState } from 'react'
import NewsList from '../components/NewsList'
import ResearcherFilter from '../components/ResearcherFilter'

export default function ResearcherPage() {
  const router = useRouter()
  const { researcher } = router.query

  const [showRead, setShowRead] = useState(false)
  const [showImportant, setShowImportant] = useState(false)
  const [showFilterMobile, setShowFilterMobile] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedQuery, setSelectedQuery] = useState('')

  const handleResearcherChange = (newResearcher: string) => {
    if (newResearcher !== 'all') {
      router.push(`/${encodeURIComponent(newResearcher)}`)
    } else {
      router.push(`/all`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-white">
      <Head>
        <title>{researcher} - Research Analyst News</title>
        <meta name="description" content={`News dashboard for ${researcher}`} />
      </Head>

      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* Toggle Button for Mobile */}
          <div className="md:hidden flex justify-between items-center">
            <h1 className="text-lg font-semibold text-gray-800">📰 Research News</h1>
            <button
              onClick={() => setShowFilterMobile(prev => !prev)}
              className="px-3 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200 underline"
            >
              {showFilterMobile ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          {/* Filters - always show on md+, toggle on mobile */}
          <div className={`${showFilterMobile ? 'block' : 'hidden'} md:block mt-4 md:mt-0`}>
            <ResearcherFilter
              selectedResearcher={Array.isArray(researcher) ? researcher[0] : (researcher || 'all')}
              onResearcherChange={handleResearcherChange}
              showRead={showRead}
              onShowReadChange={setShowRead}
              showImportant={showImportant}
              onShowImportantChange={setShowImportant}
              selectedDate={selectedDate}
              onSelectedDateChange={setSelectedDate}
              selectedQuery={selectedQuery}
              onQueryChange={setSelectedQuery}
            />

          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <NewsList
            filters={{
              researcher: Array.isArray(researcher) ? researcher[0] : (researcher || 'all'),
              showRead,
              showImportant, 
              selectedDate,
              selectedQuery
            }}
          />
        </div>
      </main>
    </div>
  )
}