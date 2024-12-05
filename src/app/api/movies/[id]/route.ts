import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/db'
import Movie from '@/models/Movie'
import mongoose from 'mongoose'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`Fetching movie with ID: ${params.id}`)
    await dbConnect()

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      console.log('Invalid ObjectId format:', params.id)
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid ID format'
        },
        { status: 400 }
      )
    }
    
    const movie = await Movie.findById(params.id).lean()
    
    if (!movie) {
      console.log('Movie not found:', params.id)
      return NextResponse.json(
        { 
          success: false,
          error: 'Movie not found'
        },
        { status: 404 }
      )
    }
    
    if (Array.isArray(movie)) {
      console.log('Movie array found:', movie.map(m => m._id))
    } else {
      console.log('Movie found:', movie._id)
    }
    
    return NextResponse.json({ success: true, movie })
  } catch (error) {
    console.error(`Error in GET /api/movies/${params.id}:`, error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    console.log(`Updating movie with ID: ${params.id}`)
    await dbConnect()

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      console.log('Invalid ObjectId format:', params.id)
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid ID format'
        },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    console.log('Update data:', body)
    
    const movie = await Movie.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true }
    ).lean()
    
    if (!movie) {
      console.log('Movie not found for update:', params.id)
      return NextResponse.json(
        { 
          success: false,
          error: 'Movie not found'
        },
        { status: 404 }
)
}

console.log(
'Movie updated successfully:', 
Array.isArray(movie) ? movie[0]._id : movie._id
)
return NextResponse.json({ success: true, movie })
} catch (error) {
console.error(`Error in PUT /api/movies/${params.id}:`, error)
    // Validation error handling
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation Error',
          message: error.message,
          details: error
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    console.log(`Deleting movie with ID: ${params.id}`)
    await dbConnect()

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      console.log('Invalid ObjectId format:', params.id)
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid ID format'
        },
        { status: 400 }
      )
    }
    
    const movie = await Movie.findByIdAndDelete(params.id)
    
    if (!movie) {
      console.log('Movie not found for deletion:', params.id)
      return NextResponse.json(
        { 
          success: false,
          error: 'Movie not found'
        },
        { status: 404 }
      )
    }
    
    console.log('Movie deleted successfully:', params.id)
    return NextResponse.json({
      success: true,
      message: 'Movie deleted successfully'
    })
  } catch (error) {
    console.error(`Error in DELETE /api/movies/${params.id}:`, error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}