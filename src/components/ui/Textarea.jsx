import { useId } from 'react';

function Textarea({ id, label, placeholder, value, onChange, rows = 4, error, ...props }) {
  const generatedId = useId()
  const textareaId = id ?? generatedId
  const errorId = `${textareaId}-error`

  return (
    <div>
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-brand-gray-medium mb-2">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green-lime focus:border-transparent text-sm resize-vertical"
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

export default Textarea
