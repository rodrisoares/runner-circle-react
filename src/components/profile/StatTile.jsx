/**
 *
 * `value` usa as figuras proporcionais da fonte de propósito: `tabular-nums` alarga
 * cada dígito para a largura de um `0` e faz `121` parecer solto em corpo grande.
 */
function StatTile({ label, value, unit, hint }) {
	return (
		<div className='bg-white rounded-lg border border-gray-300 shadow-sm p-4'>
			<p className='text-xs text-gray-500'>{label}</p>
			<p className='mt-1 text-2xl font-semibold text-brand-graphite leading-tight'>
				{value}
				{unit && <span className='ml-1 text-sm font-medium text-gray-500'>{unit}</span>}
			</p>
			{hint && <p className='mt-0.5 text-xs text-gray-400'>{hint}</p>}
		</div>
	);
}

export default StatTile;
