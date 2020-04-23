
export type AgeVal = '1' | '2' | '3' | '4' | '5' | '6';
export type GenderVal = 'female' | 'male' | 'other';

export type NonNativeVal = '1' | '2' | '3' | '4';
export type FilterVal = 'age' | 'gender' | 'nonNative';

export type Filters = {
  [filter in FilterVal]?: string[];
} & {
  age?: AgeVal[];
  gender?: GenderVal[];
  nonNative?: NonNativeVal[];
};

export type FilterStatus = Record<FilterVal, boolean>

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

const FILTER_KEYS: FilterVal[] = [
  'age',
  'gender',
  'nonNative'
];

const FILTER: Filters = {
  age: [ '1', '2', '3', '4', '5', '6' ],
  gender: [ ...GENDER ],
  nonNative: ['1', '2', '3', '4']
}

const CLEAN_FILTER: Filters = {
  age: [],
  gender: [],
  nonNative: []
};

export default {
  AGE,
  NON_NATIVE,
  GENDER,
  FILTER,
  CLEAN_FILTER,
  FILTER_KEYS
};