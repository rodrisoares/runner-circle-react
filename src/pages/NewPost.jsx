import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import BottomNavigation from '../components/layout/BottomNavigation';
import NewPostForm from '../components/forms/NewPostForm';
import ErrorMessage from '../components/ui/ErrorMessage';
import { ADD_FEED_POST } from '../../database/graphql/mutation/feed';
import { useAuth } from '../hooks/useAuth';
import { toFeedVariables } from '../utils/workout';

function NewPost() {
	const navigate = useNavigate();
	const { userId } = useAuth();
	const [submitError, setSubmitError] = useState('');

	// O feed está desmontado enquanto esta tela existe, então quem revalida a
	// lista é o fetchPolicy cache-and-network do Feed ao remontar.
	const [addFeedPost, { loading: savingPost }] = useMutation(ADD_FEED_POST);

	const handleSubmit = async (formData) => {
		setSubmitError('');

		try {
			await addFeedPost({
				variables: {
					...toFeedVariables(formData),
					userId,
					timestamp: new Date().toISOString(),
				},
			});
			navigate('/feed');
		} catch (error) {
			setSubmitError(error.message);
		}
	};

	return (
		<div className='min-h-screen bg-gray-50'>
			<Header />

			<div className='md:flex'>
				<Sidebar />

				<main className='flex-1 p-4 md:p-6 pb-20 md:pb-6'>
					<div className='max-w-4xl mx-auto space-y-4'>
						{submitError && <ErrorMessage message='Erro ao salvar treino' error={submitError} />}

						<NewPostForm
							onSubmit={handleSubmit}
							onCancel={() => navigate('/feed')}
							loading={savingPost}
						/>
					</div>
				</main>
			</div>

			<BottomNavigation />
		</div>
	);
}

export default NewPost;
