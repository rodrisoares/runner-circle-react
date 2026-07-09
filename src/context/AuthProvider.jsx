import { useCallback, useMemo, useState } from 'react';
import { useApolloClient } from '@apollo/client';
import { AuthContext } from './auth-context';

const STORAGE_KEY = 'userId';

function AuthProvider({ children }) {
	const client = useApolloClient();
	const [userId, setUserId] = useState(() => localStorage.getItem(STORAGE_KEY));

	const login = useCallback((id) => {
		const value = String(id);
		localStorage.setItem(STORAGE_KEY, value);
		setUserId(value);
	}, []);

	const logout = useCallback(() => {
		localStorage.removeItem(STORAGE_KEY);
		setUserId(null);
		// Sem isso o próximo usuário a logar enxerga o feed e o perfil do anterior.
		client.clearStore();
	}, [client]);

	const value = useMemo(
		() => ({ userId, isAuthenticated: Boolean(userId), login, logout }),
		[userId, login, logout]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
