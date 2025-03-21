import { NextResponse } from 'next/server';
import { validateUserInput } from '@/utils/validation';
import { hash } from 'bcrypt';

export async function POST(request: Request) {
	try {
		const userData = await request.json();
		
		// Server-side validation
		const validation = validateUserInput(userData);
		if (!validation.isValid) {
			return NextResponse.json(
				{ error: validation.error },
				{ status: 400 }
			);
		}

		const { email, password, name, username, phone, role } = userData;

		// Hash the password
		const hashedPassword = await hash(password, 10);

		// Store user in your database (this is a mock implementation)
		const user = {
			id: Math.random().toString(36).substr(2, 9), // In production, use proper UUID
			email,
			password: hashedPassword,
			name,
			username,
			phone,
			role,
			createdAt: new Date().toISOString()
		};

		// TODO: Store user in your database
		// For now, we'll just return success
		return NextResponse.json(
			{ message: 'Registration successful', user: { ...user, password: undefined } },
			{ status: 201 }
		);

	} catch (error) {
		console.error('Registration error:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}