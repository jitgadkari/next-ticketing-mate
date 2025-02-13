// Validation utility functions that can be used across the application

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
export const allowedRoles = ["admin", "general_user", "super_user"];

export interface UserInput {
	email: string;
	name: string;
	username: string;
	phone: string;
	password: string;
	role: string;
}

export function validateUserInput(input: Partial<UserInput>): { isValid: boolean; error?: string } {
	const { email, name, username, phone, password, role } = input;

	if (!email || !emailRegex.test(email)) {
		return { isValid: false, error: "Invalid or missing email" };
	}

	if (!name || name.trim().length < 3) {
		return { isValid: false, error: "Name must be at least 3 characters long" };
	}

	if (!username || username.trim().length < 3) {
		return { isValid: false, error: "Username must be at least 3 characters long" };
	}

	if (!phone || phone.length < 10 || phone.length > 15) {
		return { isValid: false, error: "Invalid phone number" };
	}

	if (!password || !passwordRegex.test(password)) {
		return {
			isValid: false,
			error: "Password must be at least 8 characters long, including an uppercase letter, a lowercase letter, a number, and a special character"
		};
	}

	if (!role || !allowedRoles.includes(role)) {
		return { isValid: false, error: "Invalid role. Allowed roles: admin, general_user, super_user" };
	}

	return { isValid: true };
}