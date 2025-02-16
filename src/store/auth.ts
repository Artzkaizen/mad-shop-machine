import { create } from "zustand";

import type { User } from "@/types/user";

interface AuthState {
	user: User | null;
	jwt: string | null;
	setTokens: (jwt: string) => void;
	login: (jwt: string, user: User) => void;
	logout: () => void;
}

const useAuthStore = create<AuthState>(set => ({
	isAuthenticated: false,
	user: null,
	jwt: null,
	setTokens: (jwt) => {
		localStorage.setItem("jwt", jwt);
		set({ jwt });
	},
	login: (jwt, user) => {
		localStorage.setItem("jwt", jwt);
		localStorage.setItem("user", JSON.stringify(user));
		set({ jwt, user });
	},
	logout: () => {
		localStorage.removeItem("jwt");
		localStorage.removeItem("user");
		set({ jwt: null, user: null });
	}
}));

export default useAuthStore;
