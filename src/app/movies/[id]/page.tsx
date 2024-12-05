'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { Calendar, Star, Clock, Film, Link as LinkIcon, MessageSquare } from 'lucide-react'
import { IMovie } from '@/models/Movie'
import CommentSection from '@/components/features/CommentSection'
import Link from 'next/link'
import { use } from 'react'

export default function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  const movieParams = use(params)
  const { data: session } = useSession()
  const [movie, setMovie] = useState<IMovie | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await fetch(`/api/movies/${movieParams.id}`)
        const data = await response.json()
        if (data.success) {
          setMovie(data.movie)
        }
      } catch (error) {
        console.error('Error fetching movie:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMovie()
  }, [movieParams.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-400">Movie not found</div>
      </div>
    )
  }

  const formatDate = (date: Date | undefined) => {
    if (!date) return null
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Hero Section */}
      <div className="relative h-[60vh] w-full">
        <Image
          src={movie.posterUrl}
          alt={movie.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1318] via-[#0F1318]/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-4 -mt-32 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Poster */}
          <div className="md:col-span-1">
            <div className="aspect-[3/4] relative rounded-lg overflow-hidden shadow-xl">
              <Image
                src={movie.posterUrl}
                alt={movie.title}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-2 text-white">
            <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
            
            <div className="flex flex-wrap gap-4 mb-6">
              {movie.releaseDate && (
                <div className="flex items-center text-gray-300">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>{formatDate(movie.releaseDate)}</span>
                </div>
              )}
              <div className="flex items-center space-x-4">
                {movie.chatRating !== undefined && (
                  <div className="flex items-center text-blue-400">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    <span>{movie.chatRating.toFixed(1)}</span>
                  </div>
                )}
                {movie.rating !== undefined && (
                  <div className="flex items-center text-yellow-400">
                    <Star className="w-5 h-5 mr-2 fill-current" />
                    <span>{movie.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center text-gray-300">
                <Film className="w-5 h-5 mr-2" />
                <span>{movie.type}</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Clock className="w-5 h-5 mr-2" />
                <span>{movie.status}</span>
              </div>
            </div>

            {movie.genre && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Genre</h2>
                <p className="text-gray-300">{movie.genre}</p>
              </div>
            )}

            {movie.description && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="text-gray-300 leading-relaxed">{movie.description}</p>
              </div>
            )}

            {movie.link && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Watch Now</h2>
                <Link 
                  href={movie.link}
                  target="_blank"
                  className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Watch Movie
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-12">
          <CommentSection 
            movieId={movieParams.id}
            isAuthenticated={!!session}
          />
        </div>
      </div>
    </div>
  )
}