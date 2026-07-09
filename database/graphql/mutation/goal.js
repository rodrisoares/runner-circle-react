import { gql } from '@apollo/client';

// `targetDistance` é Float! porque o seed contém valores decimais. Se fosse Int!,
// uma meta de 42,2 km seria rejeitada pelo servidor.
export const CREATE_GOAL = gql`
	mutation CreateGoal(
		$userId: ID!
		$title: String!
		$targetDistance: Float!
		$startDate: String!
		$deadline: String!
	) {
		createGoal(
			user_id: $userId
			title: $title
			targetDistance: $targetDistance
			startDate: $startDate
			deadline: $deadline
		) {
			id
			user_id
			title
			targetDistance
			startDate
			deadline
		}
	}
`;

export const DELETE_GOAL = gql`
	mutation DeleteGoal($id: ID!) {
		deleteGoal(id: $id) {
			id
		}
	}
`;
