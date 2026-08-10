/**
 * An image that always carries its intrinsic size and offers AVIF first.
 *
 * Every picture on this site needs the same four things: an AVIF a modern
 * browser can take and a PNG or JPEG for one that cannot, explicit width and
 * height so the layout cannot shift, an object-position so the crop does not
 * cut through a face, and a loading decision. Repeating that inline at a dozen
 * call sites is how one of them ends up missing its dimensions.
 *
 * Takes plain strings and a plain shape rather than importing the content
 * module, so this stays ignorant of what the site is about (ENGINEERING.md §3).
 *
 * `<picture>` carries `display: contents` from base.css, so it does not sit
 * between the `<img>` and its parent's layout.
 */
export function Photo({
  avif,
  fallback,
  image,
  className,
  /** The one image above the fold on each page opts out of lazy loading. */
  eager = false,
}: {
  readonly avif: string
  readonly fallback: string
  readonly image: {
    readonly alt: string
    readonly width: number
    readonly height: number
    readonly focus?: string
  }
  readonly className?: string
  readonly eager?: boolean
}) {
  return (
    <picture>
      <source srcSet={avif} type="image/avif" />
      <img
        className={className}
        src={fallback}
        alt={image.alt}
        width={image.width}
        height={image.height}
        loading={eager ? 'eager' : 'lazy'}
        decoding={eager ? 'sync' : 'async'}
        fetchPriority={eager ? 'high' : undefined}
        style={image.focus ? { objectPosition: image.focus } : undefined}
      />
    </picture>
  )
}
