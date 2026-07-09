export const WORKOUT_CATEGORIES = [
	{ value: 'corrida', label: 'Corrida' },
	{ value: 'caminhada', label: 'Caminhada' },
];

export const CATEGORY_LABELS = Object.fromEntries(
	WORKOUT_CATEGORIES.map(({ value, label }) => [value, label])
);

/** Valores aceitos vindos da URL — qualquer outra coisa é tratada como "sem filtro". */
export const CATEGORY_VALUES = new Set(WORKOUT_CATEGORIES.map(({ value }) => value));
