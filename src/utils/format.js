// `stats` é persistido como números crus. Toda formatação de unidade vive aqui,
// para que nenhuma tela precise desfazer uma string formatada com `.replace()`.

const distanceFormatter = new Intl.NumberFormat('pt-BR', {
	minimumFractionDigits: 0,
	maximumFractionDigits: 1,
});

/** Só o número, sem unidade — para quando o valor e a unidade têm tamanhos diferentes. */
export function formatDistanceNumber(km) {
	return distanceFormatter.format(km);
}

export function formatDistance(km) {
	return `${formatDistanceNumber(km)} Km`;
}

export function formatCalories(kcal) {
	return `${kcal} Kcal`;
}

export function formatHeartRate(bpm) {
	return `${bpm} BPM`;
}

export function formatElevation(meters) {
	return `${meters} m`;
}

/** Segundos por km para `6'00"/km`. */
export function formatPace(secondsPerKm) {
	return `${formatPaceShort(secondsPerKm)}/km`;
}

/** Segundos por km para `6'00"` — sem a unidade, para ticks de eixo. */
export function formatPaceShort(secondsPerKm) {
	const minutes = Math.floor(secondsPerKm / 60);
	const seconds = Math.round(secondsPerKm % 60);
	return `${minutes}'${String(seconds).padStart(2, '0')}"`;
}

const pad = (value) => String(value).padStart(2, '0');

/** Segundos para `MM:SS`, ou `H:MM:SS` a partir de uma hora. */
export function formatDuration(seconds) {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const remainingSeconds = seconds % 60;

	if (hours > 0) {
		return `${hours}:${pad(minutes)}:${pad(remainingSeconds)}`;
	}

	return `${pad(minutes)}:${pad(remainingSeconds)}`;
}

const relativeTimeFormatter = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });

// Do maior para o menor: a primeira unidade em que o intervalo "cabe" é a escolhida.
const RELATIVE_UNITS = [
	['year', 60 * 60 * 24 * 365],
	['month', 60 * 60 * 24 * 30],
	['day', 60 * 60 * 24],
	['hour', 60 * 60],
	['minute', 60],
];

/** Data ISO para `há 2 horas`, `ontem`, `há 3 meses`. */
export function formatRelativeTime(isoDate, now = Date.now()) {
	const elapsedSeconds = (new Date(isoDate).getTime() - now) / 1000;

	for (const [unit, secondsInUnit] of RELATIVE_UNITS) {
		if (Math.abs(elapsedSeconds) >= secondsInUnit) {
			return relativeTimeFormatter.format(Math.round(elapsedSeconds / secondsInUnit), unit);
		}
	}

	return 'agora mesmo';
}
