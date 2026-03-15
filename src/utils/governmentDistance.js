const GOVERNMENT_COORDINATES = {
  cairo: { latitude: 30.0444, longitude: 31.2357 },
  alexandria: { latitude: 31.2001, longitude: 29.9187 },
  giza: { latitude: 30.0131, longitude: 31.2089 },
  qalyubia: { latitude: 30.3292, longitude: 31.2165 },
  dakahlia: { latitude: 31.0409, longitude: 31.3785 },
  sharqia: { latitude: 30.7326, longitude: 31.7195 },
  gharbia: { latitude: 30.8754, longitude: 31.0335 },
  monufia: { latitude: 30.5972, longitude: 30.9876 },
  menoufia: { latitude: 30.5972, longitude: 30.9876 },
  'المنوفية': { latitude: 30.5972, longitude: 30.9876 },
  beheira: { latitude: 30.8481, longitude: 30.3436 },
  'kafr el sheikh': { latitude: 31.1117, longitude: 30.9399 },
  'دمياط': { latitude: 31.4165, longitude: 31.8133 },
  damietta: { latitude: 31.4165, longitude: 31.8133 },
  'port said': { latitude: 31.2653, longitude: 32.3019 },
  'بورسعيد': { latitude: 31.2653, longitude: 32.3019 },
  ismailia: { latitude: 30.5965, longitude: 32.2715 },
  'الإسماعيلية': { latitude: 30.5965, longitude: 32.2715 },
  suez: { latitude: 29.9668, longitude: 32.5498 },
  'السويس': { latitude: 29.9668, longitude: 32.5498 },
  fayoum: { latitude: 29.3084, longitude: 30.8428 },
  'الفيوم': { latitude: 29.3084, longitude: 30.8428 },
  'بني سويف': { latitude: 29.0661, longitude: 31.0994 },
  'beni suef': { latitude: 29.0661, longitude: 31.0994 },
  'المنيا': { latitude: 28.0871, longitude: 30.7618 },
  minya: { latitude: 28.0871, longitude: 30.7618 },
  assiut: { latitude: 27.1809, longitude: 31.1837 },
  'أسيوط': { latitude: 27.1809, longitude: 31.1837 },
  sohag: { latitude: 26.5591, longitude: 31.6957 },
  'سوهاج': { latitude: 26.5591, longitude: 31.6957 },
  qena: { latitude: 26.1551, longitude: 32.716 },
  'قنا': { latitude: 26.1551, longitude: 32.716 },
  luxor: { latitude: 25.6872, longitude: 32.6396 },
  'الأقصر': { latitude: 25.6872, longitude: 32.6396 },
  aswan: { latitude: 24.0889, longitude: 32.8998 },
  'أسوان': { latitude: 24.0889, longitude: 32.8998 },
  'red sea': { latitude: 27.2579, longitude: 33.8116 },
  'البحر الأحمر': { latitude: 27.2579, longitude: 33.8116 },
  'new valley': { latitude: 25.4464, longitude: 30.5466 },
  'الوادي الجديد': { latitude: 25.4464, longitude: 30.5466 },
  matrouh: { latitude: 31.3543, longitude: 27.2373 },
  'مطروح': { latitude: 31.3543, longitude: 27.2373 },
  'north sinai': { latitude: 31.1325, longitude: 33.8033 },
  'شمال سيناء': { latitude: 31.1325, longitude: 33.8033 },
  'south sinai': { latitude: 28.236, longitude: 33.625 },
  'جنوب سيناء': { latitude: 28.236, longitude: 33.625 },
};

function normalizeGovernmentName(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');
}

export function getGovernmentCoordinates(name) {
  const normalizedName = normalizeGovernmentName(name);

  if (!normalizedName) {
    return null;
  }

  return GOVERNMENT_COORDINATES[normalizedName] || null;
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

export function calculateGovernmentDistanceKm(originGovernment, destinationGovernment) {
  if (!originGovernment || !destinationGovernment) {
    return null;
  }

  const origin = getGovernmentCoordinates(originGovernment);
  const destination = getGovernmentCoordinates(destinationGovernment);

  if (!origin || !destination) {
    return null;
  }

  const earthRadiusKm = 6371;
  const deltaLatitude = toRadians(destination.latitude - origin.latitude);
  const deltaLongitude = toRadians(destination.longitude - origin.longitude);
  const a =
    Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2) +
    Math.cos(toRadians(origin.latitude)) *
      Math.cos(toRadians(destination.latitude)) *
      Math.sin(deltaLongitude / 2) *
      Math.sin(deltaLongitude / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Number((earthRadiusKm * c).toFixed(1));
}

export function getNearestGovernmentDistanceKm(originGovernment, destinationGovernments = []) {
  const distances = destinationGovernments
    .map((governmentName) => calculateGovernmentDistanceKm(originGovernment, governmentName))
    .filter((distance) => distance !== null);

  if (distances.length === 0) {
    return null;
  }

  return Math.min(...distances);
}
