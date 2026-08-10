import { useState } from 'react'
import { BALLOT } from '../../content/involved'
import { voterLookupUrl } from '../../services/wardCheck'

/**
 * The address pill from the mockup.
 *
 * Same shape, same green Check button — but it hands off to Arkansas VoterView
 * rather than answering inline. `services/wardCheck.ts` sets out why the state's
 * endpoint cannot be called from a browser: no CORS headers, an anti-CSRF token
 * bound to their own session cookie, an HTML response rather than JSON, and no
 * server on our side to proxy through.
 *
 * A `<form>`, so Enter submits and the button is a real submit control. It
 * opens in a new tab so nobody loses the campaign page mid-task.
 *
 * The typed address is deliberately not sent anywhere. VoterView needs its own
 * autocomplete to capture a StreetKey, so there is no parameter we could pass
 * that would survive — and not transmitting it is what makes the note under the
 * field true.
 */
export function WardLookup() {
  const [address, setAddress] = useState('')

  return (
    <>
      <label className="ward-lookup__label" htmlFor="ward-address">
        {BALLOT.label}
      </label>
      <form
        className="ward-lookup"
        onSubmit={(event) => {
          event.preventDefault()
          window.open(voterLookupUrl(), '_blank', 'noopener,noreferrer')
        }}
      >
        <svg
          className="ward-lookup__icon"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <input
          className="ward-lookup__input"
          id="ward-address"
          name="address"
          type="text"
          autoComplete="street-address"
          placeholder={BALLOT.placeholder}
          value={address}
          onChange={(event) => setAddress(event.target.value)}
        />
        <button className="ward-lookup__submit" type="submit">
          {BALLOT.buttonLabel}
        </button>
      </form>
      <p className="note" style={{ marginTop: 10 }}>
        {BALLOT.privacy}
      </p>
    </>
  )
}
