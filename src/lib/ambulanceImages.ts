/** Real ambulance images served from /public/ambulances */
export const AMBULANCE_REAL_IMAGES = {
  basicVijayawada: '/ambulances/basic-vijayawada.jpg',
  icuVijayawada: '/ambulances/icu-vijayawada.jpg',
  basicVizag: '/ambulances/basic-vizag.jpg',
  icuGuntur: '/ambulances/icu-guntur.jpg',
  basicSide: '/ambulances/basic-side.jpg',
  basicInterior: '/ambulances/basic-interior.jpg',
  icuSide: '/ambulances/icu-side.jpg',
  icuInterior: '/ambulances/icu-interior.jpg',
  stockholm: '/ambulances/stockholm_ambulance.jpg',
  clevelandEms: '/ambulances/cleveland_ems.jpg',
  emergencyNight: '/ambulances/emergency-night.jpg',
  amrAmbulance: '/ambulances/amr-ambulance.jpg',
} as const;

export const AMBULANCE_TEST_IMAGES = AMBULANCE_REAL_IMAGES;

const DEFAULT_GALLERY = [
  AMBULANCE_REAL_IMAGES.basicVijayawada,
  AMBULANCE_REAL_IMAGES.basicSide,
  AMBULANCE_REAL_IMAGES.basicInterior,
  AMBULANCE_REAL_IMAGES.icuInterior,
];

const GALLERY_BY_NAME: Record<string, string[]> = {
  'Sai Ambulance Service': [
    AMBULANCE_REAL_IMAGES.basicVijayawada,
    AMBULANCE_REAL_IMAGES.basicSide,
    AMBULANCE_REAL_IMAGES.basicInterior,
  ],
  'Life Ambulance': [
    AMBULANCE_REAL_IMAGES.icuVijayawada,
    AMBULANCE_REAL_IMAGES.icuInterior,
    AMBULANCE_REAL_IMAGES.icuSide,
    AMBULANCE_REAL_IMAGES.amrAmbulance,
  ],
  'Sai Ambulance Service - Vizag': [
    AMBULANCE_REAL_IMAGES.basicVizag,
    AMBULANCE_REAL_IMAGES.basicSide,
    AMBULANCE_REAL_IMAGES.basicInterior,
  ],
  'Sanjeevani Ambulance Service': [
    AMBULANCE_REAL_IMAGES.icuGuntur,
    AMBULANCE_REAL_IMAGES.icuInterior,
    AMBULANCE_REAL_IMAGES.basicSide,
  ],
  'Care Private Ambulance': [
    AMBULANCE_REAL_IMAGES.amrAmbulance,
    AMBULANCE_REAL_IMAGES.basicInterior,
    AMBULANCE_REAL_IMAGES.basicSide,
  ],
  'Suraksha Ambulance Service': [
    AMBULANCE_REAL_IMAGES.stockholm,
    AMBULANCE_REAL_IMAGES.icuInterior,
    AMBULANCE_REAL_IMAGES.basicSide,
  ],
};

const COVER_BY_NAME: Record<string, string> = {
  'Sai Ambulance Service': AMBULANCE_REAL_IMAGES.basicVijayawada,
  'Life Ambulance': AMBULANCE_REAL_IMAGES.icuVijayawada,
  'Sai Ambulance Service - Vizag': AMBULANCE_REAL_IMAGES.basicVizag,
  'Sanjeevani Ambulance Service': AMBULANCE_REAL_IMAGES.icuGuntur,
  'Care Private Ambulance': AMBULANCE_REAL_IMAGES.amrAmbulance,
  'Suraksha Ambulance Service': AMBULANCE_REAL_IMAGES.stockholm,
};

function uniqueUrls(urls: string[]): string[] {
  return [...new Set(urls.filter(Boolean))];
}

/** Attach cover + swipeable gallery images for private ambulance mobile cards. */
export function withAmbulanceImage<T extends { name: string; type?: string; image_url: string | null }>(
  ambulance: T,
): T & { image_url: string | null; images: string[] } {
  const namedGallery = GALLERY_BY_NAME[ambulance.name];
  const cover =
    ambulance.image_url ||
    COVER_BY_NAME[ambulance.name] ||
    namedGallery?.[0] ||
    DEFAULT_GALLERY[0];

  const images = uniqueUrls([cover, ...(namedGallery ?? DEFAULT_GALLERY)]);

  return {
    ...ambulance,
    image_url: cover,
    images,
  };
}
