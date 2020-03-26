import React, { useState } from 'react';
import { Container, Fade, Button, Form, FormGroup, Input, Label } from 'reactstrap';

import PersonalInformation, { FormData } from './PersonalInformation';
import DrawCanvas, { CanvasData } from './DrawCanvas';
import FollowUp from './FollowUp';

type SectionComponentProps = {
  changePage: () => void
}
const Introduction: React.FunctionComponent<SectionComponentProps> = ({ changePage }) => (
  <Fade tag="section" id="vom-intro">
    <h1 className="mb-4">Voices of Merseyside</h1>
    <div className="mb-4">
      <p className="lead">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Suscipit voluptatum corporis minima, eius officiis magnam quae vero praesentium odio facilis minus illo ut atque accusamus esse deserunt. Fuga, autem molestiae!</p>
      <p className="lead">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quos impedit natus dolorem ipsam rem cum mollitia, cumque sapiente omnis ea sed nobis ullam, asperiores dignissimos. Unde dolore iure quisquam aut.</p>
      <p className="lead">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat suscipit fugiat, iste, odio tempora dolor, voluptatum assumenda enim aspernatur rem ipsam animi corrupti sapiente labore repellat quam amet. Ipsa, aspernatur!</p>
    </div>
    <Button type="button" outline onClick={() => changePage()} color="info">Let's start!</Button>
  </Fade>
);

const TermsAndConditions: React.FunctionComponent<SectionComponentProps> = ({ changePage }) => {
  const [ agreement, setAgreement ] = useState(false);
  return (
    <Fade tag="section" id="vom-terms">
      <Form>
        <h2 className="mb-4">Terms and Conditions</h2>
        <div className="mb-4">
          <p className="lead">Lorem ipsum dolor sit amet consectetur adipisicing elit. Obcaecati dolore magni aspernatur error totam exercitationem sequi illum. Ex voluptas in, eius provident laudantium quidem quod esse corrupti quas vitae aliquam!</p>
          <p className="lead">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem culpa soluta, voluptatibus quam magni sapiente corporis debitis ad illo voluptas odio! Adipisci facere ad molestiae ullam vero iure minus mollitia.</p>
          <p className="lead">Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum commodi consectetur aperiam. Obcaecati quisquam possimus et facilis quas, doloremque minima rerum reprehenderit fugiat ipsam dolorum placeat velit! Exercitationem, eveniet obcaecati.</p>
          <p className="lead">Lorem ipsum dolor sit amet consectetur adipisicing elit. Possimus quidem quisquam suscipit! Excepturi deserunt quaerat, odio recusandae molestiae assumenda voluptatem possimus id alias quas voluptatibus non quis vitae incidunt veritatis!</p>
        </div>
        <FormGroup className="mb-4" check>
          <Input type="checkbox" id="vom-terms-check" checked={agreement} onChange={ e => setAgreement(e.target.checked)}/>
          <Label for="vom-terms-check" check>I agree</Label>
        </FormGroup>
        <Button type="button" disabled={!agreement} color={agreement ? 'info' : 'secondary'}  onClick={ () => changePage() }>Next</Button>
      </Form>
    </Fade>
  );
}

const FinishSection: React.FunctionComponent = () => {
  return (
    <Fade tag="section" id="vom-finish">
      <h2>Thank you!</h2>
    </Fade>
  )
};

type AnswersData = {
  personalInformation: FormData,
  canvas: CanvasData[],
  email: string,
};

const PAGES = [0, 1, 2, 3, 4];
const App = () => {
  const [ currentPage, setCurrentPage ] = useState(0);
  const [ exit, setExit ] = useState(false);
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
    },
    canvas: [],
    email: ''
  });
  const changePage = () => {
    setCurrentPage(currentPage + 1);
    window.scrollTo(0, 0);
  }
  const uploadData = () => {
    const data = {
      personalInformation: answers.personalInformation,
      canvas: answers.canvas.map(data => ({
        form: data.form,
        path: data.path.exportJSON()
      })),
      email: answers.email
    };
    const postRequest = new XMLHttpRequest();
    postRequest.open('POST', '/backend/', true);
    postRequest.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    postRequest.send(JSON.stringify(data));
  }
  const sections = [
    Introduction({
      changePage: changePage
    }),
    TermsAndConditions({
      changePage: changePage
    }),
    PersonalInformation({
      closeApp: () => setExit(true),
      saveData: (data: FormData) => {
        saveAnswers({
          ...answers,
          personalInformation: data
        });
        changePage()
      }
    }),
    DrawCanvas({
      saveData: (data) => {
        saveAnswers({
          ...answers,
          canvas: data
        });
        changePage()
      }
    }),
    FollowUp({
      saveData: (email) => {
        saveAnswers({
          ...answers,
          email,
        });
        uploadData();
        changePage();
      }
    }),
    FinishSection({})
  ];
  return (
    <>
      <div id="vom-progress-bar">
        {
          PAGES.map(page => (
            <div key={page} className={`vom-progress-page ${page <= currentPage ? 'progress-done' : ''}`}></div>
          ))
        }
      </div>
      <div className="App">
        <Container>
          {
            !exit ? (
              sections[currentPage]
            ) : (
              <Fade in={exit} tag="section">
                <h4>
                  Thank you for your interest, but permission from your parent/guardian is required before you are able to participate.
                </h4>
              </Fade>
            )
          }
        </Container>
      </div>
    </>
  )
};

export default App;
