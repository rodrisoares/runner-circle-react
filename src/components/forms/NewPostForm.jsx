import { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import RadioGroup from '../ui/RadioGroup';
import { WORKOUT_CATEGORIES } from '../../constants/categories';
import { parsePace } from '../../utils/workout';

const EMPTY_FORM = {
	tempo: '',
	distancia: '',
	ritmo: '',
	calorias: '',
	elevacao: '',
	bpm: '',
	descricao: '',
	tipoTreino: 'corrida',
};

/** Trata `''`, `null` e strings não numéricas como inválidos. */
const isPositiveNumber = (input) => {
	if (input === '' || input === null || input === undefined) return false;
	const parsed = Number(input);
	return Number.isFinite(parsed) && parsed > 0;
};

function NewPostForm({ onSubmit, onCancel, loading, initialData, isEditing }) {
	// `initialData` só é lido na montagem. Quem renderiza este formulário com dados
	// vindos de uma query precisa passar um `key` para forçar a remontagem.
	const [formData, setFormData] = useState(initialData ?? EMPTY_FORM);
	const [errors, setErrors] = useState({});

	const handleChange = (field) => (e) => {
		const value = e?.target ? e.target.value : e;
		setFormData((prev) => ({ ...prev, [field]: value }));

		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: '' }));
		}
	};

	const validateForm = () => {
		const newErrors = {};

		if (!isPositiveNumber(formData.tempo)) {
			newErrors.tempo = 'Informe um tempo maior que zero';
		}
		if (!isPositiveNumber(formData.distancia)) {
			newErrors.distancia = 'Informe uma distância maior que zero';
		}
		if (!isPositiveNumber(formData.calorias)) {
			newErrors.calorias = 'Informe as calorias';
		}
		if (!isPositiveNumber(formData.bpm)) {
			newErrors.bpm = 'Informe os batimentos';
		}
		if (!formData.descricao.trim()) {
			newErrors.descricao = 'Descrição é obrigatória';
		}
		// Campo opcional: só é inválido quando preenchido com algo que não parseia.
		if (parsePace(formData.ritmo) === undefined) {
			newErrors.ritmo = 'Use o formato MM:SS (ex.: 6:00)';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		if (validateForm()) {
			onSubmit?.(formData);
		}
	};

	return (
		<div className='bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto'>
			<div className='flex items-center justify-between mb-6'>
				<h2 className='text-xl font-bold text-brand-graphite'>
					{isEditing ? 'Editar postagem' : 'Nova postagem'}
				</h2>
				<button
					type='button'
					onClick={onCancel}
					className='text-gray-500 hover:text-gray-700'
					aria-label='Fechar'
				>
					<svg
						className='w-6 h-6'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'
						aria-hidden='true'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M6 18L18 6M6 6l12 12'
						/>
					</svg>
				</button>
			</div>

			<form onSubmit={handleSubmit} className='space-y-6' noValidate>
				{Object.keys(errors).length > 0 && (
					<div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm'>
						Por favor, revise os campos obrigatórios (*)
					</div>
				)}

				<div className='grid grid-cols-2 gap-4'>
					<Input
						label='Tempo (minutos) *'
						placeholder='30'
						value={formData.tempo}
						onChange={handleChange('tempo')}
						type='number'
						min='1'
						error={errors.tempo}
					/>
					<Input
						label='Ritmo (min/km)'
						placeholder='6:00'
						value={formData.ritmo}
						onChange={handleChange('ritmo')}
						inputMode='numeric'
						error={errors.ritmo}
					/>
				</div>

				<div className='grid grid-cols-2 gap-4'>
					<Input
						label='Distância (km) *'
						placeholder='5'
						value={formData.distancia}
						onChange={handleChange('distancia')}
						type='number'
						min='0'
						step='0.1'
						error={errors.distancia}
					/>
					<Input
						label='Elevação (m)'
						placeholder='50'
						value={formData.elevacao}
						onChange={handleChange('elevacao')}
						type='number'
						min='0'
					/>
				</div>

				<div className='grid grid-cols-2 gap-4'>
					<Input
						label='Calorias (kcal) *'
						placeholder='300'
						value={formData.calorias}
						onChange={handleChange('calorias')}
						type='number'
						min='0'
						error={errors.calorias}
					/>
					<Input
						label='BPM *'
						placeholder='120'
						value={formData.bpm}
						onChange={handleChange('bpm')}
						type='number'
						min='0'
						error={errors.bpm}
					/>
				</div>

				<Textarea
					label='Descrição *'
					placeholder='Conte como foi seu treino! Como se sentiu? Alguma dificuldade? Conquista especial? Compartilhe sua experiência com a comunidade.'
					value={formData.descricao}
					onChange={handleChange('descricao')}
					rows={4}
					error={errors.descricao}
				/>

				<RadioGroup
					name='tipoTreino'
					label='Tipo de Treino'
					options={WORKOUT_CATEGORIES}
					value={formData.tipoTreino}
					onChange={handleChange('tipoTreino')}
				/>

				<div className='flex space-x-4 pt-4'>
					<Button type='button' variant='secondary' onClick={onCancel} className='flex-1'>
						Cancelar
					</Button>
					<Button type='submit' disabled={loading} className='flex-1'>
						{loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Salvar'}
					</Button>
				</div>
			</form>
		</div>
	);
}

export default NewPostForm;
