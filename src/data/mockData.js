// Mock Data para MiMedicina

export const mockUsers = [
  {
    id: '1',
    email: 'lucianoba77@hotmail.com',
    password: 'lucianoba77',
    nombre: 'lucianoba77',
    role: 'paciente',
    tipoSuscripcion: 'gratis',
    esPremium: false
  },
  {
    id: '2',
    email: 'asistente@email.com',
    password: 'asistente123',
    nombre: 'Asistente',
    role: 'asistente',
    tipoSuscripcion: 'premium',
    esPremium: true
  }
];

export const mockMedicamentos = [
  {
    id: '1',
    nombre: 'Paracetamol',
    presentacion: 'comprimidos',
    tomasDiarias: 1,
    primeraToma: '08:00',
    afeccion: 'Dolor de cabeza',
    stockInicial: 30,
    stockActual: 30,
    color: '#FFB6C1', // Light pink
    diasTratamiento: 1,
    esCronico: false,
    alarmasActivas: true,
    detalles: '',
    tomasRealizadas: [] // Array de objetos { fecha, hora, tomada: boolean }
  },
  {
    id: '2',
    nombre: 'Pantoprazol',
    presentacion: 'comprimidos',
    tomasDiarias: 2,
    primeraToma: '14:00',
    afeccion: 'Acidez',
    stockInicial: 10,
    stockActual: 10,
    color: '#ADD8E6', // Light blue
    diasTratamiento: 15,
    esCronico: false,
    alarmasActivas: true,
    detalles: '',
    tomasRealizadas: []
  },
  {
    id: '3',
    nombre: 'Sertal compuesto',
    presentacion: 'inyeccion',
    tomasDiarias: 1,
    primeraToma: '17:00',
    afeccion: 'Dolor de Estómago',
    stockInicial: 30,
    stockActual: 30,
    color: '#FFFACD', // Light yellow
    diasTratamiento: 30,
    esCronico: false,
    alarmasActivas: true,
    detalles: '',
    tomasRealizadas: []
  }
];

// Colores disponibles para medicamentos
export const coloresMedicamento = [
  { nombre: 'Blanco', valor: '#FFFFFF' },
  { nombre: 'Rosa claro', valor: '#FFB6C1' },
  { nombre: 'Azul claro', valor: '#ADD8E6' },
  { nombre: 'Beige', valor: '#F5F5DC' },
  { nombre: 'Violeta claro', valor: '#E6E6FA' },
  { nombre: 'Verde claro', valor: '#90EE90' },
  { nombre: 'Amarillo', valor: '#FFFF00' },
  { nombre: 'Naranja', valor: '#FFA500' },
  { nombre: 'Púrpura', valor: '#800080' },
  { nombre: 'Azul brillante', valor: '#00BFFF' },
  { nombre: 'Verde brillante', valor: '#00FF00' },
  { nombre: 'Rojo', valor: '#FF0000' }
];

