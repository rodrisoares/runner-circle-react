import { useId } from 'react';

function Checkbox({ id, label, checked, onChange, ...props }) {
  const generatedId = useId()
  const checkboxId = id ?? generatedId

  return (
    <div className="flex items-center">
      <input
        id={checkboxId}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 text-brand-green-lime bg-gray-100 border-gray-300 rounded focus:ring-brand-green-lime focus:ring-2"
        {...props}
      />
      <label htmlFor={checkboxId} className="ml-2 text-sm text-brand-gray-medium">
        {label}
      </label>
    </div>
  )
}

export default Checkbox
