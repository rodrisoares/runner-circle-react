import { NavLink, useNavigate } from 'react-router-dom';
import FeedIcon from '@mui/icons-material/Feed';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../hooks/useAuth';
import { NAV_ITEMS } from './navItems';

const ICONS = {
	feed: FeedIcon,
	profile: PersonIcon,
};

const baseClasses = 'flex flex-col items-center py-2 px-4';

function BottomNavigation() {
	const navigate = useNavigate();
	const { logout } = useAuth();

	const handleLogout = () => {
		logout();
		navigate('/login', { replace: true });
	};

	return (
		<nav className='md:hidden fixed bottom-0 left-0 right-0 bg-brand-graphite text-white border-t border-gray-700'>
			<div className='flex items-center justify-around py-2'>
				{NAV_ITEMS.map((item) => {
					const Icon = ICONS[item.id];
					return (
						<NavLink
							key={item.id}
							to={item.to}
							className={({ isActive }) =>
								`${baseClasses} ${isActive ? 'text-brand-green-lime' : 'text-gray-400'}`
							}
						>
							<div className='mb-1'>
								<Icon className='w-6 h-6' />
							</div>
							<span className='text-xs'>{item.label}</span>
						</NavLink>
					);
				})}

				<button onClick={handleLogout} className={`${baseClasses} text-gray-400`}>
					<div className='mb-1'>
						<LogoutIcon className='w-6 h-6' />
					</div>
					<span className='text-xs'>Logout</span>
				</button>
			</div>
		</nav>
	);
}

export default BottomNavigation;
