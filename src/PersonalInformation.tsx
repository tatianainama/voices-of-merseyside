import React, {useState} from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';

export type PersonalInformationValues = {
  age: string,
  ageAuthorized: boolean,
  gender: string,
  genderCustom: string,
  ethnicity: string,
  ethnicityCustom: string,
  birthPlace: string,
  currentPlace: string,
  nonNative: string
};

type PersonalInformationProps = {
  changePage: () => void,
  closeApp: () => void,
  saveData: (data: PersonalInformationValues) => void
};

export const PersonalInformation: React.FunctionComponent<PersonalInformationProps> = ({ changePage, closeApp, saveData }) => {
  const [ values, setValue ] = useState<PersonalInformationValues>({
    age: '',
    ageAuthorized: false,
    gender: '',
    genderCustom: '',
    ethnicity: '',
    ethnicityCustom: '',
    birthPlace: '',
    currentPlace: '',
    nonNative: '',
  });

  const [ openModal, toggleModal ] = useState(false);

  const setAgeAuthorization = (authorized: boolean) => {
    setValue({
      ...values,
      ageAuthorized: authorized
    })
  };

  const handleSelect = (value: keyof PersonalInformationValues ) => (e: React.ChangeEvent<HTMLSelectElement|HTMLInputElement>) => {
    setValue({
      ...values,
      [value]: e.target.value
    });
  };

  return (
    <section id="personal-information" className="content page page-2">
      <h2>Personal Information</h2>
      <p>All fields are required</p>
      <form id="personal-information-form" className="needs-validation">
        <div className="form-group">
          <label htmlFor="age-range">Age</label>
          <select id="age-range" className="custom-select form-control" value={values.age} onChange={e => {
            if (e.target.value === '1') {
              toggleModal(true);
            } else {
              handleSelect('age')(e)
            }
          }} required>
            <option value="" disabled>Please chooose</option>
            <option value="1">11 - 17</option>
            <option value="2">18 - 25</option>
            <option value="3">26 - 45</option>
            <option value="4">46 - 65</option>
            <option value="5">66 - 75</option>
            <option value="6">75+</option>
          </select>
          <Modal isOpen={openModal} onClosed={() => {
            if (values.ageAuthorized) {
              setValue({
                ...values,
                age: '1'
              })
            } else {
              closeApp();
              console.log("go away kiddo")
            }
          }}>
            <ModalBody>
              I have permission from my parent(s)/guardian(s) to participate in this study
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => { setAgeAuthorization(false); toggleModal(false)}}>No</Button>
              <Button color="primary" onClick={() => { setAgeAuthorization(true); toggleModal(false)}}>Yes</Button>
            </ModalFooter>
          </Modal>
        </div>
        <div className="form-group">
          <label htmlFor="gender">Gender</label>
          <select className="form-control custom-select" id="gender" value={values.gender} onChange={handleSelect('gender')} required>
            <option value="" disabled>Please choose</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Neither, I identify as follows</option>
          </select>
          {
            values.gender === 'other' && (
              <input type="text" id="gender-custom" className="form-control mt-2" value={values.genderCustom} onChange={handleSelect('genderCustom')} required/>
            )
          }
        </div>
        <div className="form-group">
          <label htmlFor="ethnicity">
            Ethnicity
            <small className="form-text text-muted">
              The following options are taken from the 2011 UK Census. You can also define yours selecting the 'None of the above' option.
            </small>  
          </label>
          <select id="ethnicity" className="form-control" value={values.ethnicity} onChange={handleSelect('ethnicity')} required>
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
          </select>
          {
            values.ethnicity === 'other' && (
              <input type="text" id="ethnicity-custom" className="form-control mt-2" required/>
            )
          }
        </div>
        <div className="form-group">
          <label htmlFor="place-birth">Place of birth (Town/city and country)</label>
          <input id="place-birth" type="text" className="form-control" required/>
        </div>
        <div className="form-group">
          <label htmlFor="post-code">Current place of residence (postcode)</label>
          <input id="post-code" type="text" className="form-control" required/>
        </div>
        <div className="form-group">
          <label>If you were <b>not</b> born in Merseyside, please choose from the following options</label>
          <select className="form-control" id="resident" value={values.nonNative} onChange={handleSelect('nonNative')}>
            <option value="" disabled>Please choose</option>
            <option value="1">Less than two years</option>
            <option value="2">3-5 years</option>
            <option value="3">6-10 years</option>
            <option value="4">10+ years</option>
          </select>
        </div>
        <button type="button" onClick={() => {
          console.log(values);
          saveData(values);
        }} className="btn btn-primary">Next</button>
      </form>
    </section>
  );
};

export default PersonalInformation;