import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/db'
import Comment, { IComment } from '@/models/Comment'
import mongoose from 'mongoose'

interface PopulatedComment extends Omit<IComment, 'user'> {
  user: {
    _id: mongoose.Types.ObjectId;
    username: string;
  };
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized'
        },
        { status: 401 }
      )
    }

    await dbConnect()

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(params.id) || 
        !mongoose.Types.ObjectId.isValid(params.commentId)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid ID format'
        },
        { status: 400 }
      )
    }

    // Find the comment
    const comment = await Comment.findById(params.commentId)
      .populate<{ user: { _id: mongoose.Types.ObjectId; username: string } }>('user', '_id username')
      .lean() as PopulatedComment | null

    if (!comment) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Comment not found'
        },
        { status: 404 }
      )
    }

    // Check if user is authorized to delete the comment
    const isAdmin = session.user.role === 'admin'
    const isCommentAuthor = comment.user._id.toString() === session.user.id

    if (!isAdmin && !isCommentAuthor) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Not authorized to delete this comment'
        },
        { status: 403 }
      )
    }

    // Delete the comment
    await Comment.findByIdAndDelete(params.commentId)

    return NextResponse.json({
      success: true,
      message: 'Comment deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete comment'
      },
      { status: 500 }
    )
  }
}
