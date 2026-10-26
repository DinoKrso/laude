import { createRoot } from 'react-dom/client'
import '@fontsource/sora/300.css'
import '@fontsource/sora/400.css'
import '@fontsource/sora/600.css'
import '@fontsource/sora/700.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import './promo.css'
import Promo from './Promo'

createRoot(document.getElementById('root')).render(<Promo />)
