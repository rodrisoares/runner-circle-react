import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import BottomNavigation from '../components/layout/BottomNavigation';
import NewPostForm from '../components/forms/NewPostForm';
import ErrorMessage from '../components/ui/ErrorMessage';
import { UPDATE_FEED_POST } from '../../database/graphql/mutation/feed';
import { GET_FEED_POST } from '../../database/graphql/query/feed';
import { useAuth } from '../hooks/useAuth';
import { toFeedVariables, toFormData } from '../utils/workout';

function EditPost() {
	const { id } = useParams();
	const navigate = useNavigate();
	const { userId } = useAuth();
	const [submitError, setSubmitError] = useState('');

	const {
		data: postData,
		loading: loadingPost,
		error: postError,
	} = useQuery(GET_FEED_POST, { variables: { id } });

	// updateFeed retorna id + campos alterados, então o Apollo atualiza o registro
	// normalizado sozinho. A troca de categoria muda a lista a que o post pertence,
	// e disso quem cuida é o cache-and-network do Feed ao remontar.
	const [updateFeedPost, { loading: savingPost }] = useMutation(UPDATE_FEED_POST);

	const workout = postData?.Feed;

	const handleSubmit = async (formData) => {
		setSubmitError('');

		try {
			await updateFeedPost({
				variables: {
					...toFeedVariables(formData),
					id: workout.id,
					// Editar não muda o autor nem republica: os dois são preservados.
					userId: workout.user_id,
					timestamp: workout.timestamp,
				},
			});
			navigate('/feed');
		} catch (error) {
			setSubmitError(error.message);
		}
	};

	const renderContent = () => {
		if (loadingPost) {
			return <div className='text-center text-gray-500 py-8'>Carregando postagem...</div>;
		}

		if (postError) {
			return <ErrorMessage message='Erro ao carregar a postagem' error={postError.message} />;
		}

		if (!workout) {
			return <ErrorMessage message='Postagem não encontrada' />;
		}

		// A URL é adivinhável, então a checagem de dono não pode viver só no card.
		if (String(workout.user_id) !== userId) {
			return <Navigate to='/feed' replace />;
		}

		return (
			<>
				{submitError && <ErrorMessage message='Erro ao atualizar treino' error={submitError} />}

				<NewPostForm
					// Remonta o formulário quando a postagem carregada muda, já que
					// NewPostForm só lê `initialData` na montagem.
					key={workout.id}
					onSubmit={handleSubmit}
					onCancel={() => navigate('/feed')}
					loading={savingPost}
					initialData={toFormData(workout)}
					isEditing
				/>
			</>
		);
	};

	return (
		<div className='min-h-screen bg-gray-50'>
			<Header />

			<div className='md:flex'>
				<Sidebar />

				<main className='flex-1 p-4 md:p-6 pb-20 md:pb-6'>
					<div className='max-w-4xl mx-auto space-y-4'>{renderContent()}</div>
				</main>
			</div>

			<BottomNavigation />
		</div>
	);
}

export default EditPost;
