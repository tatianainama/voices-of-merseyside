import React, { useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';

import PersonalInformation, { FormData } from './PersonalInformation';

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



type AnswersData = {
  personalInformation: FormData,
};

const App = () => {
  const [ currentPage, setCurrentPage ] = useState(0);
  const [ answers, saveAnswers ] = useState<AnswersData>({
    personalInformation: {
      age: '',
      gender: '',
      genderCustom: '',
      ethnicity: '',
      ethnicityCustom: '',
      birthPlace: '',
      currentPlace: '',
      nonNative: '',
    }
  });  
  const sections = [
    Introduction({
      changePage: () => {setCurrentPage(currentPage + 1)}
    }),
    TermsAndConditions({
      changePage: () => {setCurrentPage(currentPage + 1)}
    }),
    PersonalInformation({
      changePage: () => {setCurrentPage(currentPage + 1)},
      closeApp: () => {alert('thank you for your interest, but permission from your parent/guardian is required before you are able to participate.')},
      saveData: (data: FormData) => {
        console.log("data", data)
        saveAnswers({
          ...answers,
          personalInformation: data
        })
      }
    }),
  ];
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
