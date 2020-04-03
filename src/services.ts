
export type AgeVal = '1' | '2' | '3' | '4' | '5' | '6';
export type GenderVal = 'female' | 'male' | 'other';
export type EthnicityVal =
  'English/Welsh/Scottish/Northern Irish/British' |
  'Irish' |
  'Gypsy or Irish Traveller' |
  'White and Black Caribbean' |
  'White and Black African' |
  'White and Asian' |
  'Indian' |
  'Pakistani' |
  'Bangladeshi' |
  'Chinese' |
  'African' |
  'Caribbean' |
  'Arab' |
  'other';
  
export type NonNativeVal = '1' | '2' | '3' | '4';

export type Filters = {
  [filter: string]: string[],
  age: AgeVal[],
  gender: GenderVal[],
  ethnicity: EthnicityVal[],
  nonNative: NonNativeVal[]
}

const AGE: { [k in AgeVal]: string } = {
  '1': '11 - 17',
  '2': '18 - 25',
  '3': '26 - 45',
  '4': '46 - 65',
  '5': '66 - 75',
  '6': '75+'
};

const NON_NATIVE: { [k in NonNativeVal]: string } = {
  '1': 'Less than two years',
  '2': '3-5 years',
  '3': '6-10 years',
  '4': '10+ years'
}

const GENDER: GenderVal[] = [ 'female', 'male', 'other' ];

const ETHNICITY: EthnicityVal[] = [
  'English/Welsh/Scottish/Northern Irish/British',
  'Irish',
  'Gypsy or Irish Traveller',
  'White and Black Caribbean',
  'White and Black African',
  'White and Asian',
  'Indian',
  'Pakistani',
  'Bangladeshi',
  'Chinese',
  'African',
  'Caribbean',
  'Arab',
  'other'
];

const FILTER: Filters = {
  age: [ '1', '2', '3', '4', '5', '6' ],
  gender: [ ...GENDER ],
  ethnicity: [ ...ETHNICITY ],
  nonNative: ['1', '2', '3', '4']
}

const CLEAN_FILTER: Filters = {
  age: [],
  gender: [],
  ethnicity: [],
  nonNative: []
};

export default {
  AGE,
  NON_NATIVE,
  GENDER,
  ETHNICITY,
  FILTER,
  CLEAN_FILTER
};