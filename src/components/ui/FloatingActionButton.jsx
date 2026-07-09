import AddIcon from '@mui/icons-material/Add'
import Tooltip from '@mui/material/Tooltip'

// O Tooltip do MUI, e não o atributo `title` nativo: além do hover do mouse, ele abre
// no foco por teclado, que é como quem navega com Tab chega neste botão.
function FloatingActionButton({ onClick, label = 'Nova postagem' }) {
  return (
    <Tooltip title={label} placement="left" arrow enterDelay={300}>
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className="fixed bottom-24 md:bottom-6 right-6 w-14 h-14 bg-brand-green-lime text-brand-graphite rounded-full shadow-lg hover:shadow-xl hover:bg-brand-green-medium transition-all duration-200 flex items-center justify-center z-50"
      >
        <AddIcon className="w-6 h-6" />
      </button>
    </Tooltip>
  )
}

export default FloatingActionButton
