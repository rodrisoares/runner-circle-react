import { gql } from '@apollo/client';

export const GET_USER = gql`
	query GetUser($id: ID!) {
		User(id: $id) {
			id
			name
			username
			email
			password
			phone
			city
			state
			bio
		}
	}
`;

// Perfil público: não seleciona `password` nem `phone`, que são dados privados.
export const GET_USER_PROFILE = gql`
	query GetUserProfile($id: ID!) {
		User(id: $id) {
			id
			name
			username
			city
			state
			bio
		}
	}
`;

// Só a contagem. Usar `GET_USER_BY_EMAIL` para checar duplicidade traria a senha do
// outro usuário para o cliente — informação que ninguém precisa para saber se um
// email já está em uso.
export const COUNT_USERS_BY_EMAIL = gql`
	query CountUsersByEmail($email: String) {
		_allUsersMeta(filter: { email: $email }) {
			count
		}
	}
`;

export const GET_USER_BY_EMAIL = gql`
	query GetUserByEmail($email: String) {
		allUsers(filter: { email: $email }) {
			id
			email
			password
		}
	}
`;
