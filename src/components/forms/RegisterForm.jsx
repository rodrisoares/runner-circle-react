import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLazyQuery, useMutation } from '@apollo/client';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { CREATE_USER } from '../../../database/graphql/mutation/user';
import { COUNT_USERS_BY_EMAIL } from '../../../database/graphql/query/user';
import { normalizeEmail } from '../../utils/email';

function RegisterForm() {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		confirmPassword: '',
	});
	const [error, setError] = useState('');
	const [checkingEmail, setCheckingEmail] = useState(false);

	// `network-only`: um resultado em cache de uma tentativa anterior diria que o email
	// está livre mesmo depois de a conta ter sido criada.
	const [countUsersByEmail] = useLazyQuery(COUNT_USERS_BY_EMAIL, { fetchPolicy: 'network-only' });
	const [createUser, { loading: creating }] = useMutation(CREATE_USER);

	const submitting = checkingEmail || creating;

	const handleChange = (field) => (e) => {
		setFormData((prev) => ({ ...prev, [field]: e.target.value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');

		if (formData.password !== formData.confirmPassword) {
			setError('As senhas não coincidem');
			return;
		}

		if (formData.password.length < 6) {
			setError('A senha deve ter pelo menos 6 caracteres');
			return;
		}

		const email = normalizeEmail(formData.email);

		try {
			// Verificação só de interface. O servidor aceita o email duplicado de qualquer
			// forma, e entre esta consulta e o `createUser` abaixo nada impede que outra
			// pessoa cadastre o mesmo email. Impedir isso de verdade exige uma restrição
			// de unicidade no backend, que o json-graphql-server não oferece.
			setCheckingEmail(true);
			const { data, error: queryError } = await countUsersByEmail({ variables: { email } });
			setCheckingEmail(false);

			if (queryError) {
				throw queryError;
			}

			if (data?._allUsersMeta?.count > 0) {
				// Sem esta checagem, a conta seria criada e ficaria inacessível: o login
				// busca por email e sempre encontra a primeira conta, nunca a nova.
				setError('Já existe uma conta com esse email. Faça login ou use outro email.');
				return;
			}

			await createUser({
				variables: {
					name: formData.name.trim(),
					username: '',
					email,
					password: formData.password,
					phone: '',
					city: '',
					state: '',
					bio: '',
				},
			});

			navigate('/login');
		} catch (err) {
			// A mensagem do servidor não serve ao usuário final, mas some sem rastro se
			// não for registrada — foi assim que um erro de validação do GraphQL ficou
			// escondido atrás de "Tente novamente".
			console.error('Falha ao criar conta:', err);
			setError('Erro ao criar conta. Tente novamente.');
		} finally {
			setCheckingEmail(false);
		}
	};

	return (
		<Card className='w-full max-w-sm'>
			<h1 className='text-xl font-bold text-brand-graphite mb-2'>CRIAR CONTA</h1>
			<p className='text-sm text-brand-gray-light mb-4'>Crie sua conta para começar a correr!</p>

			<form onSubmit={handleSubmit} className='space-y-4'>
				{error && (
					<div
						role='alert'
						className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm'
					>
						{error}
					</div>
				)}

				<Input
					label='Nome completo'
					type='text'
					placeholder='Seu nome completo'
					value={formData.name}
					onChange={handleChange('name')}
					required
				/>

				<Input
					label='Email'
					type='email'
					placeholder='usuario123@hotmail.com'
					value={formData.email}
					onChange={handleChange('email')}
					required
				/>

				<Input
					label='Senha'
					type='password'
					placeholder='••••••••'
					value={formData.password}
					onChange={handleChange('password')}
					required
				/>

				<Input
					label='Confirmar senha'
					type='password'
					placeholder='••••••••'
					value={formData.confirmPassword}
					onChange={handleChange('confirmPassword')}
					required
				/>

				<Button type='submit' disabled={submitting}>
					{submitting ? 'Criando conta...' : 'Criar conta'}
					{!submitting && (
						<svg
							className='w-4 h-4 ml-2'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
							aria-hidden='true'
						>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
						</svg>
					)}
				</Button>
			</form>

			<p className='mt-4 text-center text-xs text-brand-gray-light'>
				Já tem uma conta?{' '}
				<Link to='/login' className='text-brand-graphite font-semibold hover:underline'>
					Faça login! 🏃‍♂️
				</Link>
			</p>
		</Card>
	);
}

export default RegisterForm;
