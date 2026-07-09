import { useEffect, useId, useRef, useState } from 'react';

function Dropdown({
	options = [],
	value,
	onChange,
	placeholder = 'Selecione uma opção',
	label,
	className = '',
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(-1);
	const buttonRef = useRef(null);
	const listboxId = useId();
	const labelId = useId();

	const selectedIndex = options.findIndex((option) => option.value === value);
	const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : null;

	// Ao abrir, o foco visual começa na opção já selecionada.
	useEffect(() => {
		if (isOpen) {
			setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
		}
	}, [isOpen, selectedIndex]);

	const close = ({ refocus = true } = {}) => {
		setIsOpen(false);
		setActiveIndex(-1);
		if (refocus) {
			buttonRef.current?.focus();
		}
	};

	const handleSelect = (option) => {
		onChange(option.value);
		close();
	};

	const handleKeyDown = (event) => {
		switch (event.key) {
			case 'Escape':
				if (isOpen) {
					event.preventDefault();
					close();
				}
				break;
			case 'ArrowDown':
				event.preventDefault();
				if (!isOpen) {
					setIsOpen(true);
				} else {
					setActiveIndex((current) => Math.min(current + 1, options.length - 1));
				}
				break;
			case 'ArrowUp':
				event.preventDefault();
				if (!isOpen) {
					setIsOpen(true);
				} else {
					setActiveIndex((current) => Math.max(current - 1, 0));
				}
				break;
			case 'Home':
				if (isOpen) {
					event.preventDefault();
					setActiveIndex(0);
				}
				break;
			case 'End':
				if (isOpen) {
					event.preventDefault();
					setActiveIndex(options.length - 1);
				}
				break;
			case 'Enter':
			case ' ':
				event.preventDefault();
				if (isOpen && activeIndex >= 0) {
					handleSelect(options[activeIndex]);
				} else {
					setIsOpen(true);
				}
				break;
			default:
				break;
		}
	};

	const activeOptionId = activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined;

	return (
		<div className={`relative ${className}`}>
			{label && (
				<span id={labelId} className='block text-sm font-medium text-brand-gray-medium mb-2'>
					{label}
				</span>
			)}

			<button
				ref={buttonRef}
				type='button'
				onClick={() => setIsOpen((open) => !open)}
				onKeyDown={handleKeyDown}
				aria-haspopup='listbox'
				aria-expanded={isOpen}
				aria-controls={isOpen ? listboxId : undefined}
				aria-activedescendant={activeOptionId}
				aria-labelledby={label ? labelId : undefined}
				aria-label={label ? undefined : placeholder}
				className='w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-green-lime focus:border-transparent transition-colors duration-200'
			>
				<div className='flex items-center justify-between'>
					<span>{selectedOption ? selectedOption.label : placeholder}</span>
					<svg
						className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'
						aria-hidden='true'
					>
						<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
					</svg>
				</div>
			</button>

			{isOpen && (
				<ul
					id={listboxId}
					role='listbox'
					aria-labelledby={label ? labelId : undefined}
					className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 overflow-hidden'
				>
					{options.map((option, index) => {
						const isSelected = value === option.value;
						const isActive = index === activeIndex;

						return (
							<li
								key={option.value}
								id={`${listboxId}-option-${index}`}
								role='option'
								aria-selected={isSelected}
								onClick={() => handleSelect(option)}
								onMouseEnter={() => setActiveIndex(index)}
								className={`cursor-pointer px-4 py-2 text-sm transition-colors duration-200 ${
									isSelected
										? 'bg-brand-green-lime text-brand-graphite font-medium'
										: 'text-gray-700'
								} ${isActive && !isSelected ? 'bg-gray-50' : ''}`}
							>
								{option.label}
							</li>
						);
					})}
				</ul>
			)}

			{/* Captura o clique fora para fechar. Não devolve o foco ao botão, senão
			    clicar em qualquer lugar da página roubaria o foco de volta. */}
			{isOpen && (
				<div
					className='fixed inset-0 z-0'
					aria-hidden='true'
					onClick={() => close({ refocus: false })}
				/>
			)}
		</div>
	);
}

export default Dropdown;
