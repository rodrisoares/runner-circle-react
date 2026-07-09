import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import NewPost from './pages/NewPost';
import PostDetail from './pages/PostDetail';
import EditPost from './pages/EditPost';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';

function App() {
	return (
		<Routes>
			<Route path='/login' element={<Login />} />
			<Route path='/register' element={<Register />} />

			<Route element={<ProtectedRoute />}>
				<Route path='/feed' element={<Feed />} />
				<Route path='/posts/new' element={<NewPost />} />
				<Route path='/posts/:id' element={<PostDetail />} />
				<Route path='/posts/:id/edit' element={<EditPost />} />
				{/* Profile serve as duas rotas: sem `:id` é o perfil do usuário logado. */}
				<Route path='/profile' element={<Profile />} />
				<Route path='/profile/edit' element={<EditProfile />} />
				<Route path='/users/:id' element={<Profile />} />
			</Route>

			<Route path='/' element={<Navigate to='/feed' replace />} />
			<Route path='*' element={<Navigate to='/feed' replace />} />
		</Routes>
	);
}

export default App;
