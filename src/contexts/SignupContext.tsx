"use client";

import React, { createContext, useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import { validateUserInput } from '@/utils/validation';

interface SignupContextType {
	formData: {
		email: string;
		password: string;
		name: string;
		username: string;
		phone: string;
		role: string;
	};
	error: string;
	handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	handleSignup: (e: React.FormEvent) => Promise<void>;
}

const SignupContext = createContext<SignupContextType | undefined>(undefined);

export function SignupProvider({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const [formData, setFormData] = useState({
		email: '',
		password: '',
		name: '',
		username: '',
		phone: '',
		role: 'general_user'  // Default role from validation
	});
	const [error, setError] = useState<string>('');

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
		}));
	};

	const handleSignup = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		try {
			// Validate input before making the API call
			const validation = validateUserInput(formData);
			if (!validation.isValid) {
				setError(validation.error || 'Invalid input');
				return;
			}

			const response = await fetch('/api/auth/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formData),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to register');
			}

			// Clear form data on success
			setFormData({
				email: '',
				password: '',
				name: '',
				username: '',
				phone: '',
				role: 'general_user'
			});

			router.push('/login');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Signup failed. Please try again.');
		}
	};

	const value = {
		formData,
		error,
		handleChange,
		handleSignup,
	};

	return (
		<SignupContext.Provider value={value}>
			{children}
		</SignupContext.Provider>
	);
}

export function useSignup() {
	const context = useContext(SignupContext);
	if (context === undefined) {
		throw new Error('useSignup must be used within a SignupProvider');
	}
	return context;
}