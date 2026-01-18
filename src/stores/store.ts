import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createAuthSlice, type AuthSlice } from "./slices/authSlice";
import {
	createTransactionSlice,
	type TransactionSlice,
} from "./slices/transactionSlice";
import { createAccountSlice, type AccountSlice } from "./slices/accountSlice";

export type RootState = AuthSlice & TransactionSlice & AccountSlice;

export const useStore = create<RootState>()(
	persist(
		(...a) => ({
			...createAuthSlice(...a),
			...createTransactionSlice(...a),
			...createAccountSlice(...a),
		}),
		{
			name: "bytebank-storage",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				auth: {
					user: state.auth.user,
					token: state.auth.token,
					isAuthenticated: state.auth.isAuthenticated,
					// Não persiste isLoading e error
					isLoading: false,
					error: null,
				},
				account: {
					accounts: state.account.accounts,
					cards: state.account.cards,
					selectedAccount: state.account.selectedAccount,
					balance: state.account.balance,
					// Não persiste isLoading e error
					isLoading: false,
					error: null,
				},
				// Não persiste transactions (são recarregadas via API)
			}),
		}
	)
);

export default useStore;
