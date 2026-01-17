import type { StateCreator } from "zustand";
import { apiService } from "../../services/api";
import type {
	AuthRequest,
	AuthState,
	CreateUserRequest,
	User,
} from "../../types";

const initialState: AuthState = {
	user: null,
	token: null,
	isAuthenticated: false,
	isLoading: false,
	error: null,
};

export interface AuthSlice {
	auth: AuthState;
	login: (credentials: AuthRequest) => Promise<void>;
	register: (userData: CreateUserRequest) => Promise<void>;
	logout: () => Promise<void>;
	checkAuth: () => Promise<void>;
	clearError: () => void;
	setUser: (user: User | null) => void;
}

export const createAuthSlice: StateCreator<AuthSlice, [], [], AuthSlice> = (
	set,
) => ({
	auth: initialState,
	login: async (credentials: AuthRequest) => {
		set((state) => ({
			auth: { ...state.auth, isLoading: true, error: null },
		}));
		try {
			const response = await apiService.authenticate(credentials);
			const user = apiService.decodeToken(response.result.token);
			if (!user) {
				throw new Error("Erro ao decodificar token");
			}
			set((state) => ({
				auth: {
					...state.auth,
					isLoading: false,
					user,
					token: response.result.token,
					isAuthenticated: true,
				},
			}));
		} catch (error) {
			set((state) => ({
				auth: {
					...state.auth,
					isLoading: false,
					error: (error as Error).message,
				},
			}));
			throw error;
		}
	},
	register: async (userData: CreateUserRequest) => {
		set((state) => ({
			auth: { ...state.auth, isLoading: true, error: null },
		}));
		try {
			await apiService.createUser(userData);
			set((state) => ({
				auth: { ...state.auth, isLoading: false },
			}));
		} catch (error) {
			set((state) => ({
				auth: {
					...state.auth,
					isLoading: false,
					error: (error as Error).message,
				},
			}));
			throw error;
		}
	},
	logout: async () => {
		apiService.logout();
		set((state) => ({
			auth: {
				...state.auth,
				user: null,
				token: null,
				isAuthenticated: false,
			},
		}));
	},
	checkAuth: async () => {
		if (!apiService.isTokenValid()) {
			apiService.logout();
			set((state) => ({
				auth: {
					...state.auth,
					user: null,
					token: null,
					isAuthenticated: false,
				},
			}));
			return;
		}
		const token = apiService.getToken();
		if (!token) {
			set((state) => ({
				auth: {
					...state.auth,
					user: null,
					token: null,
					isAuthenticated: false,
				},
			}));
			return;
		}
		const user = apiService.decodeToken(token);
		if (user) {
			set((state) => ({
				auth: {
					...state.auth,
					user,
					token,
					isAuthenticated: true,
				},
			}));
		} else {
			set((state) => ({
				auth: {
					...state.auth,
					user: null,
					token: null,
					isAuthenticated: false,
				},
			}));
		}
	},
	clearError: () => {
		set((state) => ({
			auth: { ...state.auth, error: null },
		}));
	},
	setUser: (user: User | null) => {
		set((state) => ({
			auth: { ...state.auth, user },
		}));
	},
});
