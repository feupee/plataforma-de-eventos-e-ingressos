import { getToken } from "@/lib/auth";

export type UserRole = "CLIENT" | "ORGANIZER" | "GATE";

export type AuthUser = {
  id: number;

  name: string;
  email: string;

  role: UserRole;
};

export type AuthResponse = {
  access_token: string;

  token_type: string;

  user: AuthUser;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export async function loginUser(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(error?.detail ?? "E-mail ou senha inválidos.");
  }

  return response.json();
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(error?.detail ?? "Não foi possível criar a conta.");
  }

  return response.json();
}

export async function getMe(): Promise<AuthUser> {
  const token = getToken();

  if (!token) {
    throw new Error("Usuário não autenticado.");
  }

  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Sessão inválida.");
  }

  return response.json();
}
