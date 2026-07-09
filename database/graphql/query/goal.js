import { gql } from '@apollo/client';

export const GET_USER_GOALS = gql`
	query GetUserGoals($userId: ID) {
		allGoals(filter: { user_id: $userId }) {
			id
			user_id
			title
			targetDistance
			startDate
			deadline
		}
	}
`;
