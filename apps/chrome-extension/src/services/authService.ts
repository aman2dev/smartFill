const API_BASE_URL = 'http://localhost:4000/api/v1';

export interface UserSession {
  token: string;
  user: {
    id?: string;
    email: string;
    name: string;
    credits: number;
  };
}

const STORAGE_KEY_SESSION = 'smartfill_auth_session';

export const getStoredSession = (): UserSession | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSION);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};

export const saveSession = (session: UserSession): void => {
  try {
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
  } catch (e) {
    console.error('Error saving session:', e);
  }
};

export const clearSession = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY_SESSION);
  } catch (e) {
    console.error('Error clearing session:', e);
  }
};

export async function apiSignup(name: string, email: string, password: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Signup failed');
    }

    return { success: true, message: data.message || 'Account created successfully!' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to connect to authentication server' };
  }
}

export async function apiSignin(email: string, password: string): Promise<{ success: boolean; message: string; session?: UserSession }> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Invalid credentials');
    }

    const session: UserSession = {
      token: data.token,
      user: {
        email: email,
        name: email.split('@')[0],
        credits: data.user?.credits ?? 50,
      },
    };

    saveSession(session);
    return { success: true, message: data.message || 'Signed in successfully!', session };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to connect to authentication server' };
  }
}
