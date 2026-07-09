// Agregações do perfil, calculadas a partir dos treinos já carregados.
// Tudo aqui é função pura: recebe a lista de treinos, devolve números.

const DAY_MS = 24 * 60 * 60 * 1000;

const round1 = (value) => Math.round(value * 10) / 10;

/** Chave `AAAA-MM-DD` no fuso local — o "dia" da sequência é o dia do usuário. */
function localDayKey(date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

/** Segunda-feira da semana da data, à meia-noite local. */
function startOfWeek(date) {
	const result = new Date(date);
	result.setHours(0, 0, 0, 0);
	const weekday = (result.getDay() + 6) % 7; // 0 = segunda
	result.setDate(result.getDate() - weekday);
	return result;
}

/**
 * Dias consecutivos com pelo menos um treino, contando de trás para frente.
 * Não ter treinado ainda hoje não zera a sequência: a contagem começa em ontem.
 */
export function currentStreak(workouts, now = new Date()) {
	if (workouts.length === 0) return 0;

	const trainedDays = new Set(workouts.map((w) => localDayKey(new Date(w.timestamp))));

	const cursor = new Date(now);
	cursor.setHours(0, 0, 0, 0);
	if (!trainedDays.has(localDayKey(cursor))) {
		cursor.setDate(cursor.getDate() - 1);
	}

	let streak = 0;
	while (trainedDays.has(localDayKey(cursor))) {
		streak++;
		cursor.setDate(cursor.getDate() - 1);
	}

	return streak;
}

export function summarize(workouts, now = new Date()) {
	const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

	let totalDistance = 0;
	let totalTime = 0;
	let distanceThisMonth = 0;

	for (const workout of workouts) {
		totalDistance += workout.stats.distance;
		totalTime += workout.time;

		if (new Date(workout.timestamp).getTime() >= monthStart) {
			distanceThisMonth += workout.stats.distance;
		}
	}

	return {
		totalWorkouts: workouts.length,
		totalDistance: round1(totalDistance),
		totalTime,
		distanceThisMonth: round1(distanceThisMonth),
		streak: currentStreak(workouts, now),
	};
}

/** Distância somada por semana, das `weeks` últimas semanas até a atual. */
export function weeklyDistance(workouts, weeks = 8, now = new Date()) {
	const currentWeekStart = startOfWeek(now);

	const buckets = Array.from({ length: weeks }, (_, index) => {
		const start = new Date(currentWeekStart);
		start.setDate(start.getDate() - (weeks - 1 - index) * 7);
		return { start, km: 0 };
	});

	const firstWeek = buckets[0].start.getTime();

	for (const workout of workouts) {
		const weekStart = startOfWeek(new Date(workout.timestamp)).getTime();
		// Arredonda em vez de truncar: 7 dias corridos podem não ser exatamente 7*24h.
		const index = Math.round((weekStart - firstWeek) / (7 * DAY_MS));

		if (index >= 0 && index < buckets.length) {
			buckets[index].km += workout.stats.distance;
		}
	}

	return buckets.map(({ start, km }) => ({
		label: `${String(start.getDate()).padStart(2, '0')}/${String(start.getMonth() + 1).padStart(2, '0')}`,
		km: round1(km),
	}));
}

/**
 * Ritmo dos últimos treinos que o registraram, em ordem cronológica.
 *
 * Filtra por modalidade de propósito. Ritmo de caminhada (10-13 min/km) e de corrida
 * (5-7 min/km) na mesma linha não descrevem uma tendência: o ponto de caminhada vira
 * um pico que parece perda de desempenho e ainda estica o eixo Y, achatando a variação
 * real das corridas. Ritmo só é comparável dentro da mesma modalidade.
 *
 * `pace` é opcional, então a série pode ser menor que a lista de treinos.
 */
export function paceSeries(workouts, limit = 12, category = 'corrida') {
	return workouts
		.filter((workout) => workout.category === category && workout.stats.pace != null)
		.slice(0, limit)
		.reverse()
		.map((workout) => {
			const date = new Date(workout.timestamp);
			return {
				label: `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`,
				pace: workout.stats.pace,
				category: workout.category,
			};
		});
}

/** Progresso de uma meta: soma a distância dos treinos dentro da janela [startDate, deadline]. */
export function goalProgress(goal, workouts, now = new Date()) {
	const start = new Date(goal.startDate).getTime();
	const end = new Date(goal.deadline).getTime();

	const achieved = workouts.reduce((sum, workout) => {
		const at = new Date(workout.timestamp).getTime();
		return at >= start && at <= end ? sum + workout.stats.distance : sum;
	}, 0);

	const ratio = goal.targetDistance > 0 ? achieved / goal.targetDistance : 0;
	const daysLeft = Math.max(0, Math.ceil((end - now.getTime()) / DAY_MS));

	return {
		achieved: round1(achieved),
		remaining: round1(Math.max(0, goal.targetDistance - achieved)),
		/** Limitado a 1 para desenhar a barra; use `ratio` para o texto. */
		fillRatio: Math.min(1, Math.max(0, ratio)),
		percent: Math.round(ratio * 100),
		isComplete: achieved >= goal.targetDistance,
		isExpired: now.getTime() > end,
		daysLeft,
	};
}
