/** Local test images served from /public/ambulances */
export const AMBULANCE_TEST_IMAGES = {
  basicVijayawada: '/ambulances/basic-vijayawada.svg',
  icuVijayawada: '/ambulances/icu-vijayawada.svg',
  basicVizag: '/ambulances/basic-vizag.svg',
  icuGuntur: '/ambulances/icu-guntur.svg',
} as const;

const IMAGE_BY_NAME: Record<string, string> = {
  'Basic Ambulance - Vijayawada': AMBULANCE_TEST_IMAGES.basicVijayawada,
  'ICU Ambulance - Vijayawada': AMBULANCE_TEST_IMAGES.icuVijayawada,
  'Basic Ambulance - Visakhapatnam': AMBULANCE_TEST_IMAGES.basicVizag,
  'ICU Ambulance - Guntur': AMBULANCE_TEST_IMAGES.icuGuntur,
};

/** Fill missing image_url from local test assets so results always show a photo. */
export function withAmbulanceImage<T extends { name: string; type: string; image_url: string | null }>(
  ambulance: T,
): T {
  if (ambulance.image_url) return ambulance;

  const byName = IMAGE_BY_NAME[ambulance.name];
  if (byName) return { ...ambulance, image_url: byName };

  return {
    ...ambulance,
    image_url:
      ambulance.type === 'icu'
        ? AMBULANCE_TEST_IMAGES.icuVijayawada
        : AMBULANCE_TEST_IMAGES.basicVijayawada,
  };
}
