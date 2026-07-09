import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLazyQuery } from '@apollo/client';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Checkbox from '../ui/Checkbox';
import Card from '../ui/Card';
import { GET_USER_BY_EMAIL } from '../../../database/graphql/query/user';
import { useAuth } from '../../hooks/useAuth';
import { normalizeEmail } from '../../utils/email';

function LoginForm() {
	const navigate = useNavigate();
	const location = useLocation();
	const { login } = useAuth();

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [rememberMe, setRememberMe] = useState(false);
	const [error, setError] = useState('');
	const [getUserByEmail, { loading }] = useLazyQuery(GET_USER_BY_EMAIL);

	// Definido pelo ProtectedRoute quando o usuário é barrado numa rota protegida.
	const redirectTo = location.state?.from?.pathname ?? '/feed';

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');

		try {
			// A MESMA normalização do cadastro. O filtro do servidor compara strings
			// exatamente, então `Rodrigo@Mail.com` não encontraria a conta gravada em
			// minúsculas.
			const normalizedEmail = normalizeEmail(email);
			const { data, error: queryError } = await getUserByEmail({
				variables: { email: normalizedEmail },
			});

			if (queryError) {
				throw queryError;
			}

			const user = data?.allUsers?.[0];

			if (user?.email === normalizedEmail && user?.password === password) {
				login(user.id);
				navigate(redirectTo, { replace: true });
			} else {
				setError('Email ou senha incorretos. Tente novamente.');
			}
		} catch (err) {
			console.error('Falha ao fazer login:', err);
			setError('Erro ao fazer login. Tente novamente.');
		}
	};

	return (
		<Card className='w-full max-w-xs'>
			<h1 className='text-xl font-bold text-brand-graphite mb-2'>LOGIN</h1>
			<p className='text-sm text-brand-gray-light mb-4'>Boas-vindas! Faça seu login.</p>

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
					label='Email'
					type='email'
					placeholder='usuario123@hotmail.com'
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
				/>

				<Input
					label='Senha'
					type='password'
					placeholder='••••••'
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
				/>

				<Checkbox
					label='Lembrar-me'
					checked={rememberMe}
					onChange={(e) => setRememberMe(e.target.checked)}
				/>

				<Button type='submit' disabled={loading}>
					{loading ? 'Entrando...' : 'Login'}
					{!loading && (
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
				Ainda não tem conta?{' '}
				<Link to='/register' className='text-brand-graphite font-semibold hover:underline'>
					Crie seu cadastro! 📱
				</Link>
			</p>
		</Card>
	);
}

export default LoginForm;
