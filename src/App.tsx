import React, { useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';

type SectionComponentProps = {
  changePage: () => void
}
const Introduction: React.FunctionComponent<SectionComponentProps> = ({ changePage }) => (
  <section id="introduction">
    <div className="jumbotron">
      <h2>Accent and dialect form</h2>
      <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Suscipit voluptatum corporis minima, eius officiis magnam quae vero praesentium odio facilis minus illo ut atque accusamus esse deserunt. Fuga, autem molestiae!</p>
      <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quos impedit natus dolorem ipsam rem cum mollitia, cumque sapiente omnis ea sed nobis ullam, asperiores dignissimos. Unde dolore iure quisquam aut.</p>
      <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat suscipit fugiat, iste, odio tempora dolor, voluptatum assumenda enim aspernatur rem ipsam animi corrupti sapiente labore repellat quam amet. Ipsa, aspernatur!</p>
      <button type="button" onClick={() => changePage()} className="btn btn-primary">Start</button>
    </div>
  </section>
);

const TermsAndConditions: React.FunctionComponent<SectionComponentProps> = ({ changePage }) => {
  const [ agreement, setAgreement ] = useState(false);
  return (
    <section id="terms-and-legals">
      <form id="terms-and-conditions-form" className="needs-validation">
        <h2>Terms and Conditions</h2>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Obcaecati dolore magni aspernatur error totam exercitationem sequi illum. Ex voluptas in, eius provident laudantium quidem quod esse corrupti quas vitae aliquam!</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem culpa soluta, voluptatibus quam magni sapiente corporis debitis ad illo voluptas odio! Adipisci facere ad molestiae ullam vero iure minus mollitia.</p>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum commodi consectetur aperiam. Obcaecati quisquam possimus et facilis quas, doloremque minima rerum reprehenderit fugiat ipsam dolorum placeat velit! Exercitationem, eveniet obcaecati.</p>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Possimus quidem quisquam suscipit! Excepturi deserunt quaerat, odio recusandae molestiae assumenda voluptatem possimus id alias quas voluptatibus non quis vitae incidunt veritatis!</p>
        <div className="form-group form-check">
          <input type="checkbox" className="form-check-input" id="agreement" checked={agreement} onChange={(e) => { setAgreement(e.target.checked)}} required />
          <label className="form-check-label" htmlFor="agreement">I agree with the termns and conditions</label>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => changePage()} disabled={!agreement}>next</button>
      </form>
    </section>
  );
}

type PersonalInformationValues = {
  age: string,
  gender: string,
  genderCustom: string,
  ethnicity: string,
  ethnicityCustom: string,
  birthPlace: string,
  currentPlace: string
};

const PersonalInformation = () => {
  const [ values, setValue ] = useState({
    age: '',
    gender: '',
    genderCustom: '',
    ethnicity: '',
    ethnicityCustom: '',
    birthPlace: '',
    currentPlace: ''
  });

  const handleSelect = (value: keyof PersonalInformationValues ) => (e: React.ChangeEvent<HTMLSelectElement|HTMLInputElement>) => {
    setValue({
      ...values,
      [value]: e.target.value
    });
  };

  console.log(values);
  return (
    <section id="personal-information" className="content page page-2">
      <h2>Personal Information</h2>
      <p>All fields are required</p>
      <form id="personal-information-form" className="needs-validation">
        <div className="form-group">
          <label htmlFor="age-range">Age</label>
          <select id="age-range" className="custom-select form-control" value={values.age} onChange={handleSelect('age')} required>
            <option value="" disabled>Please select an option</option>
            <option value="1">11 - 17</option>
            <option value="2">18 - 29</option>
            <option value="3">30 - 45</option>
            <option value="4">46 - 59</option>
            <option value="5">60 - 69</option>
            <option value="6">70+</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="gender">Gender</label>
          <select className="form-control custom-select" id="gender" value={values.gender} onChange={handleSelect('gender')} required>
            <option value="" disabled>Please select an option</option>
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
          <label htmlFor="ethnicity">Ethnicity</label>
          <select id="ethnicity" className="form-control" value={values.ethnicity} onChange={handleSelect('ethnicity')} required>
            <option value="" disabled>Please select an option</option>
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
          <small className="form-text text-muted">
            The options above are taken from the 2011 UK Census. You can also define yours selecting the 'None of the above' option and typing in the text box
          </small>
        </div>
        <div className="form-group">
          <label htmlFor="town-birth">Town of birth</label>
          <input id="town-birth" type="text" className="form-control" required/>
        </div>
        <div className="form-group">
          <label htmlFor="postal-code">Current postal code</label>
          <input id="postal-code" type="text" className="form-control" required/>
          <div className="form-group form-check">
            <input type="checkbox" className="form-check-input" id="long-time-resident" />
            <label className="form-check-label" htmlFor="long-time-resident">I have lived in the area for 1/2 years</label>
          </div>
        </div>
        <button type="button" onClick={()=>{}} className="btn btn-primary">Next</button>
      </form>
    </section>
  );
}

const App = () => {
  const [ currentPage, setCurrentPage ] = useState(0);
  const sections = [
    Introduction({
      changePage: () => {setCurrentPage(currentPage + 1)}
    }),
    TermsAndConditions({
      changePage: () => {setCurrentPage(currentPage + 1)}
    }),
    PersonalInformation(),
  ];
  console.log("currentPage", currentPage);
  return (
    <div className="App bg-light">
      <div className="container">
        {
          sections[currentPage]
        }
      </div>
    </div>
  )
};

export default App;
