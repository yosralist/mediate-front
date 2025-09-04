import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { detail: 'Authorization header required' },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        const secret = process.env.NEXTAUTH_SECRET || 'fallback-secret-key';

        // Verify JWT token
        let decoded: any;
        try {
            decoded = jwt.verify(token, secret);
        } catch (error) {
            return NextResponse.json(
                { detail: 'Invalid or expired token' },
                { status: 401 }
            );
        }

        const db = await getDatabase();
        const usersCollection = db.collection('users');

        // Find user by ID from token
        const user = await usersCollection.findOne({
            _id: new ObjectId(decoded.userId)
        });

        if (!user) {
            return NextResponse.json(
                { detail: 'User not found' },
                { status: 404 }
            );
        }

        // Return user info (without password)
        return NextResponse.json({
            id: user._id,
            username: user.username,
            email: user.email,
            institute_id: user.institute_id
        });

    } catch (error) {
        console.error('Get current user error:', error);
        return NextResponse.json(
            { detail: 'Internal server error' },
            { status: 500 }
        );
    }
}
