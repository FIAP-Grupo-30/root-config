import type { StateCreator } from "zustand";
import { apiService } from "../../services/api";
import type { AccountState } from "../../types";

const initialState: AccountState = {
	accounts: [],
	cards: [],
	selectedAccount: null,
	balance: 0,
	isLoading: false,
	error: null,
};

export interface AccountSlice {
	account: AccountState;
	fetchAccount: () => Promise<void>;
	selectAccount: (accountId: string) => void;
	updateBalance: (balance: number) => void;
	clearAccount: () => void;
	clearError: () => void;
}

export const createAccountSlice: StateCreator<
	AccountSlice,
	[],
	[],
	AccountSlice
> = (set) => ({
	account: initialState,
	fetchAccount: async () => {
		set((state) => ({
			account: {
				...state.account,
				isLoading: true,
				error: null,
			},
		}));
		try {
			const response = await apiService.getAccount();
			const balance = response.result.transactions.reduce(
				(acc, t) => acc + t.value,
				0,
			);
			set((state) => {
				const accounts = response.result.account;
				return {
					account: {
						...state.account,
						isLoading: false,
						accounts,
						cards: response.result.cards,
						balance,
						selectedAccount:
							accounts.length > 0 && !state.account.selectedAccount
								? accounts[0]
								: state.account.selectedAccount,
					},
				};
			});
		} catch (error) {
			set((state) => ({
				account: {
					...state.account,
					isLoading: false,
					error: (error as Error).message,
				},
			}));
			throw error;
		}
	},
	selectAccount: (accountId: string) => {
		set((state) => {
			const account = state.account.accounts.find(
				(acc) => acc.id === accountId,
			);
			if (!account) return state;
			return {
				account: {
					...state.account,
					selectedAccount: account,
				},
			};
		});
	},
	updateBalance: (balance: number) => {
		set((state) => ({
			account: {
				...state.account,
				balance,
			},
		}));
	},
	clearAccount: () => {
		set((state) => ({
			account: {
				...state.account,
				accounts: [],
				cards: [],
				selectedAccount: null,
				balance: 0,
			},
		}));
	},
	clearError: () => {
		set((state) => ({
			account: {
				...state.account,
				error: null,
			},
		}));
	},
});
