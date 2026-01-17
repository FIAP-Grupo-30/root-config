import { ENV } from "../config/env";
import type {
	AuthRequest,
	AuthResponse,
	CreateTransactionRequest,
	CreateUserRequest,
	Transaction,
	User,
} from "../types";

const API_BASE_URL = ENV.API_BASE_URL;
const TOKEN_KEY = "bytebank_token";

class ApiService {
	getToken(): string | null {
		return localStorage.getItem(TOKEN_KEY);
	}

	setToken(token: string): void {
		localStorage.setItem(TOKEN_KEY, token);
	}

	clearToken(): void {
		localStorage.removeItem(TOKEN_KEY);
	}

	private async request<T>(
		endpoint: string,
		options: RequestInit = {},
	): Promise<T> {
		const token = this.getToken();
		const headers: HeadersInit = {
			"Content-Type": "application/json",
			...options.headers,
		};

		if (token) {
			(headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
		}

		const response = await fetch(`${API_BASE_URL}${endpoint}`, {
			...options,
			headers,
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.message || "Erro na requisição");
		}

		return response.json();
	}

	async createUser(data: CreateUserRequest) {
		return this.request<{ message: string; result: User }>("/user", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async authenticate(data: AuthRequest): Promise<AuthResponse> {
		const response = await this.request<AuthResponse>("/user/auth", {
			method: "POST",
			body: JSON.stringify(data),
		});
		if (response.result.token) {
			this.setToken(response.result.token);
		}
		return response;
	}

	logout(): void {
		this.clearToken();
	}

	decodeToken(token: string): User | null {
		try {
			const payload = JSON.parse(atob(token.split(".")[1]));
			return {
				id: payload.id,
				username: payload.username,
				email: payload.email,
			};
		} catch {
			return null;
		}
	}

	isTokenValid(): boolean {
		const token = this.getToken();
		if (!token) return false;
		try {
			const payload = JSON.parse(atob(token.split(".")[1]));
			return Date.now() < payload.exp * 1000;
		} catch {
			return false;
		}
	}

	async getAccount() {
		return this.request<{
			message: string;
			result: { account: any[]; transactions: Transaction[]; cards: any[] };
		}>("/account");
	}

	async createTransaction(
		data: CreateTransactionRequest,
	): Promise<Transaction> {
		return this.request("/account/transaction", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async getStatement(accountId: string) {
		return this.request<{
			message: string;
			result: { transactions: Transaction[] };
		}>(`/account/${accountId}/statement`);
	}
}

export const apiService = new ApiService();
