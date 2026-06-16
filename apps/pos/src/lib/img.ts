// Imagen del producto: usa la foto propia si existe, si no una por palabra clave.
const MAP: [string, string][] = [
  ['latte', '/img/latte.jpg'],
  ['espresso', '/img/espresso.jpg'],
  ['capuccin', '/img/cappuccino.jpg'],
  ['cappuccin', '/img/cappuccino.jpg'],
  ['combo', '/img/combo.jpg'],
  ['dúo', '/img/combo.jpg'],
  ['duo', '/img/combo.jpg'],
];

export function productImage(nombre: string, imagen?: string | null): string {
  if (imagen) return imagen;
  const n = nombre.toLowerCase();
  for (const [k, src] of MAP) if (n.includes(k)) return src;
  return '/img/default.jpg';
}
