import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Name, email, and password are required fields." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 400 }
      );
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        role: "BUYER",
        points: 0,
      },
    });

    // Create token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json(
      {
        message: "User registered successfully",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          points: user.points,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Registration error:", error);
    return NextResponse.json(
      { error: "Failed to register user. Please try again." },
      { status: 500 }
    );
  }
}
