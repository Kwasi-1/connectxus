import logoWhite from '@/assets/connect_small_logo_white.png'
import logoblack from '@/assets/connect_small_logo.png'
import { useTheme } from '@/lib/theme'

function Logo({className}) {
  const { theme } = useTheme()
  return (
    <div>
      <img src={theme === 'dark' ? logoWhite : logoblack} alt="Logo" className={className} />
    </div>
  )
}
export default Logo