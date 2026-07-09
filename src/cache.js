/**
 * Configuração do cache do Apollo. Aqui só há dados e funções puras — o
 * `InMemoryCache` é montado em `main.jsx`, o que mantém esta política testável
 * sem subir a aplicação.
 */
export const typePolicies = {
	Query: {
		fields: {
			allFeeds: {
				// Cada combinação de filtro/ordenação é uma lista independente. `page` e
				// `perPage` ficam de fora de propósito: são fatias da MESMA lista, e é
				// justamente isso que permite acumulá-las aqui.
				keyArgs: ['filter', 'sortField', 'sortOrder'],

				merge(existing, incoming, { args }) {
					// GET_USER_FEED não pagina: sem `page`, a resposta é a lista inteira.
					// E `page: 0` é sempre um recomeço — é o que o Feed pede ao remontar,
					// e o que impede uma lista velha de sobreviver a uma troca de filtro.
					if (args?.page == null || args.page === 0) {
						return incoming;
					}

					const merged = existing ? existing.slice() : [];
					const offset = args.page * args.perPage;
					for (let index = 0; index < incoming.length; index++) {
						merged[offset + index] = incoming[index];
					}
					return merged;
				},
			},
		},
	},
};
