import { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';

/** `AAAA-MM-DD` de hoje, no fuso local — valor inicial do input de data. */
function todayInputValue() {
	const now = new Date();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');
	return `${now.getFullYear()}-${month}-${day}`;
}

/**
 * `AAAA-MM-DD` -> ISO sem milissegundos.
 * O `Date` não entra nessa conversão: `new Date('2026-08-31').toISOString()` traz
 * `.000Z`, e milissegundos fazem o json-graphql-server inferir o tipo `Date`.
 */
const toIsoDate = (value, time) => `${value}T${time}Z`;

function GoalForm({ onSubmit, onCancel, loading }) {
	const [title, setTitle] = useState('');
	const [targetDistance, setTargetDistance] = useState('');
	const [deadline, setDeadline] = useState('');
	const [errors, setErrors] = useState({});

	const today = todayInputValue();

	const handleSubmit = (event) => {
		event.preventDefault();

		const newErrors = {};
		if (!title.trim()) {
			newErrors.title = 'Dê um nome à meta';
		}
		if (!(Number(targetDistance) > 0)) {
			newErrors.targetDistance = 'Informe uma distância maior que zero';
		}
		if (!deadline) {
			newErrors.deadline = 'Escolha um prazo';
		} else if (deadline < today) {
			newErrors.deadline = 'O prazo não pode estar no passado';
		}

		setErrors(newErrors);
		if (Object.keys(newErrors).length > 0) return;

		onSubmit({
			title: title.trim(),
			targetDistance: Number(targetDistance),
			startDate: toIsoDate(today, '00:00:00'),
			deadline: toIsoDate(deadline, '23:59:00'),
		});
	};

	return (
		<form onSubmit={handleSubmit} className='space-y-4' noValidate>
			<Input
				label='Nome da meta'
				placeholder='Base para a meia maratona'
				value={title}
				onChange={(event) => setTitle(event.target.value)}
				error={errors.title}
			/>

			<div className='grid grid-cols-2 gap-4'>
				<Input
					label='Distância alvo (km)'
					type='number'
					min='0'
					step='0.1'
					placeholder='42.2'
					value={targetDistance}
					onChange={(event) => setTargetDistance(event.target.value)}
					error={errors.targetDistance}
				/>
				<Input
					label='Prazo'
					type='date'
					min={today}
					value={deadline}
					onChange={(event) => setDeadline(event.target.value)}
					error={errors.deadline}
				/>
			</div>

			<p className='text-xs text-gray-500'>
				O progresso soma a distância dos treinos publicados entre hoje e o prazo.
			</p>

			<div className='flex gap-3 pt-2'>
				<Button type='button' variant='secondary' onClick={onCancel} className='flex-1'>
					Cancelar
				</Button>
				<Button type='submit' disabled={loading} className='flex-1'>
					{loading ? 'Criando...' : 'Criar meta'}
				</Button>
			</div>
		</form>
	);
}

export default GoalForm;
