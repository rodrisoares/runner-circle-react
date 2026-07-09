import { Link } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';

function ProfileHeader({ user, isOwnProfile }) {
	const location = [user.city, user.state].filter(Boolean).join(', ');

	return (
		<header className='bg-white rounded-lg border border-gray-300 shadow-sm p-5'>
			<div className='flex items-start gap-4'>
				<div className='w-16 h-16 shrink-0 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold'>
					{user.name.charAt(0)}
				</div>

				<div className='min-w-0 flex-1'>
					<h1 className='text-xl font-bold text-brand-graphite truncate'>{user.name}</h1>
					{user.username && <p className='text-sm text-gray-500 truncate'>@{user.username}</p>}

					{location && (
						<p className='mt-1 flex items-center gap-1 text-xs text-gray-500'>
							<LocationOnIcon className='w-3.5 h-3.5' aria-hidden='true' />
							{location}
						</p>
					)}
				</div>

				{isOwnProfile && (
					<Link
						to='/profile/edit'
						className='shrink-0 text-sm font-semibold text-brand-graphite border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors'
					>
						Editar perfil
					</Link>
				)}
			</div>

			{user.bio && <p className='mt-4 text-sm text-gray-600 leading-relaxed'>{user.bio}</p>}
		</header>
	);
}

export default ProfileHeader;
