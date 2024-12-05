import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/db'
import Comment from '@/models/Comment'
import mongoose from 'mongoose'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid movie ID format'
        },
        { status: 400 }
      )
    }

    // Fetch comments with user information
    const comments = await Comment.find({ movie: params.id })
      .populate('user', 'username')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({
      success: true,
      comments
    })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch comments'
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
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

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid movie ID format'
        },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { content } = body

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Comment content is required'
        },
        { status: 400 }
      )
    }

    // Create comment
    const comment = await Comment.create({
      content: content.trim(),
      movie: params.id,
      user: session.user.id
    })

    // Fetch the created comment with user information
    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'username')
      .lean()

    return NextResponse.json({
      success: true,
      comment: populatedComment
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create comment'
      },
      { status: 500 }
    )
  }
}
