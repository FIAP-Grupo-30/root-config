import { create } from "zustand";
import { createAuthSlice, type AuthSlice } from "./slices/authSlice";
import {
	createTransactionSlice,
	type TransactionSlice,
} from "./slices/transactionSlice";
import { createAccountSlice, type AccountSlice } from "./slices/accountSlice";

export type RootState = AuthSlice & TransactionSlice & AccountSlice;

export const useStore = create<RootState>()((...a) => ({
	...createAuthSlice(...a),
	...createTransactionSlice(...a),
	...createAccountSlice(...a),
}));

export default useStore;
