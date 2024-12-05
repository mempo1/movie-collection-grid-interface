'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Calendar, Star, MessageSquare } from 'lucide-react'
import { IMovie } from '@/models/Movie'

interface MovieCardProps {
  movie: IMovie
}

export default function MovieCard({ movie }: MovieCardProps) {
  const router = useRouter()

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'No date'
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    })
  }

  const handleClick = () => {
    router.push(`/movies/${movie._id}`)
  }

  return (
    <div 
      className="relative group cursor-pointer transform transition-transform duration-200 hover:scale-105"
      onClick={handleClick}
    >
      <div className="aspect-[3/4] relative overflow-hidden rounded-lg">
        <Image
          src={movie.posterUrl}
          alt={movie.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-lg font-semibold text-white mb-2">{movie.title}</h3>
          
          <div className="flex items-center justify-between text-sm">
            {movie.releaseDate && (
              <div className="flex items-center text-gray-300">
                <Calendar className="w-4 h-4 mr-1" />
                <span>{formatDate(movie.releaseDate)}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-3">
              {movie.chatRating !== undefined && (
                <div className="flex items-center text-blue-400">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  <span>{movie.chatRating.toFixed(1)}</span>
                </div>
              )}
              {movie.rating !== undefined && (
                <div className="flex items-center text-yellow-400">
                  <Star className="w-4 h-4 mr-1 fill-current" />
                  <span>{movie.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-2 right-2 px-2 py-1 bg-[#1A1F25]/90 rounded text-xs font-medium">
        {movie.type}
      </div>

      <div className="absolute top-2 left-2 px-2 py-1 bg-blue-500/90 rounded text-xs font-medium">
        {movie.status}
      </div>
    </div>
  )
}