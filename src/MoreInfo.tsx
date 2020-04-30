import React from 'react';
import { Button, Container, Fade } from 'reactstrap';
import { Link } from 'react-router-dom';

const MoreInfo = () => {
  return (
    <Container>
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
        <Link to="/">
          <Button className="mb-3">Return to the survey</Button>
        </Link>
      </Fade>
    </Container>
  )
}

export default MoreInfo;