import { CATEGORY_LABELS } from '../constants/categories';
import { formatDistance } from './format';

// Conversão entre o formato do formulário (strings) e o formato persistido (números).
// Antes isso vivia espalhado em NewPost/EditPost como `.replace(' Km', '')`.

/**
 * Frase curta que identifica um treino: "a corrida de 7,2 Km de 06/07".
 *
 * Serve ao diálogo de exclusão e aos `aria-label` dos botões do card. Num grid de
 * dezenas de treinos, "Editar treino" repetido em todos não identifica nada.
 */
export function describeWorkout(workout) {
	const label = (CATEGORY_LABELS[workout.category] ?? 'treino').toLowerCase();
	const date = new Date(workout.timestamp).toLocaleDateString('pt-BR', {
		day: '2-digit',
		month: '2-digit',
	});

	return `a ${label} de ${formatDistance(workout.stats.distance)} de ${date}`;
}

// Aceita `6:00`, `6'00`, `6'00"` e `6` (minutos cheios).
const PACE_PATTERN = /^(\d{1,3})(?:[:'’](\d{1,2})["”]?)?$/;

/**
 * Ritmo digitado -> segundos por km. Devolve `null` para entrada vazia
 * (o campo é opcional) e `undefined` para entrada malformada.
 */
export function parsePace(input) {
	const trimmed = String(input ?? '').trim();
	if (trimmed === '') return null;

	const match = PACE_PATTERN.exec(trimmed);
	if (!match) return undefined;

	const minutes = Number(match[1]);
	const seconds = match[2] === undefined ? 0 : Number(match[2]);
	if (seconds > 59) return undefined;

	const total = minutes * 60 + seconds;
	return total > 0 ? total : undefined;
}

/** Segundos por km -> valor editável no formulário (`6:00`). */
function paceToInput(secondsPerKm) {
	const minutes = Math.floor(secondsPerKm / 60);
	const seconds = secondsPerKm % 60;
	return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/** Elevação digitada -> metros, ou `null` se o campo estiver vazio. */
function parseElevation(input) {
	const trimmed = String(input ?? '').trim();
	if (trimmed === '') return null;

	const parsed = Number(trimmed);
	return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Formulário -> variáveis da mutation.
 *
 * Não inclui `userId` nem `timestamp`: quem chama decide o autor e a data, porque
 * criar e editar tratam esses dois campos de forma diferente.
 *
 * `pace` e `elevation` são opcionais: quando o usuário limpa o campo, a chave é
 * omitida de `stats`. Como `stats` é gravado por inteiro, omitir equivale a apagar.
 */
export function toFeedVariables(formData) {
	const stats = {
		distance: Number(formData.distancia),
		calories: Number(formData.calorias),
		heartRate: Number(formData.bpm),
	};

	const pace = parsePace(formData.ritmo);
	if (pace != null) {
		stats.pace = pace;
	}

	const elevation = parseElevation(formData.elevacao);
	if (elevation != null) {
		stats.elevation = elevation;
	}

	return {
		time: Number(formData.tempo) * 60,
		stats,
		category: formData.tipoTreino,
		description: formData.descricao.trim(),
	};
}

/** Postagem -> estado inicial do formulário. */
export function toFormData(workout) {
	const { stats } = workout;

	return {
		tempo: String(Math.round(workout.time / 60)),
		distancia: String(stats.distance),
		ritmo: stats.pace == null ? '' : paceToInput(stats.pace),
		calorias: String(stats.calories),
		elevacao: stats.elevation == null ? '' : String(stats.elevation),
		bpm: String(stats.heartRate),
		descricao: workout.description ?? '',
		tipoTreino: workout.category,
	};
}
