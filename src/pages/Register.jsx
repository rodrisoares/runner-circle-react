import { Navigate } from 'react-router-dom'
import Background from '../components/layout/Background'
import SplitLayout from '../components/layout/SplitLayout'
import RegisterForm from '../components/forms/RegisterForm'
import RegisterImageSection from '../components/layout/RegisterImageSection'
import { useAuth } from '../hooks/useAuth'

function Register() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to='/feed' replace />
  }

  return (
    <Background>
      <SplitLayout leftContent={<RegisterForm />} rightContent={<RegisterImageSection />} />
    </Background>
  )
}

export default Register
