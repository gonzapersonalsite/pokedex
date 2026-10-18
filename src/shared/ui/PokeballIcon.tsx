/**
 * Pokéball estática (mismo estilo que el loader: roja/blanca, línea y botón central).
 * Sin animación. Tamaño configurable para header, favicon, etc.
 */
export function PokeballIcon({ size = 40, className = '' }: { size?: number; className?: string }) {
  const border = Math.max(2, Math.round(size * 0.06))
  const lineHeight = Math.max(4, Math.round(size * 0.2))
  const buttonSize = Math.round(size * 0.32)
  const buttonBorder = Math.max(1, Math.round(size * 0.05))
  const dotSize = Math.round(size * 0.14)

  return (
    <div className={`relative flex-shrink-0 ${className}`} style={{ width: size, height: size }} aria-hidden>
      {/* Círculo: borde negro + mitad roja arriba, mitad blanca abajo */}
      <div
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{
          border: `${border}px solid #1d1d1b`,
          zIndex: 0,
        }}
      >
        <div className="absolute top-0 left-0 right-0 bg-[#dd2120]" style={{ height: '50%' }} />
        <div className="absolute bottom-0 left-0 right-0 bg-white" style={{ height: '50%' }} />
      </div>
      {/* Línea central horizontal */}
      <div
        className="absolute left-0 right-0 bg-[#1d1d1b]"
        style={{
          top: '50%',
          marginTop: -lineHeight / 2,
          height: lineHeight,
          zIndex: 1,
        }}
      />
      {/* Botón central: anillo blanco con borde negro */}
      <div
        className="absolute left-1/2 top-1/2 rounded-full bg-white -translate-x-1/2 -translate-y-1/2"
        style={{
          width: buttonSize,
          height: buttonSize,
          border: `${buttonBorder}px solid #1d1d1b`,
          zIndex: 2,
        }}
      />
      {/* Punto negro central */}
      <div
        className="absolute left-1/2 top-1/2 rounded-full bg-[#1d1d1b] -translate-x-1/2 -translate-y-1/2"
        style={{
          width: dotSize,
          height: dotSize,
          zIndex: 3,
        }}
      />
    </div>
  )
}
