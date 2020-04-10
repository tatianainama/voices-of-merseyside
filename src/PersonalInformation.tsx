import React, { useState } from 'react';
import { 
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  FormText,
  FormFeedback,
  Fade
} from 'reactstrap';

export type FormData = {
  age: string,
  gender: string,
  genderCustom: string,
  ethnicity: string,
  ethnicityCustom: string,
  birthPlace: string,
  currentPlace: string,
  nonNative: string
};

type FormDataKey = keyof FormData;

type PersonalInformationProps = {
  closeApp: () => void,
  saveData: (data: FormData) => void
};

type Validations = {
  [field in FormDataKey]: boolean;
};

const notEmpty = (value: string) => value !== '';

const notEmptyCustomResponse = (customValue: string, fixedResponse: string) => {
  if (fixedResponse === 'other') {
    return notEmpty(customValue)
  }
  return true;
};

const validateData = (values: FormData): Validations => ({
  age: notEmpty(values.age),
  gender: notEmpty(values.gender),
  genderCustom: notEmptyCustomResponse(values.genderCustom, values.gender),
  ethnicity: notEmpty(values.ethnicity),
  ethnicityCustom: notEmptyCustomResponse(values.ethnicityCustom, values.ethnicity),
  birthPlace: notEmpty(values.birthPlace),
  currentPlace: notEmpty(values.currentPlace),
  nonNative: true
});

const _initialValidation: Validations = {
  age: false,
  gender: false,
  genderCustom: false,
  ethnicity: false,
  ethnicityCustom: false,
  birthPlace: false,
  currentPlace: false,
  nonNative: false
}

const allValid = (validationResult: Validations): boolean => {
  return Object.entries(validationResult).every(([field, result]) => result);
};

export const PersonalInformation: React.FunctionComponent<PersonalInformationProps> = ({ closeApp, saveData }) => {
  const [ values, setValue ] = useState<FormData>({
    age: '',
    gender: '',
    genderCustom: '',
    ethnicity: '',
    ethnicityCustom: '',
    birthPlace: '',
    currentPlace: '',
    nonNative: '',
  });

  const [ submitted, submit ] = useState(false);
  const [ openModal, toggleModal ] = useState(false);
  const [ validationResult, saveValidation ] = useState<Validations>({..._initialValidation});
  
  const setInputValidation = (field: FormDataKey): undefined | { valid: true } | { invalid: true } => {
    if (!submitted) {
      return undefined;
    }
    if (validationResult[field]) {
      return { valid: true }
    } else {
      return { invalid: true }
    }
  }

  const handleSelect = (value: keyof FormData ) => (e: React.ChangeEvent<HTMLSelectElement|HTMLInputElement>) => {
    const newValues = {
      ...values,
      [value]: e.target.value
    };
    setValue(newValues);
    if (submitted) {
      saveValidation(validateData(newValues))
    }
  };

  return (
    <Fade tag="section" id="vom-personal-information">
      <h2>Personal Information</h2>
      <p>All fields are required</p>

      <Modal isOpen={openModal} onClosed={() => {
        setValue({
          ...values,
          age: '1'
        })
      }}>
        <ModalBody>
          I have permission from my parent(s)/guardian(s) to participate in this study
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => { toggleModal(false); closeApp() }}>No</Button>
          <Button color="primary" onClick={() => { toggleModal(false) }}>Yes</Button>
        </ModalFooter>
      </Modal>

      <Form>
        <FormGroup>
          <Label for="age-range">Age</Label>
          <Input type="select" id="age-range" value={values.age} onChange={e => {
            if (e.target.value === '1') {
              toggleModal(true);
            } else {
              handleSelect('age')(e);
            }
          }}
          required
          { ...setInputValidation('age') }
          >
            <option value="" disabled>Please choose</option>
            <option value="1">11 - 17</option>
            <option value="2">18 - 25</option>
            <option value="3">26 - 45</option>
            <option value="4">46 - 65</option>
            <option value="5">66 - 75</option>
            <option value="6">75+</option>
          </Input>
          <FormFeedback>Please, select an option</FormFeedback>
        </FormGroup>

        <FormGroup>
          <Label for="gender">Gender</Label>
          <Input type="select" id="gender" value={values.gender} onChange={handleSelect('gender')} required { ...setInputValidation('gender') }>
            <option value="" disabled>Please choose</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Neither, I identify as follows</option>
          </Input>
          <FormFeedback>Please, select an option</FormFeedback>
          {
            values.gender === 'other' && (
              <>
                <Input type="text" id="gender-custom" className="mt-2" value={values.genderCustom} onChange={handleSelect('genderCustom')} { ...setInputValidation('genderCustom') } required/>
                <FormFeedback>Please, fill up this input</FormFeedback>
              </>
            )
          }
        </FormGroup>

        <FormGroup>
          <Label for="ethnicity">
            Ethnicity
            <FormText color="muted">
              The following options are taken from the 2011 UK Census. You can also define yours selecting the 'None of the above' option.
            </FormText>
          </Label>
          <Input type="select" id="ethnicity" value={values.ethnicity} onChange={handleSelect('ethnicity')} { ...setInputValidation('ethnicity') } required>
            <option value="" disabled>Please choose</option>
            <optgroup label="White">
              <option value="English/Welsh/Scottish/Northern Irish/British">English/Welsh/Scottish/Northern Irish/British</option>
              <option value="Irish">Irish</option>
              <option value="Gypsy or Irish Traveller">Gypsy or Irish Traveller</option>
            </optgroup>
            <optgroup label="Mixed/multiple ethnic groups">
              <option value="White and Black Caribbean">White and Black Caribbean</option>
              <option value="White and Black African">White and Black African</option>
              <option value="White and Asian">White and Asian</option>
            </optgroup>
            <optgroup label="Asian/Asian British">
              <option value="Indian">Indian</option>
              <option value="Pakistani">Pakistani</option>
              <option value="Bangladeshi">Bangladeshi</option>
              <option value="Chinese">Chinese</option>
            </optgroup>
            <optgroup label="Black/African/Caribbean/Black British">
              <option value="African">African</option>
              <option value="Caribbean">Caribbean</option>
            </optgroup>
            <optgroup label="Other ethnic group">
              <option value="Arab">Arab</option>
              <option value="other">None of the above. I identify as follows:</option>
            </optgroup>
          </Input>
          <FormFeedback>Please, select an option</FormFeedback>
          {
            values.ethnicity === 'other' && (
              <>
                <Input type="text" id="ethnicity-custom" className="mt-2" required value={values.ethnicityCustom} onChange={handleSelect('ethnicityCustom')} { ...setInputValidation('ethnicityCustom') }/>
                <FormFeedback>Please, fill up this input</FormFeedback>
              </>
            )
          }
        </FormGroup>

        <FormGroup>
          <Label for="place-birth">Place of birth (Town/City and Country)</Label>
          <Input id="place-birth" type="text" required value={values.birthPlace} onChange={handleSelect('birthPlace')} { ...setInputValidation('birthPlace') }/>
          <FormFeedback>Please, fill up this input</FormFeedback>
        </FormGroup>

        <FormGroup>
          <Label for="post-code">Current place of residence (please provide area code)</Label>
          <Input id="post-code" type="text" value={values.currentPlace} onChange={handleSelect('currentPlace')} { ...setInputValidation('currentPlace') } placeholder="(e.g: CH48)"/>
          <FormFeedback>Please, fill up this input</FormFeedback>
        </FormGroup>

        <FormGroup>
          <Label for="non-native">If you were <b>not</b> born in Merseyside, please choose from the following options:</Label>
          <Input type="select" id="non-native" value={values.nonNative} onChange={handleSelect('nonNative')} { ...setInputValidation('nonNative') }>
            <option value='' disabled>I have lived in Merseyside for</option>
            <option value="1">Less than two years</option>
            <option value="2">3-5 years</option>
            <option value="3">6-10 years</option>
            <option value="4">10+ years</option>
          </Input>
        </FormGroup>

        <Button
          onClick={() => {
            if (!submitted) {
              submit(true);
            }
            const _validation = validateData(values);
            if (allValid(_validation)) {
              saveData(values);
            } else {
              saveValidation(_validation);
            }
          }}
        >Next</Button>
      </Form>
    </Fade>
  );
};

export default PersonalInformation;