'use client'

import { useState } from 'react'
import { ChevronDown, ArrowUpDown } from 'lucide-react'

interface FilterBarProps {
  onSort: (field: string, direction: 'asc' | 'desc') => void;
  onFilter: (type: string, value: string) => void;
}

export default function FilterBar({ onSort, onFilter }: FilterBarProps) {
  const [sortStates, setSortStates] = useState({
    date: 'desc',
    rating: 'desc',
    chatRating: 'desc'  // Changed from 'chat' to 'chatRating' to match the model field
  } as Record<string, 'asc' | 'desc'>)

  const handleSort = (field: string) => {
    const newDirection = sortStates[field] === 'desc' ? 'asc' : 'desc'
    setSortStates(prev => ({ ...prev, [field]: newDirection }))
    onSort(field, newDirection)
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleSort('date')}
            className={`flex items-center px-4 py-2 rounded-lg bg-[#1A1F25] text-sm ${
              sortStates.date === 'desc' ? 'text-white' : 'text-gray-400'
            }`}
          >
            <span className="mr-2">DATE</span>
            <ArrowUpDown className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleSort('rating')}
            className={`flex items-center px-4 py-2 rounded-lg bg-[#1A1F25] text-sm ${
              sortStates.rating === 'desc' ? 'text-white' : 'text-gray-400'
            }`}
          >
            <span className="mr-2">RATING</span>
            <ArrowUpDown className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleSort('chatRating')}  // Changed from 'chat' to 'chatRating'
            className={`flex items-center px-4 py-2 rounded-lg bg-[#1A1F25] text-sm ${
              sortStates.chatRating === 'desc' ? 'text-white' : 'text-gray-400'  // Changed from chat to chatRating
            }`}
          >
            <span className="mr-2">CHAT</span>
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <select
              onChange={(e) => onFilter('status', e.target.value)}
              className="appearance-none px-4 py-2 pr-8 rounded-lg bg-[#1A1F25] text-gray-400 text-sm focus:outline-none"
            >
              <option value="">All status</option>
              <option value="Dropped">Dropped</option>
              <option value="Watching">Watching</option>
              <option value="Planned">Planned</option>
              <option value="Viewed">Viewed</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              onChange={(e) => onFilter('type', e.target.value)}
              className="appearance-none px-4 py-2 pr-8 rounded-lg bg-[#1A1F25] text-gray-400 text-sm focus:outline-none"
            >
              <option value="">All type</option>
              <option value="Movie">Movie</option>
              <option value="Series">Series</option>
              <option value="Documentary">Documentary</option>
              <option value="Anime">Anime</option>
              <option value="Cartoon">Cartoon</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              onChange={(e) => onFilter('link', e.target.value)}
              className="appearance-none px-4 py-2 pr-8 rounded-lg bg-[#1A1F25] text-gray-400 text-sm focus:outline-none"
            >
              <option value="">All link</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  )
}
