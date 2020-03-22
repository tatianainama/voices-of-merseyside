import React, { useState } from 'react';
import { FormGroup, Label, Input, Button } from 'reactstrap';

type FollowUpProps = {
  saveData: (data: string) => void
};

const FollowUp: React.FunctionComponent<FollowUpProps> = ({ saveData }) => {
  const [ email, setEmail ] = useState('');
  return (
    <section id="follow-up">
      <h2>
        Thank you for your participation
      </h2>
      <FormGroup>
        <Label>Would you be willing to participate in a follow-up (online) interview? If so, please leave your email address in the box provided.</Label>
        <Input type="text" value={email} onChange={(e) => setEmail(e.target.value)}/>
      </FormGroup>
      <Button color="primary" onClick={() => saveData(email)}>Finish</Button>
    </section>
  )
};

export default FollowUp;