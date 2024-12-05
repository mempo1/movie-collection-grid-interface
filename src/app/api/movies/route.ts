import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/db'
import Movie from '@/models/Movie'

export async function GET(request: Request) {
  try {
    console.log('Attempting database connection...')
    await dbConnect()
    console.log('Database connected successfully')
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 24 // Fixed limit of 24 items per page
    const sort = searchParams.get('sort') || '-createdAt'
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const link = searchParams.get('link')
    const sortField = searchParams.get('sortField') || 'createdAt'
    const sortDirection = searchParams.get('sortDirection') || 'desc'
    
    const skip = (page - 1) * limit

    // Build query
    let query: any = {}
    
    // Add search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    // Add status filter
    if (status) {
      query.status = status
    }

    // Add type filter
    if (type) {
      query.type = type
    }

    // Add link filter
    if (link) {
      if (link === 'available') {
        query.link = { $exists: true, $ne: '' }
      } else if (link === 'unavailable') {
        query.$or = [
          { link: { $exists: false } },
          { link: '' }
        ]
      }
    }

    console.log('Query:', query)
    
    // Build sort object
    let sortObject: any = {}
    switch (sortField) {
      case 'date':
        sortObject.releaseDate = sortDirection === 'asc' ? 1 : -1
        // Secondary sort by createdAt for items without releaseDate
        sortObject.createdAt = sortDirection === 'asc' ? 1 : -1
        break
      case 'rating':
        // Sort nulls last regardless of direction
        sortObject = {
          $sort: {
            rating: {
              $cond: {
                if: { $eq: ['$rating', null] },
                then: sortDirection === 'asc' ? Number.MAX_VALUE : Number.MIN_VALUE,
                else: '$rating'
              }
            }
          }
        }
        break
      case 'chat':
        // Sort nulls last regardless of direction
        sortObject = {
          $sort: {
            chatRating: {
              $cond: {
                if: { $eq: ['$chatRating', null] },
                then: sortDirection === 'asc' ? Number.MAX_VALUE : Number.MIN_VALUE,
                else: '$chatRating'
              }
            }
          }
        }
        break
      default:
        sortObject[sortField] = sortDirection === 'asc' ? 1 : -1
    }

    // Get total count with filters
    const total = await Movie.countDocuments(query)

    // Build aggregation pipeline for proper sorting with nulls
    const pipeline = [
      { $match: query },
      ...(sortField === 'rating' || sortField === 'chat' ? [
        {
          $addFields: {
            sortValue: {
              $cond: {
                if: { $eq: [`$${sortField}`, null] },
                then: sortDirection === 'asc' ? Number.MAX_VALUE : Number.MIN_VALUE,
                else: `$${sortField}`
              }
            }
          }
        },
        { $sort: { sortValue: sortDirection === 'asc' ? 1 : -1 } }
      ] : [
        { $sort: sortObject }
      ]),
      { $skip: skip },
      { $limit: limit }
    ]

    // Execute aggregation pipeline
    const movies = await Movie.aggregate(pipeline)
    
    console.log(`Found ${movies.length} movies out of ${total} total`)
    
    return NextResponse.json({
      success: true,
      movies,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + movies.length < total
      }
    })
  } catch (error) {
    console.error('Error in GET /api/movies:', error)
    
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      if ('code' in error) {
        console.error('Error code:', (error as any).code)
      }
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

export async function POST(request: Request) {
  try {
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

    await dbConnect()
    
    const body = await request.json()
    console.log('Received movie data:', body)
    
    const movie = await Movie.create(body)
    console.log('Movie created successfully:', movie._id)
    
    return NextResponse.json({
      success: true,
      movie
    }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/movies:', error)
    
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
