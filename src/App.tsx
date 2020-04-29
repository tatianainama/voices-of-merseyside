import React, { useState } from 'react';
import { Container, Fade, Button, Form, FormGroup, Input, Label } from 'reactstrap';
import { Link } from 'react-router-dom';
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
      <h4>About</h4>
      <p className="">
        This project seeks to explore the rich and diverse accents, dialects, and identities of Merseyside.
      </p>
    </div>
    <div className="mb-5">
      <h4>Online Mapping</h4>
      <p>
        A speaker’s accent or dialect is closely tied to their sense of identity and community. Using a
        purposefully designed online tool and geofencing technology, we hope to gain valuable insights into
        the linguistic landscape of Merseyside and contribute to the wider field of perceptual dialectology.
        To gather data, residents of Merseyside are asked to draw a digital map of where they believe
        different accents or dialects in Merseyside to be found. Then, residents will be asked to label the
        accent, provide examples of words, grammar or sounds that they identify as being associated with
        the identified area. Finally, to effectively explore language attitudes, the residents will be asked to
        provide any associations they have with the identified accent or dialect area and rate the accent or
        dialect in terms of correctness, pleasantness, trustworthiness, and friendliness. Monitoring language
        attitudes allows linguists to delve further into the social meanings that are often attached to regional
        accents or dialects, which provide a unique perspective from which to explore perceptions of
        identity.
      </p>
      <p>
        We wish to invite all current and former residents of Merseyside to partake in our study and help us to draw a truly representative map of the linguistic landscape of Merseyside,
        as experienced by you the Voices of Merseyside.
      </p>
    </div>
    <div className="mb-4">
      <p className="text-muted font-italic">
      Voices of Merseyside is an MA thesis project created by Tanya Parry. A former resident of Merseyside, who now resides in Amsterdam. If you wish to get in touch, please email:
      <a className="text-decoration-none" href="mailto:voicesofmerseyside@gmail.com"> voicesofmerseyside@gmail.com</a>
      </p>
    </div>
    <Button type="button" outline onClick={() => changePage()} color="info">Let's start!</Button>
  </Fade>
);

const TermsAndConditions: React.FunctionComponent<SectionComponentProps> = ({ changePage }) => {
  const [ agreement, setAgreement ] = useState(false);
  return (
    <Fade tag="section" id="vom-terms">
      <Form>
        <h2 className="mb-4">Terms of agreement</h2>
        <div className="mb-4">
          <p className="">
          I understand that the responses I give are anonymous (unless I have agreed to be contacted by the
          researcher – an option given at the end of the survey). Therefore, it is not possible to retract my
          participation once the map and accompanying responses have been submitted.
          </p>
          <p className="">
          I am aware that this study is part of an MA thesis for the Universiteit van Amsterdam, currently
          being undertaken by the researcher, Tanya Parry. I understand that my responses will be stored and
          used by the researcher and her team. However, I allow for my responses (which are anonymous
          unless I choose to be contacted by the researcher) to be shared with other academics, if the
          researcher so chooses.
          </p>
          <p>
            To read the terms and conditions specified by the Universiteit van Amsterdam, please click the following <Link to="/terms">link</Link>
          </p>
        </div>
        <FormGroup className="mb-4" check>
          <Input type="checkbox" id="vom-terms-check" checked={agreement} onChange={ e => setAgreement(e.target.checked)}/>
          <Label for="vom-terms-check" check>I give my permission to participate in this research project.</Label>
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
  canvasSize: {
    width: number,
    height: number,
  },
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
      levelEducation: [],
      birthPlace: '',
      currentPlace: '',
      nonNative: '',
    },
    canvas: [],
    canvasSize: {
      width: 0,
      height: 0
    },
    email: ''
  });
  const changePage = () => {
    setCurrentPage(currentPage + 1);
    window.scrollTo(0, 0);
  }
  const uploadData = (email?: string) => {
    const data = {
      personalInformation: answers.personalInformation,
      canvas: answers.canvas.map(data => ({
        form: data.form,
        path: data.path.exportJSON()
      })),
      canvasSize: answers.canvasSize,
      email: email
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
          canvas: data.data,
          canvasSize: data.canvas
        });
        changePage()
      }
    }),
    FollowUp({
      saveData: (email) => {
        uploadData(email);
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
