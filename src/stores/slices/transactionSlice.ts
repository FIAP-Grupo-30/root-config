import type { StateCreator } from "zustand";
import { apiService } from "../../services/api";
import type {
	CreateTransactionRequest,
	Transaction,
	TransactionFilters,
	TransactionState,
} from "../../types";

const initialFilters: TransactionFilters = {
	type: "all",
	category: "all",
	startDate: null,
	endDate: null,
	searchTerm: "",
};

const initialState: TransactionState = {
	transactions: [],
	filteredTransactions: [],
	isLoading: false,
	error: null,
	filters: initialFilters,
	pagination: { page: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
};

const filterTransactions = (
	transactions: Transaction[],
	filters: TransactionFilters,
): Transaction[] => {
	return transactions.filter((t) => {
		if (filters.type !== "all" && t.type !== filters.type) return false;
		if (filters.category !== "all" && t.category !== filters.category)
			return false;
		if (filters.startDate && new Date(t.date) < new Date(filters.startDate))
			return false;
		if (filters.endDate && new Date(t.date) > new Date(filters.endDate))
			return false;
		if (filters.searchTerm) {
			const term = filters.searchTerm.toLowerCase();
			const matchDesc = t.description?.toLowerCase().includes(term);
			const matchFrom = t.from?.toLowerCase().includes(term);
			const matchTo = t.to?.toLowerCase().includes(term);
			if (!matchDesc && !matchFrom && !matchTo) return false;
		}
		return true;
	});
};

export interface TransactionSlice {
	transactions: TransactionState;
	fetchTransactions: (accountId: string) => Promise<void>;
	createTransaction: (data: CreateTransactionRequest) => Promise<void>;
	setFilters: (filters: Partial<TransactionFilters>) => void;
	clearFilters: () => void;
	setPage: (page: number) => void;
	clearError: () => void;
}

export const createTransactionSlice: StateCreator<
	TransactionSlice,
	[],
	[],
	TransactionSlice
> = (set) => ({
	transactions: initialState,
	fetchTransactions: async (accountId: string) => {
		set((state) => ({
			transactions: {
				...state.transactions,
				isLoading: true,
				error: null,
			},
		}));
		try {
			const response = await apiService.getStatement(accountId);
			const fetchedTransactions = response.result.transactions;
			const filtered = filterTransactions(
				fetchedTransactions,
				initialState.filters,
			);
			set((state) => ({
				transactions: {
					...state.transactions,
					isLoading: false,
					transactions: fetchedTransactions,
					filteredTransactions: filtered,
					pagination: {
						...state.transactions.pagination,
						totalItems: filtered.length,
						totalPages: Math.ceil(
							filtered.length / state.transactions.pagination.pageSize,
						),
						page: 1,
					},
				},
			}));
		} catch (error) {
			set((state) => ({
				transactions: {
					...state.transactions,
					isLoading: false,
					error: (error as Error).message,
				},
			}));
			throw error;
		}
	},
	createTransaction: async (data: CreateTransactionRequest) => {
		set((state) => ({
			transactions: {
				...state.transactions,
				isLoading: true,
			},
		}));
		try {
			const response = await apiService.createTransaction(data);
			set((state) => {
				const updatedTransactions = [
					response,
					...state.transactions.transactions,
				];
				const filtered = filterTransactions(
					updatedTransactions,
					state.transactions.filters,
				);
				return {
					transactions: {
						...state.transactions,
						isLoading: false,
						transactions: updatedTransactions,
						filteredTransactions: filtered,
						pagination: {
							...state.transactions.pagination,
							totalItems: filtered.length,
							totalPages: Math.ceil(
								filtered.length / state.transactions.pagination.pageSize,
							),
						},
					},
				};
			});
		} catch (error) {
			set((state) => ({
				transactions: {
					...state.transactions,
					isLoading: false,
					error: (error as Error).message,
				},
			}));
			throw error;
		}
	},
	setFilters: (newFilters: Partial<TransactionFilters>) => {
		set((state) => {
			const updatedFilters = {
				...state.transactions.filters,
				...newFilters,
			};
			const filtered = filterTransactions(
				state.transactions.transactions,
				updatedFilters,
			);
			return {
				transactions: {
					...state.transactions,
					filters: updatedFilters,
					filteredTransactions: filtered,
					pagination: {
						...state.transactions.pagination,
						totalItems: filtered.length,
						totalPages: Math.ceil(
							filtered.length / state.transactions.pagination.pageSize,
						),
						page: 1,
					},
				},
			};
		});
	},
	clearFilters: () => {
		set((state) => {
			const filtered = filterTransactions(
				state.transactions.transactions,
				initialFilters,
			);
			return {
				transactions: {
					...state.transactions,
					filters: initialFilters,
					filteredTransactions: filtered,
					pagination: {
						...state.transactions.pagination,
						totalItems: filtered.length,
						totalPages: Math.ceil(
							filtered.length / state.transactions.pagination.pageSize,
						),
						page: 1,
					},
				},
			};
		});
	},
	setPage: (page: number) => {
		set((state) => ({
			transactions: {
				...state.transactions,
				pagination: {
					...state.transactions.pagination,
					page,
				},
			},
		}));
	},
	clearError: () => {
		set((state) => ({
			transactions: {
				...state.transactions,
				error: null,
			},
		}));
	},
});
