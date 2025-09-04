import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json(
                { detail: 'Missing required fields: username, password' },
                { status: 400 }
            );
        }

        const db = await getDatabase();
        const usersCollection = db.collection('users');

        // Find user by username or email
        const user = await usersCollection.findOne({
            $or: [{ username }, { email: username }]
        });

        if (!user) {
            return NextResponse.json(
                { detail: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return NextResponse.json(
                { detail: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Generate JWT token
        const secret = process.env.NEXTAUTH_SECRET || 'fallback-secret-key';
        const token = jwt.sign(
            {
                userId: user._id,
                username: user.username,
                email: user.email,
                institute_id: user.institute_id
            },
            secret,
            { expiresIn: '24h' }
        );

        // Update last login
        await usersCollection.updateOne(
            { _id: user._id },
            {
                $set: {
                    last_login: new Date(),
                    updated_at: new Date()
                }
            }
        );

        return NextResponse.json({
            access_token: token,
            token_type: 'Bearer',
            user_id: user._id,
            institute_id: user.institute_id
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { detail: 'Internal server error' },
            { status: 500 }
        );
    }
}
