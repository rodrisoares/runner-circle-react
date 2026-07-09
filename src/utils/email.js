/**
 * Forma canônica do email.
 *
 * O filtro do json-graphql-server compara strings exatamente, sem normalizar nada.
 * Sem isso, `Rodrigo@Mail.com` e `rodrigo@mail.com` seriam contas distintas: a
 * verificação de duplicidade passaria batido e a conta nova nunca acharia a si mesma
 * no login. Cadastro e login precisam usar a MESMA normalização.
 */
export function normalizeEmail(email) {
	return email.trim().toLowerCase();
}
