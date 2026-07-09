import { useId } from 'react';

function Input({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  error,
  ...props
}) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-brand-gray-medium mb-2">
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green-lime focus:border-transparent text-sm"
        {...props}
      />
      {error && (
        <p id={errorId} className="text-red-500 text-xs mt-1">
          {error}
        </p>
      )}
    </div>
  )
}

export default Input
