/** Real ambulance images served from /public/ambulances */
export const AMBULANCE_REAL_IMAGES = {
  basicVijayawada: '/ambulances/basic-vijayawada.jpg', // Real Indian 108 emergency ambulance
  icuVijayawada: '/ambulances/icu-vijayawada.jpg',     // Real Mobile Intensive Care Unit (MICU)
  basicVizag: '/ambulances/basic-vizag.jpg',           // Real AIIMS hospital emergency ambulance
  icuGuntur: '/ambulances/icu-guntur.jpg',             // Real Intensive Care Unit emergency ambulance
  basicSide: '/ambulances/basic-side.jpg',             // Real Tempo Trax emergency vehicle
  basicInterior: '/ambulances/basic-interior.jpg',     // Real ambulance medical equipment & patient bay
  icuSide: '/ambulances/icu-side.jpg',                 // Real Paramedic rescue emergency ambulance
  icuInterior: '/ambulances/icu-interior.jpg',         // Real Advanced Life Support medical equipment
  stockholm: '/ambulances/stockholm_ambulance.jpg',    // Real high-speed emergency response vehicle
  clevelandEms: '/ambulances/cleveland_ems.jpg',       // Real heavy EMS rescue vehicle
  emergencyNight: '/ambulances/emergency-night.jpg',   // Real emergency ambulance with siren lights
  amrAmbulance: '/ambulances/amr-ambulance.jpg',       // Real medical response ambulance
} as const;

export const AMBULANCE_TEST_IMAGES = AMBULANCE_REAL_IMAGES;

const BASIC_GALLERY = [
  AMBULANCE_REAL_IMAGES.basicVijayawada,
  AMBULANCE_REAL_IMAGES.basicSide,
  AMBULANCE_REAL_IMAGES.basicInterior,
  AMBULANCE_REAL_IMAGES.basicVizag,
  AMBULANCE_REAL_IMAGES.emergencyNight,
];

const ICU_GALLERY = [
  AMBULANCE_REAL_IMAGES.icuVijayawada,
  AMBULANCE_REAL_IMAGES.icuGuntur,
  AMBULANCE_REAL_IMAGES.icuInterior,
  AMBULANCE_REAL_IMAGES.icuSide,
  AMBULANCE_REAL_IMAGES.clevelandEms,
];

const GALLERY_BY_NAME: Record<string, string[]> = {
  'Basic Ambulance - Vijayawada': [
    AMBULANCE_REAL_IMAGES.basicVijayawada,
    AMBULANCE_REAL_IMAGES.basicSide,
    AMBULANCE_REAL_IMAGES.basicInterior,
    AMBULANCE_REAL_IMAGES.emergencyNight,
  ],
  'ICU Ambulance - Vijayawada': [
    AMBULANCE_REAL_IMAGES.icuVijayawada,
    AMBULANCE_REAL_IMAGES.icuInterior,
    AMBULANCE_REAL_IMAGES.icuSide,
    AMBULANCE_REAL_IMAGES.stockholm,
  ],
  'Basic Ambulance - Visakhapatnam': [
    AMBULANCE_REAL_IMAGES.basicVizag,
    AMBULANCE_REAL_IMAGES.basicSide,
    AMBULANCE_REAL_IMAGES.basicInterior,
    AMBULANCE_REAL_IMAGES.amrAmbulance,
  ],
  'ICU Ambulance - Guntur': [
    AMBULANCE_REAL_IMAGES.icuGuntur,
    AMBULANCE_REAL_IMAGES.icuInterior,
    AMBULANCE_REAL_IMAGES.icuSide,
    AMBULANCE_REAL_IMAGES.clevelandEms,
  ],
};

const COVER_BY_NAME: Record<string, string> = {
  'Basic Ambulance - Vijayawada': AMBULANCE_REAL_IMAGES.basicVijayawada,
  'ICU Ambulance - Vijayawada': AMBULANCE_REAL_IMAGES.icuVijayawada,
  'Basic Ambulance - Visakhapatnam': AMBULANCE_REAL_IMAGES.basicVizag,
  'ICU Ambulance - Guntur': AMBULANCE_REAL_IMAGES.icuGuntur,
};

function uniqueUrls(urls: string[]): string[] {
  return [...new Set(urls.filter(Boolean))];
}

/** Attach cover + swipeable gallery images (test data) for mobile cards. */
export function withAmbulanceImage<T extends { name: string; type: string; image_url: string | null }>(
  ambulance: T,
): T & { image_url: string | null; images: string[] } {
  const namedGallery = GALLERY_BY_NAME[ambulance.name];
  const typeGallery = ambulance.type === 'icu' ? ICU_GALLERY : BASIC_GALLERY;
  const cover =
    ambulance.image_url ||
    COVER_BY_NAME[ambulance.name] ||
    typeGallery[0];

  const images = uniqueUrls([cover, ...(namedGallery ?? typeGallery)]);

  return {
    ...ambulance,
    image_url: cover,
    images,
  };
}
