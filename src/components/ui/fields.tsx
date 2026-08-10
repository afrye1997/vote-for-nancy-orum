import type { ChangeEventHandler } from 'react'

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
 * is unchanged for every field that never passes it.
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
  onChange,
}: {
  readonly id: string
  readonly name: string
  readonly label: string
  readonly value: string
  readonly defaultChecked?: boolean
  /**
   * Uncontrolled on purpose — `defaultChecked` and no `checked`, so React never
   * writes back to the DOM after hydration. A caller that needs to know the
   * selection observes it here and mirrors it; it must not own it.
   */
  readonly onChange?: ChangeEventHandler<HTMLInputElement>
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
        onChange={onChange}
      />
      {label}
    </label>
  )
}
