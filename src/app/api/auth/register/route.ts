import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import User from '@/models/User'

export async function POST(request: Request) {
  try {
    await dbConnect()

    const body = await request.json()
    const { username, email, password } = body

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() }
      ]
    })

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: existingUser.email === email.toLowerCase()
            ? 'Email already registered'
            : 'Username already taken'
        },
        { status: 400 }
      )
    }

    // Create new user
    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password,
      role: 'user' // Default role
    })

    // Remove password from response
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: userResponse
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)

    // Validation error handling
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: error.message
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Registration failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}
