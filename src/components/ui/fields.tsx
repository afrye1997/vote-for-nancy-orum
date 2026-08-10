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
 * ⚠ NONE OF THESE TAKES A `disabled` PROP, and adding one back needs a better
 * reason than "the field is hidden". `disabled` is a RENDERED attribute, so it
 * describes whatever React last committed, while a submission is whatever the
 * DOM says at the moment of submit. When a control is disabled to keep it out of
 * a payload, those two disagree on the very first render that has not landed
 * yet, and `new FormData(form)` silently drops a field the visitor filled in.
 * InvolvedForm hit exactly that and now filters its payload at submit instead;
 * the reasoning is at the top of that file. The build gate in
 * scripts/prerender.mjs backs it up: no ` disabled=""` may reach the prerendered
 * HTML, because a field that ships disabled can never be filled in at all by a
 * visitor with no JavaScript.
 *
 * A genuinely permanent disabled control — one that is disabled because it does
 * not work, not because it is hidden — is a different thing and would be
 * welcome. It would need a `:disabled` style, which does not exist yet, and a
 * contrast pair in scripts/contrast.mjs.
 */

export function TextField({
  id,
  name,
  label,
  placeholder,
  type = 'text',
  required = false,
  autoComplete,
}: {
  readonly id: string
  readonly name: string
  readonly label: string
  readonly placeholder?: string
  readonly type?: 'text' | 'email'
  readonly required?: boolean
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
}: {
  readonly id: string
  readonly name: string
  readonly label: string
  readonly placeholder?: string
  readonly hint?: string
  readonly rows?: number
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
}: {
  readonly id: string
  readonly name: string
  readonly label: string
  readonly placeholder: string
  readonly options: readonly string[]
}) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <select className="field__control" id={id} name={name} defaultValue="">
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
}: {
  readonly id: string
  readonly name: string
  readonly label: string
  readonly defaultChecked?: boolean
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
