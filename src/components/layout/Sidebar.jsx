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

const baseClasses = 'w-12 h-12 rounded-lg flex items-center justify-center transition-colors';
const activeClasses = 'bg-brand-green-lime text-brand-graphite';
const idleClasses = 'hover:bg-gray-700 text-gray-400';

function Sidebar() {
	const navigate = useNavigate();
	const { logout } = useAuth();

	const handleLogout = () => {
		logout();
		navigate('/login', { replace: true });
	};

	return (
		<aside className='hidden md:flex bg-brand-graphite text-white w-16 min-h-screen flex-col items-center py-6 space-y-6'>
			<nav className='flex flex-col items-center space-y-6'>
				{NAV_ITEMS.map((item) => {
					const Icon = ICONS[item.id];
					return (
						<NavLink
							key={item.id}
							to={item.to}
							title={item.label}
							className={({ isActive }) =>
								`${baseClasses} ${isActive ? activeClasses : idleClasses}`
							}
						>
							<Icon className='w-6 h-6' />
							<span className='sr-only'>{item.label}</span>
						</NavLink>
					);
				})}
			</nav>

			<button onClick={handleLogout} className={`${baseClasses} ${idleClasses}`} title='Logout'>
				<LogoutIcon className='w-6 h-6' />
				<span className='sr-only'>Logout</span>
			</button>
		</aside>
	);
}

export default Sidebar;
