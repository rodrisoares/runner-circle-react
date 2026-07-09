import { LineChart } from '@mui/x-charts/LineChart';
import ChartCard from './ChartCard';
import { CHART, chartChromeSx } from '../../utils/chartTheme';
import { formatPace, formatPaceShort } from '../../utils/format';
import { paceSeries } from '../../utils/stats';

/**
 * Tendência ao longo do tempo, série única -> linha de um só matiz.
 *
 * O eixo NÃO é invertido. Ritmo menor é melhor, e virar o eixo para que "melhor" suba
 * inverte a leitura natural de um eixo cartesiano — o subtítulo carrega essa informação
 * sem mentir sobre a geometria.
 *
 * Só corridas entram: ver a explicação em `paceSeries`. O ritmo também só existe quando
 * o usuário preencheu o campo, então a série pode ser bem mais curta que o histórico.
 */
function PaceChart({ workouts }) {
	const series = paceSeries(workouts, 12);

	return (
		<ChartCard
			title='Ritmo nas corridas'
			subtitle='Últimas 12 corridas com ritmo registrado — menor é mais rápido'
			columns={['Data', 'Ritmo']}
			rows={series.map((point) => [point.label, formatPace(point.pace)])}
		>
			{series.length >= 2 ? (
				<LineChart
					height={240}
					series={[
						{
							data: series.map((point) => point.pace),
							color: CHART.mark,
							curve: 'linear',
							showMark: true,
							valueFormatter: (value) => (value == null ? '' : formatPace(value)),
						},
					]}
					xAxis={[{ scaleType: 'point', data: series.map((point) => point.label) }]}
					yAxis={[{ width: 52, valueFormatter: (value) => formatPaceShort(value) }]}
					grid={{ horizontal: true }}
					hideLegend
					margin={{ top: 12, right: 12, bottom: 0, left: 0 }}
					sx={{
						...chartChromeSx,
						'& .MuiLineElement-root': { strokeWidth: 2 },
						// Marcador de 8px com anel de 2px na cor da superfície: legível
						// onde cruza a linha, e alvo de hover maior que o ponto.
						'& .MuiMarkElement-root': {
							r: 4,
							fill: CHART.mark,
							stroke: CHART.surface,
							strokeWidth: 2,
						},
					}}
				/>
			) : (
				<p className='py-12 text-center text-sm text-gray-500'>
					Registre o ritmo em pelo menos duas corridas para ver a evolução.
				</p>
			)}
		</ChartCard>
	);
}

export default PaceChart;
