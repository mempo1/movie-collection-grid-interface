'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Plus, Star, MessageSquare, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { IMovie } from '@/models/Movie'

interface PaginationData {
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [movies, setMovies] = useState<IMovie[]>([])
  const [loading, setLoading] = useState(true)
  const [editingMovie, setEditingMovie] = useState<IMovie | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState('createdAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    totalPages: 1,
    hasMore: false
  })
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    releaseDate: '',
    genre: '',
    rating: '',
    chatRating: '',
    posterUrl: '',
    status: 'Watching',
    type: 'Movie',
    link: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated' && session.user.role !== 'admin') {
      router.push('/')
    } else if (status === 'authenticated') {
      fetchMovies()
    }
  }, [status, session, router, currentPage, searchQuery, sortField, sortDirection])

  const fetchMovies = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        ...(searchQuery && { search: searchQuery }),
        sortField,
        sortDirection
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
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchMovies()
  }

  const handleSort = (field: string) => {
    const newDirection = field === sortField && sortDirection === 'desc' ? 'asc' : 'desc'
    setSortField(field)
    setSortDirection(newDirection)
    setCurrentPage(1)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage)
      window.scrollTo(0, 0)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingMovie 
        ? `/api/movies/${editingMovie._id.toString()}` 
        : '/api/movies'
      
      const method = editingMovie ? 'PUT' : 'POST'

      const movieData = {
        title: formData.title,
        posterUrl: formData.posterUrl,
        status: formData.status,
        type: formData.type,
        ...(formData.description && { description: formData.description }),
        ...(formData.releaseDate && { releaseDate: new Date(formData.releaseDate) }),
        ...(formData.genre && { genre: formData.genre }),
        ...(formData.rating && { rating: parseFloat(formData.rating) }),
        ...(formData.chatRating && { chatRating: parseFloat(formData.chatRating) }),
        ...(formData.link && { link: formData.link })
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(movieData),
      })

      if (response.ok) {
        resetForm()
        fetchMovies()
      } else {
        const data = await response.json()
        throw new Error(data.message || 'Failed to save movie')
      }
    } catch (error) {
      console.error('Error saving movie:', error)
      alert(error instanceof Error ? error.message : 'Failed to save movie')
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this movie?')) {
      return
    }

    try {
      const response = await fetch(`/api/movies/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchMovies()
      } else {
        const data = await response.json()
        throw new Error(data.message || 'Failed to delete movie')
      }
    } catch (error) {
      console.error('Error deleting movie:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete movie')
    }
  }

  const handleEdit = (movie: IMovie) => {
    setEditingMovie(movie)
    setFormData({
      title: movie.title,
      description: movie.description || '',
      releaseDate: movie.releaseDate ? new Date(movie.releaseDate).toISOString().split('T')[0] : '',
      genre: movie.genre || '',
      rating: movie.rating?.toString() || '',
      chatRating: movie.chatRating?.toString() || '',
      posterUrl: movie.posterUrl,
      status: movie.status,
      type: movie.type,
      link: movie.link || ''
    })
  }

  const resetForm = () => {
    setEditingMovie(null)
    setFormData({
      title: '',
      description: '',
      releaseDate: '',
      genre: '',
      rating: '',
      chatRating: '',
      posterUrl: '',
      status: 'Watching',
      type: 'Movie',
      link: ''
    })
  }

  if (status === 'loading' || loading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  if (status === 'unauthenticated' || (session && session.user.role !== 'admin')) {
    return null
  }

  return (
    <div className="max-w-[1200px] mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8">Movie Management</h1>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-xl">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movies..."
            className="w-full pl-10 pr-4 py-2 bg-[#1A1F25] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Search
          </button>
        </div>
      </form>

      <form onSubmit={handleSubmit} className="mb-12 bg-[#1A1F25] p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-6">
          {editingMovie ? 'Edit Movie' : 'Add New Movie'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-[#0F1318] rounded border border-gray-700 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Release Date</label>
            <input
              type="date"
              value={formData.releaseDate}
              onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
              className="w-full px-3 py-2 bg-[#0F1318] rounded border border-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Genre</label>
            <input
              type="text"
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              className="w-full px-3 py-2 bg-[#0F1318] rounded border border-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center">
              <Star className="w-4 h-4 mr-1 text-yellow-400" />
              Your Rating (0-10)
            </label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
              className="w-full px-3 py-2 bg-[#0F1318] rounded border border-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center">
              <MessageSquare className="w-4 h-4 mr-1 text-blue-400" />
              Chat Rating (0-10)
            </label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={formData.chatRating}
              onChange={(e) => setFormData({ ...formData, chatRating: e.target.value })}
              className="w-full px-3 py-2 bg-[#0F1318] rounded border border-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Poster URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={formData.posterUrl}
              onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
              className="w-full px-3 py-2 bg-[#0F1318] rounded border border-gray-700 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 bg-[#0F1318] rounded border border-gray-700 text-white"
              required
            >
              <option value="Dropped">Dropped</option>
              <option value="Watching">Watching</option>
              <option value="Planned">Planned</option>
              <option value="Viewed">Viewed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 bg-[#0F1318] rounded border border-gray-700 text-white"
              required
            >
              <option value="Movie">Movie</option>
              <option value="Series">Series</option>
              <option value="Documentary">Documentary</option>
              <option value="Anime">Anime</option>
              <option value="Cartoon">Cartoon</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Link</label>
            <input
              type="url"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              className="w-full px-3 py-2 bg-[#0F1318] rounded border border-gray-700 text-white"
              placeholder="Optional"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-[#0F1318] rounded border border-gray-700 text-white h-32"
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end space-x-4">
          {editingMovie && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            {editingMovie ? 'Update Movie' : 'Add Movie'}
          </button>
        </div>
      </form>

      <div className="bg-[#1A1F25] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#0F1318]">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  <span>Chat</span>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span>Rating</span>
                </div>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {movies.map((movie) => (
              <tr key={movie._id.toString()} className="hover:bg-[#0F1318]">
                <td className="px-6 py-4 whitespace-nowrap">{movie.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">{movie.type}</td>
                <td className="px-6 py-4 whitespace-nowrap">{movie.status}</td>
                <td className="px-6 py-4 whitespace-nowrap">{movie.chatRating?.toFixed(1) || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{movie.rating?.toFixed(1) || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => handleEdit(movie)}
                    className="text-blue-400 hover:text-blue-500 mr-4"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(movie._id.toString())}
                    className="text-red-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
  )
}
