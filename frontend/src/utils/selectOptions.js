export const buildSelectOptions = (items = [], { placeholder = 'Seleccionar...', mapper }) => [
  { value: '', label: placeholder },
  ...items.map(item => mapper(item))
];
