import React from 'react';
import { Button, Container, Nav, NavItem } from 'reactstrap';
import { Link } from 'react-router-dom';
import UVA_IMG from './13_fa_uva1.png';

const ConsentInformation: React.FunctionComponent = () => {
  return (
    <div>
      <Container>
        <Nav className="uva-terms">
          <NavItem>
            <img src={UVA_IMG} alt="universiteit van amsterdam"/>
          </NavItem>
        </Nav>
        <div className="px-3 py-3 pt-md-5 pb-md-4 mx-auto text-center">
          <h5>Information brochure for <i>Voices of Merseyside</i></h5>
        </div>

        <p>
        Dear participant, <br/>
        You will be taking part in the <i>Voices of Merseyside</i> research project conducted by Tanya Parry - MA student under supervision of Margreet Dorleijn - Lecturer at the University of Amsterdam Linguistics department. Before the research project can begin, it is important that you read about the procedures we will be applying. Make sure to read this brochure carefully.
        </p>

        <h6><strong>Purpose of the research project</strong></h6>
        <p>
        A speaker’s accent or dialect is closely tied to their sense of identity and community. Using a purposefully designed online tool and geofencing technology, we hope to gain valuable insights into the linguistic landscape of Merseyside and contribute to the wider field of perceptual dialectology. To gather data, residents of Merseyside are asked to draw a digital map of where they believe different accents or dialects in Merseyside to be found. Then, residents will be asked to label the accent, provide examples of words, grammar or sounds that they identify as being associated with the identified area. Finally, to effectively explore language attitudes, the residents will be asked to provide any associations they have with the identified accent or dialect area and rate the accent or dialect in terms of correctness, pleasantness, trustworthiness, and friendliness. Monitoring language attitudes allows linguists to delve further into the social meanings that are often attached to regional accents or dialects, which provide a unique perspective from which to explore perceptions of identity.	
        </p>

        <h6><strong>Who can take part in this research? </strong></h6>
        <p>
          We wish to invite all Merseyside residents of varying ages (16+), gender, class and ethnicity to partake in our study and help us to draw a truly representative map of the linguistic landscape of Merseyside. We hope to collect data from people who have lived (for example, people who originate from Merseyside, but moved away) and currently live in Merseyside (do not originate from Merseyside, but reside there now) to gain a better understanding of how people identify accent areas, and acquire and share language attitudes and ideologies.
        </p>

        <h6><strong>Instructions and procedure</strong></h6>
        <p>This is an online survey, meaning that you can participate in this research from the comfort of your own home.</p>
        <p>
          You click the link to the data collection website www.voicesofmerseyside.org. Initially the website will present an explanation of the study and the data collection tool, once you have finished reading the explanation you may click ‘Let’s start!’ which will take you directly to the ‘Terms of agreement’. Here, you must read these terms and click ‘I give my permission to participate in the research’. From there, you will be asked to provide some background information, however this research is anonymous (unless you agree to be contacted by the researcher for a follow-up interview) meaning that your personal information, such as name or address, are not required. Please note, you are unable to progress onto the next phase of the study if you have not filled out the background information section. Once completed you click ‘Next’, and a screen with instructions for the mapping phase of the study will pop-up:
        </p>
        <ol>
          <li>Please draw a shape around an area where you think a certain accent or dialect is spoken in Merseyside.</li>
          <li>Please name the accent, give an example of how it sounds, write down any associations (ideas, judgements, opinions etc.) that come to mind when you encounter this accent/a speaker with this accent.</li>
          <li>You are free to edit your map using the edit function.</li>
          <li>Repeat stages 1 and 2 until you have finished your map. Once you have finished, click ‘finished’. It will not be possible to make changes after your map has been submitted.</li>
        </ol>
        <p>
          Once you have finished your map and answered the associated questions, you click ‘Submit’. You will then be asked to provide your email address if you are willing to be contacted by the researcher. This is entirely optional. After which you click ‘Finish’. The survey is now complete. The amount of time required for completion of this study varies depending on how may accent boundaries you identify, but it is estimated to take between 15 to 30 minutes to complete.
        </p>

        <h6><strong>Voluntary participation</strong></h6>
        <p>
          You will be participating in this research project on a voluntary basis. This means you are free to stop taking part at any stage of the survey by closing the window. However, due to the anonymous nature of the survey, it will not be possible to retract your responses after you have clicked ‘Finish’. 
        </p>

        <h6><strong>Discomfort, Risks & Insurance</strong></h6>
        <p>
          The risks of participating in this research are no greater than in everyday situations at home. Previous experience in similar research has shown that no or hardly any discomfort is to be expected for participants. For all research at the University of Amsterdam, a standard liability insurance applies.
        </p>

        <h6><strong>Confidential treatment of your details</strong></h6>
        <p>
          The information gathered over the course of this research will be used for further analysis and publication in scientific journals only. Your personal details will not be used in these publications, and we guarantee that you will remain anonymous under all circumstances.
        </p>
        <p>
          The data gathered during the research will be encrypted and stored separately from your personal details. These personal details and the encryption key are only accessible to members of the research staff.
        </p>
        <p>
          If you choose to participate in a follow-up interview, the video and audio recordings will never be shown in public without your written consent. You will receive a separate form to provide such consent if you wish to do so.
        </p>

        <h6><strong>Reimbursement</strong></h6>
        <p>
          If you wish, we can send you a summary of the general research results at a later stage.
        </p>

        <h6><strong>Further information</strong></h6>
        <p>
          For further information on the research project, please contact:
        </p>
        <address>
          Margreet Dorleijn<br/>
          <abbr title="Phone">Phone number:</abbr> +31 20 - 5252196<br/>
          <abbr title="Email">Email:</abbr> <a href="mailto:m.dorleijn@uva.nl">M.Dorleijn@uva.nl</a><br/>
          Spuistraat 134, 1012VB Amsterdam, room 639
        </address>
        <p>
          If you have any complaints regarding this research project, you can contact the<br/>
        </p>
        <address>
          Secretary of the Ethics Committee of the Faculty of Humanities of the University of Amsterdam <br/>
          <abbr title="Phone">Phone number:</abbr> +31 20 - 525 3054<br/>
          <abbr title="Email">Email:</abbr> <a href="mailto:commissie-ethiek-fgw@uva.nl">commissie-ethiek-fgw@uva.nl</a><br/>
          Kloveniersburgwal 48, 1012 CX Amsterdam.
        </address>

        <div className="px-3 py-3 pt-md-5 pb-md-4 mx-auto text-center">
          <h5>Informed consent form</h5>
        </div>

        <p>
          I hereby declare that I have been clearly informed about the research project Voices of Merseyside at the University of Amsterdam, Linguistics department, conducted by Tanya Parry - MA student under supervision of Margreet Dorleijn – lecturer as described in the information brochure. My questions have been answered to my satisfaction.
        </p>

        <p>
          I consent to participate in this research on an entirely voluntary basis. I understand that due to the anonymous nature of this research, I am unable to retract my responses once I have submitted the survey. If I choose to participate in a follow-up survey, I will provide my email address.
        </p>

        <p>
        If my research results are used in scientific publications or made public in any other way, they will be fully anonymised. My personal information may not be viewed by third parties without my express permission. 
        </p>

        <p>
          If I need any further information on the research, now or in the future, I can contact <br/>
        </p>
        <address>
          Margreet Dorleijn<br/>
          <abbr title="Phone">Phone number:</abbr> +31 20 - 5252196<br/>
          <abbr title="Email">Email:</abbr> <a href="mailto:m.dorleijn@uva.nl">M.Dorleijn@uva.nl</a><br/>
          Spuistraat 134, 1012VB Amsterdam, room 639
        </address> 

        <p>
          If I have any complaints regarding this research, I can contact the<br/>
        </p>
        <address>
          Secretary of the Ethics Committee of the Faculty of Humanities of the University of Amsterdam <br/>
          <abbr title="Phone">Phone number:</abbr> +31 20 - 525 3054<br/>
          <abbr title="Email">Email:</abbr> <a href="mailto:commissie-ethiek-fgw@uva.nl">commissie-ethiek-fgw@uva.nl</a><br/>
          Kloveniersburgwal 48, 1012 CX Amsterdam.
        </address>


        <Link to="/">
          <Button className="mb-3">Return to the survey</Button>
        </Link>
      </Container>
    </div>
  )
}

export default ConsentInformation;