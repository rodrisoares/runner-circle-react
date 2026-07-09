import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import ErrorMessage from '../ui/ErrorMessage';
import { GET_USER } from '../../../database/graphql/query/user';
import { UPDATE_USER } from '../../../database/graphql/mutation/user';
import { useAuth } from '../../hooks/useAuth';

const EMPTY_FORM = {
	name: '',
	username: '',
	email: '',
	phone: '',
	city: '',
	state: '',
	bio: '',
};

function EditProfileForm({ onSubmit, onCancel }) {
	const { userId } = useAuth();
	const [formData, setFormData] = useState(EMPTY_FORM);
	const [originalPassword, setOriginalPassword] = useState('');
	const [error, setError] = useState('');

	const { loading, error: queryError, data } = useQuery(GET_USER, { variables: { id: userId } });
	const [updateUser, { loading: saving }] = useMutation(UPDATE_USER);

	useEffect(() => {
		if (data?.User) {
			const { name, username, email, phone, city, state, bio, password } = data.User;

			setFormData({
				name: name ?? '',
				username: username ?? '',
				email: email ?? '',
				phone: phone ?? '',
				city: city ?? '',
				state: state ?? '',
				bio: bio ?? '',
			});
			setOriginalPassword(password ?? '');
			setError('');
		}
	}, [data]);

	const handleChange = (field) => (e) => {
		setFormData((prev) => ({ ...prev, [field]: e.target.value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');

		try {
			await updateUser({
				variables: {
					id: userId,
					...formData,
					// A mutation exige o campo; sem uma tela de troca de senha,
					// reenviamos o valor atual para não sobrescrevê-lo com vazio.
					password: originalPassword,
				},
			});

			onSubmit?.(formData);
		} catch (err) {
			setError(err.message);
		}
	};

	if (loading) {
		return (
			<div className='bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto'>
				<div className='flex justify-center items-center py-8'>
					<div className='text-gray-500'>Carregando dados do perfil...</div>
				</div>
			</div>
		);
	}

	if (queryError) {
		return (
			<div className='bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto'>
				<ErrorMessage message='Erro ao carregar perfil' error={queryError.message} />
			</div>
		);
	}

	return (
		<div className='bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto'>
			<div className='flex items-center justify-between mb-6'>
				<h2 className='text-xl font-bold text-brand-graphite'>Editar Perfil</h2>
				<button
					type='button'
					onClick={onCancel}
					className='text-gray-500 hover:text-gray-700'
					aria-label='Fechar'
				>
					<svg
						className='w-6 h-6'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'
						aria-hidden='true'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M6 18L18 6M6 6l12 12'
						/>
					</svg>
				</button>
			</div>

			<form onSubmit={handleSubmit} className='space-y-6'>
				{error && <ErrorMessage message='Erro ao salvar perfil' error={error} />}

				<div className='space-y-4'>
					<Input
						label='Nome completo'
						value={formData.name}
						onChange={handleChange('name')}
						placeholder='Seu nome completo'
					/>

					<Input
						label='Usuário'
						value={formData.username}
						onChange={handleChange('username')}
						placeholder='@seuusuario'
					/>

					<Input
						label='Email'
						type='email'
						value={formData.email}
						onChange={handleChange('email')}
						placeholder='seu@email.com'
					/>

					<Input
						label='Telefone'
						value={formData.phone}
						onChange={handleChange('phone')}
						placeholder='(11) 99999-9999'
					/>

					<div className='grid grid-cols-2 gap-4'>
						<Input
							label='Cidade'
							value={formData.city}
							onChange={handleChange('city')}
							placeholder='Sua cidade'
						/>
						<Input
							label='Estado'
							value={formData.state}
							onChange={handleChange('state')}
							placeholder='SP'
						/>
					</div>

					<Textarea
						label='Bio'
						value={formData.bio}
						onChange={handleChange('bio')}
						placeholder='Conte um pouco sobre você...'
						rows={3}
					/>
				</div>

				<div className='flex space-x-4 pt-6'>
					<Button type='button' variant='secondary' onClick={onCancel} className='flex-1'>
						Cancelar
					</Button>
					<Button type='submit' disabled={saving} className='flex-1'>
						{saving ? 'Salvando...' : 'Salvar alterações'}
					</Button>
				</div>
			</form>
		</div>
	);
}

export default EditProfileForm;
