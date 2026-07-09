import { useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import Sidebar from '../components/layout/Sidebar'
import BottomNavigation from '../components/layout/BottomNavigation'
import EditProfileForm from '../components/forms/EditProfileForm'

function EditProfile() {
  const navigate = useNavigate()
  // Salvar ou cancelar volta ao perfil
  const goToProfile = () => navigate('/profile')

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="md:flex">
        <Sidebar />

        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
          <div className="max-w-4xl mx-auto">
            <EditProfileForm onSubmit={goToProfile} onCancel={goToProfile} />
          </div>
        </main>
      </div>

      <BottomNavigation />
    </div>
  )
}

export default EditProfile
