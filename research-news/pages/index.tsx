import React, { useState } from 'react'
import Head from 'next/head'
import ResearcherFilter from '../components/ResearcherFilter'
import NewsList from '../components/NewsList'

export default function Home() {
  const [selectedResearcher, setSelectedResearcher] = useState('all')
  const [showRead, setShowRead] = useState(false)
  const [showImportant, setShowImportant] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-white">
      <Head>
        <title>Research Analyst News</title>
        <meta name="description" content="News dashboard for research analysts" />
      </Head>

      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-gray-800 tracking-tight">
            📰 Research Analyst News
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="bg-white rounded-2xl shadow p-6 transition hover:shadow-lg duration-300">
          <ResearcherFilter
            selectedResearcher={selectedResearcher}
            onResearcherChange={setSelectedResearcher}
            showRead={showRead}
            onShowReadChange={setShowRead}
            showImportant={showImportant}
            onShowImportantChange={setShowImportant}
          />
        </div>

        <div className="bg-white rounded-2xl shadow p-6 transition hover:shadow-lg duration-300">
          <NewsList
            filters={{
              researcher: selectedResearcher,
              showRead,
              showImportant
            }}
          />
        </div>
      </main>
    </div>
  )
}
