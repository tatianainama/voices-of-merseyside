
import React, { useState } from 'react';
import Paper, { Path } from 'paper';
import { Modal, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input, Fade, ModalHeader } from 'reactstrap';

const COLORS = [
  '#FFC6BC',
  '#FEDEA2',
  '#FFF9B8',
  '#D3DBB2',
  '#A7D3D2',
  '#EFE3F3',
  '#C4D0F5',
  '#FFC6BC',
];

const mkBgColor = (color: string) => {
  const _color = new Paper.Color(color);
  _color.alpha = 0.5;
  return _color;
};

const mkPath = (color: string) => {
  let style = {
    strokeColor: color,
    strokeWidth: 5,
    fillColor: mkBgColor(color)
  }
  let path = new Path(style);
  if (path && path.onClick) {
    path.onClick((e: any) => {
      console.log("click on path", e)
    })
  }
  return path;
}

export type CanvasData = {
  [x: number]: {
    form: FormData,
    path: paper.Path
  }
};

type CanvasState = {
  data: CanvasData,
  current: number,
  openModal: boolean
};

type CanvasProps = {
  saveData: (data: CanvasData) => void
};

type FormData = {
  name: string,
  soundExample: string,
  associations: string,
};

const PathQuestions: React.FunctionComponent<{
  saveData: (data: FormData) => void,
  cancel: () => void
}> = ({ saveData, cancel }) => {
  const [ data, setData ] = useState<FormData>({
    name: '',
    soundExample: '',
    associations: '',
  });

  const handleChange = (key: string) => (e: React.ChangeEvent<HTMLSelectElement|HTMLInputElement>) => {
    setData({
      ...data,
      [key]: e.target.value
    });
  }

  return (
    <>
      <ModalBody>
        <Form>
          <FormGroup>
            <Label for="path-name">Please name the accent spoken in this area</Label>
            <Input type="text" id="path-name" value={data.name} onChange={handleChange('name')} />
          </FormGroup>

          <FormGroup>
            <Label for="path-sound-example">Please provide an example of how this accent sounds</Label>
            <Input type="text" id="path-sound-example" value={data.soundExample} onChange={handleChange('soundExample')} />
          </FormGroup>

          <FormGroup>
            <Label for="path-associations">Please provide any associations (ideas, judgements, opinions, etc.) that come to mind when you encounter this accent/a speaker with this accent</Label>
            <Input type="text" id="path-associations" value={data.associations} onChange={handleChange('associations')} />
          </FormGroup>
        </Form> 
      </ModalBody>
      <ModalFooter>
        <Button onClick={() => { cancel() }}>Cancel</Button>
        <Button color="primary" onClick={() => { saveData(data) }}>Save</Button>
      </ModalFooter>
    </>
  )
};

class Canvas extends React.Component<CanvasProps, CanvasState> {
  constructor(props: any){
    super(props);
    this.state = {
      data: {},
      current: 0,
      openModal: false
    }
  }

  addPoint = (event: any) => {
    const { data, current } = this.state;
    data[current].path.add(event.point)
  }

  closePath = (event: any) => {
    const { data, current } = this.state;
    data[current].path.add(data[current].path.firstSegment);
    data[current].path.closed = true;
    data[current].path.simplify();
  }

  toggleModal = (value: boolean) => {
    this.setState({
      openModal: value
    })
  }

  saveData = (formData: FormData) => {
    this.setState(({ data, current }) => {
      return {
        openModal: false,
        current: current < 7 ? current + 1 : current,
        data: {
          ...data,
          [current]: {
            ...data[current],
            form: formData
          }
        }
      }
    })
  }

  cancel = () => {
    this.setState(({ data, current }) => {
      data[current].path.removeSegments();
      return {
        openModal: false,
      }
    })
  }

  clearCanvas = () => {
    this.setState(({ data }) => {
      let newData: typeof data = {};

      for (const idx in data ) {
        data[idx].path.removeSegments();
        newData[idx] = data[idx];
      }

      return {
        current: 0,
        data: newData
      }
    })
  }

  componentDidMount = () => {
    Paper.setup('magic-canvas');
    let Tool = new Paper.Tool();
    Tool.onMouseDown = this.addPoint; 
    Tool.onMouseDrag = this.addPoint;
    Tool.onMouseUp = (event: any) => {
      this.closePath(event);
      this.toggleModal(true);
      if (this.state.current === 7) {
        Tool.remove();
      }
    }
    this.setState({
      data: COLORS.map(color => ({
        form: {
          name: '',
          associations: '',
          soundExample: ''
        },
        path: mkPath(color)
      }))
    })
  }

  render = () => {
    return (
      <>
        <Button className="mb-3" onClick={() => this.clearCanvas()}>Clear</Button>
        <canvas id="magic-canvas" className="mb-4"/>
        <Button
          color="primary"
          onClick={() => this.props.saveData(this.state.data)}
          disabled={this.state.current === 0}
        >Finish</Button>
        <Modal isOpen={this.state.openModal} onClosed={() => {
          console.log("close", this.state);
        }}>
          <PathQuestions
            saveData={this.saveData}
            cancel={this.cancel}
          />
        </Modal>
        <Modal isOpen={this.state.current === 7}>
          <ModalBody>Maximun drawings reached!</ModalBody>
          <ModalFooter>
            <Button onClick={() => {}}>Edit drawings</Button>
            <Button onClick={() => this.props.saveData(this.state.data)}>Next step</Button>
          </ModalFooter>
        </Modal>
      </>

    )
  }
}


export const DrawCanvas: React.FunctionComponent<{
  saveData: (data: CanvasData) => void
}> = ({ saveData }) => {
  const [showInstructions, setShowInstructions] = useState(true)
  return (
    <Fade tag="section" id="vom-drawing-canvas">
      <Modal isOpen={showInstructions}>
        <ModalHeader>
          Instructions
        </ModalHeader>
        <ModalBody>
          <ol>
            <li>Please draw a shape around an area where you think a certain accent or dialect is spoken in Merseyside.</li>
            <li>Please name the accent, give an example of how it sounds, write down any associations (ideas, judgements, opinions etc.) that come to mind when you encounter this accent/a speaker with this accent.</li>
            <li>You are free to edit your map using the edit function.</li>
            <li>Repeat stages 1 and 2 until you have finished your map. Once you have finished, click ‘finished’. It will not possible to make changes after your map has been submitted.</li>
          </ol>
        </ModalBody>
        <ModalFooter>
          <Button outline color="primary" onClick={() => setShowInstructions(false)}>Start</Button>
        </ModalFooter>
      </Modal>
      <Canvas
        saveData={saveData}
      />
    </Fade>
  )
};

export default DrawCanvas;