// Exactly matches your backend Breed enum cases
export const BREEDS_BY_TYPE = {
  DOG: ['LABRADOR_RETRIEVER', 'GOLDEN_RETRIEVER', 'BEAGLE', 'HUSKY', 'BULLDOG', 'POODLE'],
  CAT: ['TABBY', 'SIAMESE', 'MAINE_COON', 'PERSIAN'],
  BIRD: ['COCKATIEL', 'PIGEON', 'PARROT']
};

// User-friendly display names
export const BREED_DISPLAY_NAMES = {
  LABRADOR_RETRIEVER: 'Labrador Retriever',
  GOLDEN_RETRIEVER: 'Golden Retriever',
  BEAGLE: 'Beagle',
  HUSKY: 'Husky',
  BULLDOG: 'Bulldog',
  POODLE: 'Poodle',
  TABBY: 'Tabby',
  SIAMESE: 'Siamese',
  MAINE_COON: 'Maine Coon',
  PERSIAN: 'Persian',
  COCKATIEL: 'Cockatiel',
  PIGEON: 'Pigeon',
  PARROT: 'Parrot'
};

// Helper to get display name
export const getBreedDisplayName = (breedEnum) => {
  return BREED_DISPLAY_NAMES[breedEnum] || breedEnum;
};

// Helper to get breeds for type
export const getBreedsForType = (animalType) => {
  return BREEDS_BY_TYPE[animalType] || [];
};
