/**
 * Form controls.
 *
 * The design system reimplements checkboxes and radios out of spans with a
 * transparent input stretched over the top. That reproduces the look and loses
 * the keyboard behaviour, the focus ring, and Windows high-contrast rendering.
 * Here the native control stays visible and is coloured with `accent-color`,
 * which gets the same result with none of the losses.
 *
 * Every control has a real `<label>` bound by `htmlFor` (ENGINEERING.md §5) and
 * a `name`, because a native POST sends nothing for an unnamed field.
 *
 * `disabled` is the same rule from the other end: a disabled control is left out
 * of the form data set, by a native POST and by `new FormData(form)` alike.
 * InvolvedForm uses it to keep a hidden branch's answers out of the campaign's
 * inbox. It renders as no attribute at all when false, so the prerendered markup
 * is unchanged for every field that never passes it — which the build gate in
 * scripts/prerender.mjs enforces, because a field that ships disabled can never
 * be filled in by a visitor with no JavaScript.
 *
 * There is deliberately no `:disabled` style. A caller may only pass `disabled`
 * for a control it has measured to be `display: none` (see InvolvedForm), so a
 * disabled control here is never on screen and has nothing to style.
 */

export function TextField({
  id,
  name,
  label,
  placeholder,
  type = 'text',
  required = false,
  disabled = false,
  autoComplete,
}: {
  readonly id: string
  readonly name: string
  readonly label: string
  readonly placeholder?: string
  readonly type?: 'text' | 'email'
  readonly required?: boolean
  readonly disabled?: boolean
  readonly autoComplete?: string
}) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <input
        className="field__control"
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
      />
    </div>
  )
}

export function TextAreaField({
  id,
  name,
  label,
  placeholder,
  hint,
  rows = 4,
  disabled = false,
}: {
  readonly id: string
  readonly name: string
  readonly label: string
  readonly placeholder?: string
  readonly hint?: string
  readonly rows?: number
  readonly disabled?: boolean
}) {
  const hintId = `${id}-hint`
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <textarea
        className="field__control"
        id={id}
        name={name}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        aria-describedby={hint ? hintId : undefined}
      />
      {hint ? (
        <span className="field__hint" id={hintId}>
          {hint}
        </span>
      ) : null}
    </div>
  )
}

export function SelectField({
  id,
  name,
  label,
  placeholder,
  options,
  disabled = false,
}: {
  readonly id: string
  readonly name: string
  readonly label: string
  readonly placeholder: string
  readonly options: readonly string[]
  readonly disabled?: boolean
}) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <select className="field__control" id={id} name={name} defaultValue="" disabled={disabled}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}

export function CheckboxField({
  id,
  name,
  label,
  defaultChecked = false,
  disabled = false,
}: {
  readonly id: string
  readonly name: string
  readonly label: string
  readonly defaultChecked?: boolean
  readonly disabled?: boolean
}) {
  return (
    <div>
      <label className="choice" htmlFor={id}>
        <input
          className="choice__input"
          id={id}
          name={name}
          type="checkbox"
          value="yes"
          defaultChecked={defaultChecked}
          disabled={disabled}
        />
        {label}
      </label>
    </div>
  )
}

export function RadioField({
  id,
  name,
  label,
  value,
  defaultChecked = false,
}: {
  readonly id: string
  readonly name: string
  readonly label: string
  readonly value: string
  /**
   * Uncontrolled on purpose — `defaultChecked` and no `checked`, and no event
   * handler either, so React never writes back to the DOM after hydration and
   * never marks the input for update. A radio clicked before the bundle arrives,
   * or restored by the browser across a reload without firing `change`, keeps
   * its state. A caller that needs to know the selection listens on the form and
   * reads the DOM; it must not own it.
   */
  readonly defaultChecked?: boolean
}) {
  return (
    <label className="choice" htmlFor={id}>
      <input
        className="choice__input"
        id={id}
        name={name}
        type="radio"
        value={value}
        defaultChecked={defaultChecked}
      />
      {label}
    </label>
  )
}
