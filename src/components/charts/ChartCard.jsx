import { useId, useState } from 'react';

/**
 * Moldura comum dos gráficos.
 *
 * O botão "Ver tabela" não é enfeite: um tooltip nunca pode ser o único caminho até
 * um valor. A tabela é o gêmeo acessível do gráfico, e cobre teclado, leitor de tela
 * e impressão de uma vez.
 *
 * A altura não é fixada no container — ela cresce com o conteúdo, senão a faixa do
 * eixo x fica de fora e o card ganha um scroll interno.
 */
function ChartCard({ title, subtitle, columns, rows, children }) {
	const [showTable, setShowTable] = useState(false);
	const tableId = useId();

	return (
		<section className='bg-white rounded-lg border border-gray-300 shadow-sm p-4'>
			<div className='flex items-start justify-between gap-4 mb-2'>
				<div>
					<h2 className='font-semibold text-brand-graphite'>{title}</h2>
					{subtitle && <p className='text-xs text-gray-500 mt-0.5'>{subtitle}</p>}
				</div>

				<button
					type='button'
					onClick={() => setShowTable((open) => !open)}
					aria-expanded={showTable}
					aria-controls={tableId}
					className='text-xs font-medium text-gray-600 hover:text-brand-graphite underline underline-offset-2 shrink-0'
				>
					{showTable ? 'Ver gráfico' : 'Ver tabela'}
				</button>
			</div>

			{showTable ? (
				<div id={tableId} className='overflow-x-auto'>
					<table className='w-full text-sm'>
						<caption className='sr-only'>{title}</caption>
						<thead>
							<tr className='text-left text-xs text-gray-500 border-b border-gray-200'>
								{columns.map((column) => (
									<th key={column} scope='col' className='py-2 font-medium'>
										{column}
									</th>
								))}
							</tr>
						</thead>
						<tbody className='[font-variant-numeric:tabular-nums]'>
							{rows.map((row, index) => (
								<tr key={index} className='border-b border-gray-50 last:border-0'>
									{row.map((cell, cellIndex) => (
										<td key={cellIndex} className='py-1.5 text-gray-700'>
											{cell}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<div id={tableId}>{children}</div>
			)}
		</section>
	);
}

export default ChartCard;
