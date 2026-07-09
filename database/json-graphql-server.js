// O json-graphql-server infere o schema a partir destes dados.
//
// Três detalhes importam aqui:
//
// 1. As chaves das coleções PRECISAM ser plurais (`feeds`, `goals`). O resolver da
//    relação reversa deriva o nome do campo da chave (`camelize('feed')` -> `User.Feed`),
//    enquanto o schema o deriva do tipo pluralizado (`User.Feeds`). Com a chave no
//    singular os dois divergem e o servidor nem inicia.
//
// 2. `user_id` cria uma relação bidirecional: `Feed.User` e `User.Feeds`. Por isso o
//    nome do autor NÃO é copiado para dentro da postagem — ele é resolvido na leitura,
//    e renomear o perfil atualiza todas as postagens de uma vez.
//
// 3. Datas são inferidas como String só porque NÃO têm milissegundos. O `DateType` da
//    lib exige `.SSS` antes do `Z`. Se estas datas ganharem milissegundos, o tipo vira
//    `Date` e toda mutation declarada com `$timestamp: String!` quebra. Daí o `isoDate()`.

const DAY_MS = 24 * 60 * 60 * 1000;

/** ISO 8601 sem milissegundos — ver observação 3 acima. */
const isoDate = (date) => date.toISOString().replace(/\.\d{3}Z$/, 'Z');

const daysFromNow = (days, hour = 7, minute = 0) => {
	const date = new Date(Date.now() + days * DAY_MS);
	date.setUTCHours(hour, minute, 0, 0);
	return isoDate(date);
};

const daysAgo = (days, hour, minute) => daysFromNow(-days, hour, minute);

/**
 * PRNG determinístico: o histórico é sempre o mesmo a cada restart do servidor,
 * o que mantém gráficos e totais estáveis entre um reload e outro.
 */
function mulberry32(seed) {
	return () => {
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

const random = mulberry32(20260709);
const between = (min, max) => min + random() * (max - min);
const intBetween = (min, max) => Math.round(between(min, max));

export const users = [
	{
		id: 1,
		name: 'Usuario Teste',
		username: 'usuarioteste',
		email: 'usuario@teste.com',
		password: '123123',
		phone: '11999999999',
		city: 'Sao Paulo',
		state: 'SP',
		bio: 'Adoro correr pela manha!',
	},
	{
		id: 2,
		name: 'Carlos Mendes',
		username: 'carlosmendes',
		email: 'carlos@teste.com',
		password: '123123',
		phone: '11988888888',
		city: 'Campinas',
		state: 'SP',
		bio: 'Treino intervalado é vida.',
	},
	{
		id: 3,
		name: 'Marina Santos',
		username: 'marinasantos',
		email: 'marina@teste.com',
		password: '123123',
		phone: '11977777777',
		city: 'Curitiba',
		state: 'PR',
		bio: 'Caminhando todo dia, sem pressa.',
	},
	{
		id: 4,
		name: 'João Lima',
		username: 'joaolima',
		email: 'joao@teste.com',
		password: '123123',
		phone: '11966666666',
		city: 'Belo Horizonte',
		state: 'MG',
		bio: 'Rumo à meia maratona.',
	},
	{
		id: 5,
		name: 'Letícia Oliveira',
		username: 'leticiaoliveira',
		email: 'leticia@teste.com',
		password: '123123',
		phone: '11955555555',
		city: 'Porto Alegre',
		state: 'RS',
		bio: 'Começando a semana sempre com treino.',
	},
	{
		id: 6,
		name: 'Rafael Costa',
		username: 'rafaelcosta',
		email: 'rafael@teste.com',
		password: '123123',
		phone: '11944444444',
		city: 'Recife',
		state: 'PE',
		bio: 'Recuperação também é treino.',
	},
];

// Mistura proposital de descrições curtas e longas: o card corta em três linhas e só
// mostra "Ver mais" acima de ~120 caracteres. Sem textos longos aqui, esse caminho
// nunca seria exercitado.
const DESCRIPTIONS = {
	corrida: [
		'Corrida matinal antes do trabalho. Pernas leves hoje!',
		'Treino intervalado. Consegui segurar o ritmo até o fim.',
		'Tiros de 400m no parque. Cansei, mas valeu.',
		'Corrida tranquila para soltar as pernas.',
		'Saída longa de domingo. Saí sem meta de tempo, só pelo prazer de correr, e acabei fazendo bem mais do que planejava. Os últimos quilômetros foram duros, mas terminei com a sensação de que a preparação está no caminho certo. Cada semana um pouco mais perto da meta.',
		'Treino puxado hoje. Comecei devagar de propósito, porque na semana passada estourei o ritmo no começo e paguei caro no final. Dessa vez segurei, e nos últimos dois quilômetros ainda sobrou perna para acelerar. Aprendendo a dosar.',
		'Primeiro treino da semana, voltando ao ritmo depois de dois dias parado. Custou sair de casa, mas depois do primeiro quilômetro o corpo entendeu o recado e o resto fluiu.',
	],
	caminhada: [
		'Caminhada leve para recuperar do treino de ontem.',
		'Volta no parque no fim da tarde. Dia bonito.',
		'Fui até a padaria e voltei. Conta, sim.',
		'Caminhada de recuperação, sem pressa nenhuma. Depois do treino longo de ontem as pernas pediram trégua, então hoje foi só manter o corpo em movimento e aproveitar o fim de tarde. Amanhã volto a correr.',
	],
};

let nextFeedId = 1;

/** Gera um treino coerente: o pace é derivado de tempo e distância, não sorteado à parte. */
function makeWorkout(userId, dayOffset, hour, category) {
	const isRun = category === 'corrida';
	const distance = Number(between(isRun ? 4 : 2, isRun ? 14 : 6).toFixed(1));
	const pace = intBetween(isRun ? 300 : 600, isRun ? 420 : 780);
	const time = Math.round(distance * pace);
	const descriptions = DESCRIPTIONS[category];

	const stats = {
		distance,
		calories: Math.round(distance * between(60, 72)),
		heartRate: intBetween(isRun ? 128 : 96, isRun ? 168 : 122),
		pace,
	};

	// Nem todo treino traz elevação — o campo é opcional de propósito.
	if (random() > 0.45) {
		stats.elevation = intBetween(10, 180);
	}

	return {
		id: nextFeedId++,
		user_id: userId,
		time,
		stats,
		category,
		description: descriptions[intBetween(0, descriptions.length - 1)],
		timestamp: daysAgo(dayOffset, hour, intBetween(0, 59)),
	};
}

function buildHistory() {
	const workouts = [];

	// Usuário 1: 12 semanas de histórico, com uma sequência ativa nos últimos 4 dias.
	// Sem isso, "quilometragem do mês", streak e gráficos ficariam todos vazios.
	const STREAK_DAYS = [0, 1, 2, 3];
	for (let dayOffset = 83; dayOffset >= 0; dayOffset--) {
		const trained = STREAK_DAYS.includes(dayOffset) || random() < 0.38;
		if (!trained) continue;

		const category = random() < 0.72 ? 'corrida' : 'caminhada';
		workouts.push(makeWorkout(1, dayOffset, intBetween(6, 19), category));
	}

	// Os demais usuários alimentam o feed público com alguns treinos recentes.
	for (const userId of [2, 3, 4, 5, 6]) {
		const count = intBetween(3, 6);
		for (let i = 0; i < count; i++) {
			const dayOffset = intBetween(0, 45);
			const category = random() < 0.5 ? 'corrida' : 'caminhada';
			workouts.push(makeWorkout(userId, dayOffset, intBetween(6, 20), category));
		}
	}

	return workouts;
}

export const feeds = buildHistory();

// Uma meta = distância acumulada + janela de tempo. O progresso é a soma da distância
// dos treinos do usuário cujo timestamp cai dentro de [startDate, deadline].
//
// `targetDistance` PRECISA ter ao menos um valor decimal no seed: o tipo é inferido dos
// valores, e se todos fossem inteiros o campo viraria `Int!`, rejeitando uma meta de
// 42,2 km criada pela interface.
export const goals = [
	{
		id: 1,
		user_id: 1,
		title: 'Base para a meia maratona',
		targetDistance: 120.5,
		startDate: daysAgo(20, 0, 0),
		deadline: daysFromNow(40, 23, 59),
	},
	{
		id: 2,
		user_id: 1,
		title: 'Desafio 42,2 km no mês',
		targetDistance: 42.2,
		startDate: daysAgo(12, 0, 0),
		deadline: daysFromNow(18, 23, 59),
	},
	{
		id: 3,
		user_id: 4,
		title: 'Meia maratona de setembro',
		targetDistance: 200.0,
		startDate: daysAgo(30, 0, 0),
		deadline: daysFromNow(60, 23, 59),
	},
];
