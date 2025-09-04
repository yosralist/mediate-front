import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, email, password, institute_name } = body;

        if (!username || !email || !password || !institute_name) {
            return NextResponse.json(
                { detail: 'Missing required fields: username, email, password, institute_name' },
                { status: 400 }
            );
        }

        const db = await getDatabase();
        const usersCollection = db.collection('users');
        const institutesCollection = db.collection('institutes');

        // Check if user already exists
        const existingUser = await usersCollection.findOne({
            $or: [{ username }, { email }]
        });

        if (existingUser) {
            return NextResponse.json(
                { detail: 'User with this username or email already exists' },
                { status: 409 }
            );
        }

        // Create or get institute
        let institute = await institutesCollection.findOne({ name: institute_name });
        if (!institute) {
            const instituteResult = await institutesCollection.insertOne({
                name: institute_name,
                created_at: new Date(),
            });
            institute = { _id: instituteResult.insertedId, name: institute_name };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const userResult = await usersCollection.insertOne({
            username,
            email,
            password: hashedPassword,
            institute_id: institute._id,
            created_at: new Date(),
            updated_at: new Date(),
        });

        // Return success (don't include password)
        return NextResponse.json({
            message: 'User created successfully',
            user: {
                id: userResult.insertedId,
                username,
                email,
                institute_id: institute._id,
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { detail: 'Internal server error' },
            { status: 500 }
        );
    }
}
