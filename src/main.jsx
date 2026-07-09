import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import AuthProvider from './context/AuthProvider.jsx';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { typePolicies } from './cache.js';

const client = new ApolloClient({
	uri: import.meta.env.VITE_API_URL ?? 'http://localhost:3001/graphql',
	cache: new InMemoryCache({ typePolicies }),
});

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<ApolloProvider client={client}>
			<AuthProvider>
				<BrowserRouter>
					<App />
				</BrowserRouter>
			</AuthProvider>
		</ApolloProvider>
	</StrictMode>
);
