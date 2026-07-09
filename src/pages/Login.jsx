import { Navigate } from 'react-router-dom'
import Background from '../components/layout/Background'
import SplitLayout from '../components/layout/SplitLayout'
import LoginForm from '../components/forms/LoginForm'
import ImageSection from '../components/layout/ImageSection'
import { useAuth } from '../hooks/useAuth'

function Login() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to='/feed' replace />
  }

  return (
    <Background>
      <SplitLayout leftContent={<LoginForm />} rightContent={<ImageSection />} />
    </Background>
  )
}

export default Login
