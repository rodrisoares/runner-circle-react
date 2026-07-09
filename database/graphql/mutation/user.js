import { gql } from '@apollo/client';

// Todas as variáveis são `String!`, e não `String`.
//
// O tipo de cada campo é inferido do seed: como os seis usuários têm os oito campos
// preenchidos, `createUser` exige `String!` em todos. Declarar a variável como anulável
// e passá-la a um argumento não-anulável é erro de validação do GraphQL — a mutation
// nem chega a executar. Enviar string vazia é aceito; enviar `null` não.
//
// `updateUser` é o oposto: seus argumentos são anuláveis, porque é uma atualização
// parcial. Por isso lá as variáveis continuam `String`.
export const CREATE_USER = gql`
	mutation CreateUser(
		$name: String!
		$username: String!
		$email: String!
		$password: String!
		$phone: String!
		$city: String!
		$state: String!
		$bio: String!
	) {
		createUser(
			name: $name
			username: $username
			email: $email
			password: $password
			phone: $phone
			city: $city
			state: $state
			bio: $bio
		) {
			id
			name
			email
		}
	}
`;

export const UPDATE_USER = gql`
	mutation UpdateUser(
		$id: ID!
		$name: String
		$username: String
		$email: String
		$password: String
		$phone: String
		$city: String
		$state: String
		$bio: String
	) {
		updateUser(
			id: $id
			name: $name
			username: $username
			email: $email
			password: $password
			phone: $phone
			city: $city
			state: $state
			bio: $bio
		) {
			id
			name
			username
			email
			phone
			city
			state
			bio
		}
	}
`;
