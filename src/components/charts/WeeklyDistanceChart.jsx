import { BarChart } from '@mui/x-charts/BarChart';
import ChartCard from './ChartCard';
import { CHART, chartChromeSx } from '../../utils/chartTheme';
import { weeklyDistance } from '../../utils/stats';

/**
 * Magnitude ao longo do tempo, série única -> colunas de um só matiz.
 *
 * Sem legenda (só há uma série; o título já diz o que está plotado) e sem rótulo em
 * cada coluna (um número em todo ponto vira ruído). Os valores saem pelo eixo, pelo
 * tooltip e pela visão de tabela.
 */
function WeeklyDistanceChart({ workouts }) {
	const weeks = weeklyDistance(workouts, 8);
	const hasData = weeks.some((week) => week.km > 0);

	return (
		<ChartCard
			title='Distância por semana'
			subtitle='Últimas 8 semanas, em quilômetros'
			columns={['Semana de', 'Distância']}
			rows={weeks.map((week) => [week.label, `${week.km} km`])}
		>
			{hasData ? (
				<BarChart
					height={240}
					series={[
						{
							data: weeks.map((week) => week.km),
							color: CHART.mark,
							valueFormatter: (value) => `${value} km`,
						},
					]}
					xAxis={[
						{
							scaleType: 'band',
							data: weeks.map((week) => week.label),
							// Cap da coluna em ~24px: o resto da banda é ar, de propósito.
							categoryGapRatio: 0.7,
						},
					]}
					yAxis={[{ width: 36 }]}
					grid={{ horizontal: true }}
					borderRadius={4}
					hideLegend
					margin={{ top: 12, right: 8, bottom: 0, left: 0 }}
					sx={chartChromeSx}
				/>
			) : (
				<p className='py-12 text-center text-sm text-gray-500'>
					Nenhum treino nas últimas 8 semanas.
				</p>
			)}
		</ChartCard>
	);
}

export default WeeklyDistanceChart;
