import { CONFIG } from '../config'
import { VENUES, STEPS } from '../content'
import { VenueIcon } from './Icons'

export function Nav() {
  return (
    <header className="nav">
      <div className="nav-in">
        <a className="brand" href="#top" aria-label={`${CONFIG.brand} početak`}><img src={`${import.meta.env.BASE_URL}brand/laude-logo-web.png`} alt={CONFIG.brand} width="92" height="26" /></a>
        <nav className="nav-links" aria-label="Sekcije">
          <a href="#za-koga">Za koga</a><a href="#kako">Kako radi</a><a href="#ponuda">Ponuda</a>
        </nav>
        <a className="btn btn-gold" href="#ponuda">Zatraži ponudu</a>
      </div>
    </header>
  )
}

function Head({ eyebrow, title, text }) {
  return (
    <div className="sec-head reveal">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {text && <p className="sec-text">{text}</p>}
    </div>
  )
}

export function Venues() {
  return (
    <section className="band" id="za-koga">
      <div className="wrap">
        <Head eyebrow="Za koga je" title="Svuda gdje gost sjedi duže od dvije minute." text="Recenziju najlakše dobijete dok je iskustvo još svježe. Stalak stoji tamo gdje gost već gleda." />
        <div className="venues">
          {VENUES.map((v) => (
            <div className="venue reveal" key={v.title}>
              <VenueIcon name={v.icon} />
              <h3>{v.title}</h3>
              <p>{v.text}</p>
              <p className="mono">{v.where}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Steps() {
  return (
    <section className="band" id="kako">
      <div className="wrap">
        <Head eyebrow="Kako radi" title="Od loga do stalka na stolu." />
        <div className="steps">
          {STEPS.map((s) => <div className="step reveal" key={s.title}><h3>{s.title}</h3><p>{s.text}</p></div>)}
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer>
      <div className="wrap"><span>{CONFIG.brand} © {new Date().getFullYear()}</span></div>
    </footer>
  )
}
