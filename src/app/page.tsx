'use client'

import { useState, useEffect } from 'react'
import SearchBar from '@/components/layout/SearchBar'
import FilterBar from '@/components/layout/FilterBar'
import MovieCard from '@/components/features/MovieCard'
import { IMovie } from '@/models/Movie'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationData {
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export default function Home() {
  const [movies, setMovies] = useState<IMovie[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState('createdAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [linkFilter, setLinkFilter] = useState('')
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    totalPages: 1,
    hasMore: false
  })

  useEffect(() => {
    fetchMovies()
  }, [currentPage, searchQuery, sortField, sortDirection, statusFilter, typeFilter, linkFilter])

  const fetchMovies = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(sortField && { sortField, sortDirection }),
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { type: typeFilter }),
        ...(linkFilter && { link: linkFilter })
      })
      const response = await fetch(`/api/movies?${queryParams}`)
      const data = await response.json()
      if (data.success) {
        setMovies(data.movies)
        setPagination(data.pagination)
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching movies:', error)
      setMovies([])
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSortField(field)
    setSortDirection(direction)
    setCurrentPage(1)
  }

  const handleFilter = (type: string, value: string) => {
    setCurrentPage(1)
    switch (type) {
      case 'status':
        setStatusFilter(value)
        break
      case 'type':
        setTypeFilter(value)
        break
      case 'link':
        setLinkFilter(value)
        break
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage)
      window.scrollTo(0, 0)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-12">
      <SearchBar 
        totalItems={pagination.total} 
        onSearch={handleSearch} 
      />
      <FilterBar 
        onSort={handleSort} 
        onFilter={handleFilter} 
      />
      
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie._id.toString()} movie={movie} />
          ))}
        </div>

        {movies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No movies found</p>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center space-x-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-[#1A1F25] text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(page => {
                  return (
                    page === 1 ||
                    page === pagination.totalPages ||
                    Math.abs(page - currentPage) <= 1
                  )
                })
                .map((page, index, array) => (
                  <div key={page} className="flex items-center">
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2 text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 rounded-lg ${
                        currentPage === page
                          ? 'bg-blue-500 text-white'
                          : 'bg-[#1A1F25] text-gray-400 hover:text-white'
                      }`}
                    >
                      {page}
                    </button>
                  </div>
                ))}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.hasMore}
              className="p-2 rounded-lg bg-[#1A1F25] text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
