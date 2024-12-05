'use client'

import { Search } from 'lucide-react'
import { useState } from 'react'

interface SearchBarProps {
  totalItems: number;
  onSearch: (query: string) => void;
}

export default function SearchBar({ totalItems, onSearch }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    onSearch(query)
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div className="relative flex-1 max-w-2xl">
          <input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 bg-[#1A1F25] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <div className="text-gray-400 ml-4">
          {totalItems} items
        </div>
      </div>
    </div>
  )
}
