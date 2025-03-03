import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { validateUserInput } from '@/utils/validation';

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

		// Register user with Supabase
		const { data: authData, error: authError } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					name,
					username,
					phone,
					role
				}
			}
		});

		if (authError) {
			return NextResponse.json(
				{ error: authError.message },
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{ message: 'Registration successful', user: authData.user },
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