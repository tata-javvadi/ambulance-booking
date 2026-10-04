import type { AmbulanceType } from './types';

export const AMBULANCE_PHONE = '+919876543210';

export const AMBULANCES: AmbulanceType[] = [
  {
    id: 'basic',
    name: 'Basic Ambulance',
    baseFare: 300,
    perKm: 20,
    description: 'For non-emergency patient transport with essential first-aid support',
    features: ['Trained driver', 'First-aid kit', 'Oxygen cylinder', 'Stretcher'],
  },
  {
    id: 'icu',
    name: 'ICU Ambulance',
    baseFare: 500,
    perKm: 40,
    description: 'Advanced life support with critical care equipment for emergencies',
    features: ['Cardiac monitor', 'Ventilator', 'Defibrillator', 'Emergency medicines', 'Trained paramedic'],
  },
];
