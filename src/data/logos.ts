// Los 17 negocios de la cinta del sitio anterior (index.html:4178 en master 86db428),
// en el mismo orden. Tres no son gastronomicos: decision del dueño de dejarlos.
export type Logo = { file: string; nombre: string; rubro: string };

export const logos: Logo[] = [
  { file: 'sao.jpg', nombre: 'Panadería Centro SAO', rubro: 'Panadería' },
  { file: 'cortez.jpg', nombre: 'Cortez', rubro: 'Restaurant' },
  { file: 'byehenry.jpg', nombre: 'Bye Henry', rubro: 'Cervecería' },
  { file: 'waffle.jpg', nombre: 'El Almacén del Waffle', rubro: 'Wafflería' },
  { file: 'hvplatense.jpg', nombre: 'Hospital Veterinario Platense', rubro: 'Veterinaria' },
  { file: 'dulcejazmin.jpg', nombre: 'Dulce Jazmín', rubro: 'Pastelería' },
  { file: 'cenal.jpg', nombre: 'Café Ceñal', rubro: 'Cafetería' },
  { file: 'soberana.jpg', nombre: 'Soberana', rubro: 'Restaurant' },
  { file: 'arroyon.jpg', nombre: 'Puerto Arroyón', rubro: 'Parrilla' },
  { file: 'kaneman.jpg', nombre: 'Kaneman', rubro: 'Escuela canina' },
  { file: 'livana.jpg', nombre: 'Livana', rubro: 'Resto bar' },
  { file: 'mollica.jpg', nombre: 'Mollica', rubro: 'Confitería y restaurant' },
  { file: 'burgerclub.jpg', nombre: 'Burger Club', rubro: 'Hamburguesería' },
  { file: 'giorello.jpg', nombre: 'Natalia Giorello', rubro: 'Pastelería' },
  { file: 'mezzogiorno.jpg', nombre: 'Il Mezzogiorno', rubro: 'Restaurant' },
  { file: 'fghair.jpg', nombre: 'FG Hair Concept', rubro: 'Peluquería' },
  { file: 'universocookies.jpg', nombre: 'Universo Cookies', rubro: 'Cookies' },
];

// Los cuatro avatares de la prueba social del hero (mismo orden que el sitio anterior).
export const avataresHero = ['cortez.jpg', 'byehenry.jpg', 'sao.jpg', 'mollica.jpg'];
