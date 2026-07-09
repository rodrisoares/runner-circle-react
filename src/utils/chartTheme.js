// Tokens de gráfico.
//
// O verde da marca (#B6FF02) NÃO pode ser usado como marca de gráfico: em OKLCH ele
// tem L=0.917 e rende apenas 1.18:1 de contraste contra uma superfície clara, muito
// abaixo do mínimo de 3:1. Ele funciona nos chips do WorkoutCard só porque lá carrega
// texto preto por cima (13.88:1).
//
// Os tokens abaixo são passos mais escuros da MESMA rampa: o matiz da marca (H=127.7)
// foi mantido e só a luminosidade baixou. Valores conferidos, não estimados:
//
//   token   L      C      contraste vs #fff
//   mark    0.60   0.153  3.78:1   <- dentro da banda 0.43-0.77, croma >= 0.10
//   ink     0.45   0.113  7.20:1   <- passa como texto (WCAG >= 4.5:1)
//   track   0.96   0.107  1.11:1   <- trilho, não codifica valor; é o brand-green-medium
//
// Séries únicas: sem legenda (o título nomeia o que está plotado) e sem rótulo em todo
// ponto. Os valores ficam acessíveis pelo eixo, pelo tooltip e pela visão de tabela.

export const CHART = {
	/** Superfície do card onde os gráficos vivem. */
	surface: '#FFFFFF',
	/** Barras, linha e marcadores. */
	mark: '#669009',
	/** Rótulo direto e valores em destaque. */
	ink: '#436007',
	/** Trilho não preenchido do meter — passo claro da mesma rampa. */
	track: '#DBFFB1',
	/** Grid e eixos: hairline sólido, um passo fora da superfície. */
	grid: '#E5E7EB',
	/** Texto de eixo: token de texto, nunca a cor da série. */
	axisText: '#6B7280',
};

/** Grid e eixos recessivos, sem tracejado. Compartilhado pelos dois gráficos. */
export const chartChromeSx = {
	'& .MuiChartsGrid-line': { stroke: CHART.grid, strokeDasharray: 'none', strokeWidth: 1 },
	'& .MuiChartsAxis-line': { stroke: CHART.grid },
	'& .MuiChartsAxis-tick': { stroke: CHART.grid },
	'& .MuiChartsAxis-tickLabel': { fill: CHART.axisText, fontSize: 11 },
};
