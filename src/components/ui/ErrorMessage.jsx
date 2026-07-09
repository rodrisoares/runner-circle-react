function ErrorMessage({ message, error }) {
	return (
		<div role='alert' className='flex flex-col justify-center items-center py-8 gap-1'>
			<p className='text-red-500'>{message}</p>
			{error && <p className='text-xs text-gray-500'>{error}</p>}
		</div>
	);
}

export default ErrorMessage;
