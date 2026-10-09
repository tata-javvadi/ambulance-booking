/** Local test images served from /public/ambulances */
export const AMBULANCE_TEST_IMAGES = {
  basicVijayawada: '/ambulances/basic-vijayawada.svg',
  icuVijayawada: '/ambulances/icu-vijayawada.svg',
  basicVizag: '/ambulances/basic-vizag.svg',
  icuGuntur: '/ambulances/icu-guntur.svg',
  basicSide: '/ambulances/basic-side.svg',
  basicInterior: '/ambulances/basic-interior.svg',
  icuSide: '/ambulances/icu-side.svg',
  icuInterior: '/ambulances/icu-interior.svg',
} as const;

const BASIC_GALLERY = [
  AMBULANCE_TEST_IMAGES.basicVijayawada,
  AMBULANCE_TEST_IMAGES.basicSide,
  AMBULANCE_TEST_IMAGES.basicInterior,
  AMBULANCE_TEST_IMAGES.basicVizag,
];

const ICU_GALLERY = [
  AMBULANCE_TEST_IMAGES.icuVijayawada,
  AMBULANCE_TEST_IMAGES.icuSide,
  AMBULANCE_TEST_IMAGES.icuInterior,
  AMBULANCE_TEST_IMAGES.icuGuntur,
];

const GALLERY_BY_NAME: Record<string, string[]> = {
  'Basic Ambulance - Vijayawada': [
    AMBULANCE_TEST_IMAGES.basicVijayawada,
    AMBULANCE_TEST_IMAGES.basicSide,
    AMBULANCE_TEST_IMAGES.basicInterior,
  ],
  'ICU Ambulance - Vijayawada': [
    AMBULANCE_TEST_IMAGES.icuVijayawada,
    AMBULANCE_TEST_IMAGES.icuSide,
    AMBULANCE_TEST_IMAGES.icuInterior,
  ],
  'Basic Ambulance - Visakhapatnam': [
    AMBULANCE_TEST_IMAGES.basicVizag,
    AMBULANCE_TEST_IMAGES.basicSide,
    AMBULANCE_TEST_IMAGES.basicInterior,
  ],
  'ICU Ambulance - Guntur': [
    AMBULANCE_TEST_IMAGES.icuGuntur,
    AMBULANCE_TEST_IMAGES.icuSide,
    AMBULANCE_TEST_IMAGES.icuInterior,
  ],
};

const COVER_BY_NAME: Record<string, string> = {
  'Basic Ambulance - Vijayawada': AMBULANCE_TEST_IMAGES.basicVijayawada,
  'ICU Ambulance - Vijayawada': AMBULANCE_TEST_IMAGES.icuVijayawada,
  'Basic Ambulance - Visakhapatnam': AMBULANCE_TEST_IMAGES.basicVizag,
  'ICU Ambulance - Guntur': AMBULANCE_TEST_IMAGES.icuGuntur,
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
