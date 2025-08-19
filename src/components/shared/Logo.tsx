import logoWhite from '@/assets/connect_small_logo_white.png'
import logoblack from '@/assets/connect_small_logo.png'
import { useTheme } from '@/lib/theme'
import { Link } from 'react-router-dom'

function Logo({className}) {
  const { theme } = useTheme()
  return (
    <div>
      <Link to="/">
        <img src={theme === 'dark' ? logoWhite : logoblack} alt="Logo" className={className} />
      </Link>
    </div>
  )
}
export default Logo