import React, { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import ResearcherFilter from '../components/ResearcherFilter'

export default function Home() {
  const router = useRouter()
  const [selectdDate, setSelectedDate] = useState('')
  const handleResearcherChange = (newResearcher: string) => {
    // Redirect to /[researcher]
    if (newResearcher !== 'all') {
      router.push(`/${encodeURIComponent(newResearcher)}`)
    } else {
      router.push(`/all`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-white">
      <Head>
        <title>Research Analyst News</title>
        <meta name="description" content="News dashboard for research analysts" />
      </Head>

      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-gray-800 tracking-tight">
            📰 Research Analyst News
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="bg-white rounded-2xl shadow p-6 transition hover:shadow-lg duration-300">
          {/* Only keep researcher filter */}
          <ResearcherFilter
            selectedResearcher="all"
            onResearcherChange={handleResearcherChange}
            showRead={false}
            onShowReadChange={() => {}}
            showImportant={false}
            onShowImportantChange={() => {}}
            selectedDate = {selectdDate}
            onSelectedDateChange = {setSelectedDate}
            selectedQuery={""}
            onQueryChange={() => {}}
          />
        </div>
      </main>
    </div>
  )
}
