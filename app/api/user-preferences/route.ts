import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { UserPreferences, UserPreferencesService } from '@/lib/models/User';

// GET /api/user-preferences?userId=123
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const db = await getDatabase();
        const collection = db.collection<UserPreferences>('user_preferences');

        const preferences = await collection.findOne({ userId: parseInt(userId) });

        if (!preferences) {
            return NextResponse.json(
                { error: 'User preferences not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: preferences });
    } catch (error) {
        console.error('Error fetching user preferences:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/user-preferences
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, username, email, institute_id } = body;

        if (!userId || !username || !email || !institute_id) {
            return NextResponse.json(
                { error: 'Missing required fields: userId, username, email, institute_id' },
                { status: 400 }
            );
        }

        const db = await getDatabase();
        const collection = db.collection<UserPreferences>('user_preferences');

        // Check if preferences already exist
        const existing = await collection.findOne({ userId: parseInt(userId) });
        if (existing) {
            return NextResponse.json(
                { error: 'User preferences already exist' },
                { status: 409 }
            );
        }

        const preferences = await UserPreferencesService.createUserPreferences(
            parseInt(userId),
            username,
            email,
            parseInt(institute_id)
        );

        const result = await collection.insertOne(preferences);

        return NextResponse.json({
            data: { ...preferences, _id: result.insertedId }
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating user preferences:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT /api/user-preferences
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, preferences: preferencesUpdate } = body;

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const db = await getDatabase();
        const collection = db.collection<UserPreferences>('user_preferences');

        const existing = await collection.findOne({ userId: parseInt(userId) });
        if (!existing) {
            return NextResponse.json(
                { error: 'User preferences not found' },
                { status: 404 }
            );
        }

        const updated = await UserPreferencesService.updatePreferences(
            existing,
            preferencesUpdate
        );

        const result = await collection.replaceOne(
            { userId: parseInt(userId) },
            updated
        );

        if (result.matchedCount === 0) {
            return NextResponse.json(
                { error: 'User preferences not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: updated });
    } catch (error) {
        console.error('Error updating user preferences:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/user-preferences?userId=123
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const db = await getDatabase();
        const collection = db.collection<UserPreferences>('user_preferences');

        const result = await collection.deleteOne({ userId: parseInt(userId) });

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { error: 'User preferences not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'User preferences deleted successfully' });
    } catch (error) {
        console.error('Error deleting user preferences:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
