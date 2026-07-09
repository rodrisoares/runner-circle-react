import { gql } from '@apollo/client';

// A postagem guarda apenas `user_id`. O objeto `User` vem da relação, então as
// mutations devolvem `User { id name }` para o Apollo normalizar o autor no cache.
const FEED_POST_FIELDS = gql`
	fragment MutatedFeedPostFields on Feed {
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

export const ADD_FEED_POST = gql`
	mutation AddFeedPost(
		$userId: ID!
		$time: Int!
		$stats: JSON!
		$category: String!
		$description: String!
		$timestamp: String!
	) {
		createFeed(
			user_id: $userId
			time: $time
			stats: $stats
			category: $category
			description: $description
			timestamp: $timestamp
		) {
			...MutatedFeedPostFields
		}
	}
	${FEED_POST_FIELDS}
`;

export const UPDATE_FEED_POST = gql`
	mutation UpdateFeedPost(
		$id: ID!
		$userId: ID!
		$time: Int!
		$stats: JSON!
		$category: String!
		$description: String!
		$timestamp: String!
	) {
		updateFeed(
			id: $id
			user_id: $userId
			time: $time
			stats: $stats
			category: $category
			description: $description
			timestamp: $timestamp
		) {
			...MutatedFeedPostFields
		}
	}
	${FEED_POST_FIELDS}
`;

export const DELETE_FEED_POST = gql`
	mutation DeleteFeedPost($id: ID!) {
		deleteFeed(id: $id) {
			id
		}
	}
`;
