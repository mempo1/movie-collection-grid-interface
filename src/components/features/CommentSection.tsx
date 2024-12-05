'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { MessageSquare, Send, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface Comment {
  _id: string
  content: string
  user: {
    _id: string
    username: string
  }
  createdAt: string
}

interface CommentSectionProps {
  movieId: string
  isAuthenticated: boolean
}

export default function CommentSection({ movieId, isAuthenticated }: CommentSectionProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [movieId])

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/movies/${movieId}/comments`)
      const data = await response.json()
      if (data.success) {
        setComments(data.comments)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || submitting) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/movies/${movieId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      })

      const data = await response.json()
      if (data.success) {
        setNewComment('')
        fetchComments()
      }
    } catch (error) {
      console.error('Error posting comment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return
    }

    try {
      const response = await fetch(`/api/movies/${movieId}/comments/${commentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchComments()
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  const canDeleteComment = (comment: Comment) => {
    if (!session) return false
    return session.user.role === 'admin' || session.user.id === comment.user._id
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return <div className="text-center py-8">Loading comments...</div>
  }

  return (
    <div className="bg-[#1A1F25] rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <MessageSquare className="w-6 h-6 mr-2" />
        Comments ({comments.length})
      </h2>

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-4 py-2 bg-[#0F1318] rounded border border-gray-700 text-white focus:outline-none focus:border-blue-500"
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Send className="w-4 h-4 mr-2" />
              Post
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-[#0F1318] rounded text-center">
          <p className="text-gray-400 mb-2">Please sign in to leave a comment</p>
          <Link
            href="/auth/signin"
            className="text-blue-500 hover:text-blue-400 transition-colors"
          >
            Sign In
          </Link>
        </div>
      )}

      <div className="space-y-6">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment._id} className="bg-[#0F1318] rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center justify-between w-full">
                  <div>
                    <span className="font-semibold text-blue-400">
                      {comment.user.username}
                    </span>
                    <span className="text-sm text-gray-400 ml-2">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  {canDeleteComment(comment) && (
                    <button
                      onClick={() => handleDelete(comment._id)}
                      className="text-red-400 hover:text-red-500 transition-colors"
                      title="Delete comment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-gray-300">{comment.content}</p>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 py-4">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>
    </div>
  )
}
