import { useEffect, useRef, useState } from 'react'

/**
 * Menampilkan `value` sebagai deretan ubin ala papan split-flap bandara/stasiun.
 * Setiap kali value berubah, ubin akan "flip" sekali (satu gerakan, bukan animasi berulang).
 */
export default function FlapRow({ value, className = '' }) {
  const chars = String(value ?? '—').split('')
  const [flipping, setFlipping] = useState(false)
  const prevValue = useRef(value)

  useEffect(() => {
    if (prevValue.current !== value) {
      prevValue.current = value
      setFlipping(true)
      const id = setTimeout(() => setFlipping(false), 420)
      return () => clearTimeout(id)
    }
  }, [value])

  return (
    <div className={`flap-row ${className}`}>
      {chars.map((c, i) => (
        <div key={i} className={`flap-tile${flipping ? ' is-flipping' : ''}`}>
          {c}
        </div>
      ))}
    </div>
  )
}
