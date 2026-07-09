import { gql } from '@apollo/client';

// `User` (maiúsculo) é o campo de relação que o json-graphql-server gera a partir
// de `user_id`. O nome do autor é resolvido na leitura, nunca copiado para o post.
const FEED_POST_FIELDS = gql`
	fragment FeedPostFields on Feed {
		id
		user_id
		User {
			id
			name
		}
		time
		stats
		category
		description
		timestamp
	}
`;

export const GET_FEED_POST = gql`
	query GetFeedPost($id: ID!) {
		Feed(id: $id) {
			...FeedPostFields
		}
	}
	${FEED_POST_FIELDS}
`;

/**
 * Uma query só para o feed inteiro.
 *
 * Categoria e busca são apenas variações de `$filter` — `{}` traz tudo, `{ category }`
 * filtra, `{ q }` busca no texto, e os dois combinam. Ter dois documentos GraphQL para
 * isso fazia o Apollo descartar o observable a cada troca de filtro.
 *
 * `_allFeedsMeta` respeita o mesmo filtro, então o total serve tanto para exibir a
 * contagem quanto para saber se ainda há página seguinte.
 */
export const GET_FEED = gql`
	query GetFeed($filter: FeedFilter, $page: Int, $perPage: Int) {
		allFeeds(
			sortField: "timestamp"
			sortOrder: "desc"
			filter: $filter
			page: $page
			perPage: $perPage
		) {
			...FeedPostFields
		}
		_allFeedsMeta(filter: $filter) {
			count
		}
	}
	${FEED_POST_FIELDS}
`;

// `User.Feeds` também traria as postagens do usuário, mas não aceita argumentos —
// então não daria para ordenar no servidor. O filtro por `user_id` aceita.
export const GET_USER_FEED = gql`
	query GetUserFeed($userId: ID) {
		allFeeds(sortField: "timestamp", sortOrder: "desc", filter: { user_id: $userId }) {
			...FeedPostFields
		}
	}
	${FEED_POST_FIELDS}
`;
