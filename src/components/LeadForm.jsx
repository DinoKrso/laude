import { useState } from 'react'
import { CONFIG } from '../config'

const TYPES = ['Kafić', 'Restoran', 'Hotel / apartmani', 'Salon / barber', 'Drugo']
const live = Boolean(CONFIG.leadsUrl)

export default function LeadForm() {
  const [f, setF] = useState({ venue: '', type: TYPES[0], name: '', qty: '10', contact: '', msg: '' })
  const [honey, setHoney] = useState('')
  const [note, setNote] = useState(live ? 'Upit stiže nama. Javljamo se na kontakt koji ostavite.' : 'Ništa se ne šalje automatski. Poruku šaljete vi, jednim klikom.')
  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState('Kopiraj poruku')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const set = (k) => (e) => setF((prev) => ({ ...prev, [k]: e.target.value }))

  const draft = () => `Pozdrav, zanima me ${CONFIG.brand} stalak.\n\nLokal: ${f.venue} (${f.type})\nIme: ${f.name}\nKontakt: ${f.contact}\nBroj stalaka: ${f.qty || '-'}` + (f.msg.trim() ? `\nPoruka: ${f.msg.trim()}` : '')

  const submit = async (e) => {
    e.preventDefault()
    const missing = ['venue', 'name', 'contact'].find((k) => !f[k].trim())
    if (missing) {
      setNote('Popunite naziv lokala, ime i kontakt da bismo vam se mogli javiti.')
      document.getElementById(`f-${missing}`)?.focus()
      return
    }
    if (!live || honey) {
      if (honey) {
        setSent(true)
        return
      }
      setMessage(draft())
      setCopied('Kopiraj poruku')
      setNote(CONFIG.email ? `Pošaljite poruku na ${CONFIG.email} ili preko WhatsAppa.` : 'Kopirajte poruku i pošaljite je preko WhatsAppa ili e-maila.')
      return
    }
    setSending(true)
    setNote('Šaljem upit…')
    setMessage('')
    try {
      await fetch(CONFIG.leadsUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ ...f, company: honey }),
      })
      setF({ venue: '', type: TYPES[0], name: '', qty: '10', contact: '', msg: '' })
      setSent(true)
    } catch {
      setMessage(draft())
      setCopied('Kopiraj poruku')
      setNote('Slanje nije uspjelo. Kopirajte poruku i pošaljite je ručno.')
    } finally {
      setSending(false)
    }
  }
  const copy = () => navigator.clipboard.writeText(message).then(() => setCopied('Kopirano')).catch(() => setCopied('Označite tekst i kopirajte'))

  const line = (k, v) => (
    <div key={k}><span className="mono">{k}</span><span className={v ? '' : 'missing'}>{v || 'uskoro'}</span></div>
  )

  return (
    <section className="band" id="ponuda">
      <div className="wrap contact">
        <div className="side reveal">
          <p className="eyebrow">Ponuda</p>
          <h2>Recite nam za koji lokal.</h2>
          <p>{live ? 'Popunite formu i upit stiže direktno nama. Javljamo se s prijedlogom dizajna.' : 'Popunite formu i pripremićemo poruku s vašim podacima. Pošaljite je na WhatsApp ili e-mail i javljamo se s prijedlogom dizajna.'}</p>
          <div className="contact-lines">
            <div><span className="mono">E-mail</span><a href={`mailto:${CONFIG.email}`}>{CONFIG.email}</a></div>
            <div><span className="mono">Instagram</span><a href={CONFIG.instagram} target="_blank" rel="noopener noreferrer">@laude.bih</a></div>
            {line('Lokacija', CONFIG.city)}
          </div>
        </div>
        <form onSubmit={submit} noValidate className="reveal">
          <label className="hp" aria-hidden="true">Firma<input tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} /></label>
          {sent ? (
            <div className="sent" role="status">
              <p className="eyebrow">Poslano</p>
              <h3>Upit je stigao.</h3>
              <p>Javljamo se na kontakt koji ste ostavili, s prijedlogom dizajna.</p>
              <button className="btn btn-ghost" type="button" onClick={() => { setSent(false); setNote(live ? 'Upit stiže nama. Javljamo se na kontakt koji ostavite.' : 'Ništa se ne šalje automatski. Poruku šaljete vi, jednim klikom.') }}>Pošalji još jedan</button>
            </div>
          ) : (<>
          <div className="row">
            <label htmlFor="f-venue">Naziv lokala<input id="f-venue" value={f.venue} onChange={set('venue')} autoComplete="organization" placeholder="npr. Caffe Bašta" /></label>
            <label htmlFor="f-type">Vrsta objekta
              <select id="f-type" value={f.type} onChange={set('type')}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
            </label>
          </div>
          <div className="row">
            <label htmlFor="f-name">Vaše ime<input id="f-name" value={f.name} onChange={set('name')} autoComplete="name" placeholder="Ime i prezime" /></label>
            <label htmlFor="f-qty">Broj stalaka<input id="f-qty" type="number" min="1" inputMode="numeric" value={f.qty} onChange={set('qty')} /></label>
          </div>
          <label htmlFor="f-contact">Telefon ili e-mail<input id="f-contact" value={f.contact} onChange={set('contact')} autoComplete="tel" placeholder="+387 6x xxx xxx" /></label>
          <label htmlFor="f-msg">Poruka (opcionalno)<textarea id="f-msg" value={f.msg} onChange={set('msg')} placeholder="Boje, rok, gdje bi stalci stajali…" /></label>
          <button className="btn btn-gold" type="submit" disabled={sending}>{sending ? 'Šaljem…' : live ? 'Pošalji upit' : 'Pripremi poruku'}</button>
          <p className="form-note">{note}</p>
          </>)}
          {message && !sent && (
            <div className="result">
              <pre>{message}</pre>
              <div className="acts">
                <button className="btn btn-gold" type="button" onClick={copy}>{copied}</button>
                {CONFIG.whatsapp && (
                  <a className="btn btn-ghost" href={`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">Otvori WhatsApp</a>
                )}
              </div>
            </div>
          )}
        </form>
      </div>
    </section>
  )
}
