
import React, { useState, useEffect } from 'react';
import Paper, { Path } from 'paper';
import { Modal, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input, Fade, ModalHeader, ButtonGroup } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faReply, faTrashAlt, faEraser, faSave, faEdit, faPen } from '@fortawesome/free-solid-svg-icons';
import { remove, update } from 'ramda';

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

const mkPath = (color: string, point?: paper.Point) => {
  let style = {
    strokeColor: color,
    strokeWidth: 5,
    fillColor: mkBgColor(color)
  }
  let path = new Path(style);
  if (point) {
    path.add(point);
  }
  return path;
}

const mkText = (color: string) => {
  const _text = new Paper.PointText({
    fillColor: color,
    strokeColor: '#4b505a',
    strokeWidth: 1,
    justification: 'center',
    fontWeight: 'bold',
    fontSize: '16px',
  });
  return _text;
}

export type CanvasData = {
  form: FormData,
  path: paper.Path,
  text: paper.PointText
};

type CanvasState = {
  data: CanvasData[],
  current: number,
  openModal: boolean,
  drawTool?: paper.Tool,
  editTool?: paper.Tool,
  pathSelected?: number,
  _path?: CanvasData,
  editMode: boolean
};

type CanvasProps = {
  saveData: (data: CanvasData[]) => void
};

type FormData = {
  name: string,
  soundExample: string,
  associations: string,
};

const PathQuestions: React.FunctionComponent<{
  saveData: (data: FormData, editing?: boolean) => void,
  cancel: () => void,
  initialData?: {
    name: string,
    soundExample: string,
    associations: string,
  }
}> = ({ saveData, cancel, initialData }) => {
  const [ data, setData ] = useState<FormData>({
    name: '',
    soundExample: '',
    associations: '',
  });

  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [ initialData ]);

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
        <Button color="primary" onClick={() => { saveData(data, !!initialData) }}>Save</Button>
      </ModalFooter>
    </>
  )
};

class Canvas extends React.Component<CanvasProps, CanvasState> {
  constructor(props: any){
    super(props);
    this.state = {
      data: [],
      current: 0,
      openModal: false,
      drawTool: undefined,
      editTool: undefined,
      pathSelected: undefined,
      _path: undefined,
      editMode: false
    }
  }

  addPoint = (event: any) => {
    const { current, _path } = this.state;
    if (_path) {
      _path.path.add(event.point)
    } else {
      this.setState({
        _path: {
          form: {
            name: '',
            associations: '',
            soundExample: '',
          },
          path: mkPath(COLORS[current], event.point),
          text: mkText(COLORS[current])
        }
      })
    }
  }

  closePath = (event: any) => {
    const { _path } = this.state;
    if (_path) {
      _path.path.add(_path.path.firstSegment);
      _path.path.closed = true;
      _path.path.simplify();
    }
  }

  getPathId = (name: string): string => {
    return name.slice(-1);
  }

  addPathLabel = (pathName: string, path: paper.Path, update?: number) => {
    const { _path } = this.state;
    if (update !== undefined) {
      const { data } = this.state;
      data[update].text.content = pathName;
    }
    if ( _path) {
      _path.text.content = pathName;
      _path.text.position = path.bounds.center;
    }
  }

  toggleModal = (value: boolean) => {
    this.setState({
      openModal: value
    })
  }

  saveData = (formData: FormData, editing?: boolean) => {
    const { data, current, _path } = this.state;
    if (editing) {
      const { pathSelected } = this.state;
      this.addPathLabel(formData.name, data[pathSelected!].path, pathSelected);
      this.setState({
        openModal: false,
        data: update(pathSelected!, {
          ...data[pathSelected!],
          form: formData
        }, data)
      })
    }
    if (_path) {
      this.addPathLabel(formData.name, _path.path);
      this.setState({
        openModal: false,
        current: current < 7 ? current + 1 : current,
        data: [
          ...data,
          {
            ..._path,
            form: formData,
          }
        ],
        _path: undefined
      })
    }
  }

  cancel = () => {
    const { _path } = this.state;
    _path?.path.remove();
    _path?.text.remove();

    this.setState({
      _path: undefined,
      openModal: false
    })
  }

  removeFromCanvas = (data: CanvasData) => {
    data.path.remove();
    data.text.remove();
  }

  clearCanvas = () => {
    this.setState(({ data }) => {
      data.forEach(this.removeFromCanvas)
      return {
        current: 0,
        data: []
      }
    })
  }

  mkDrawTool = () => {
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
    Tool.activate();
    return Tool;
  }

  getDataByPath = (item: paper.Item) => {
    return this.state.data.findIndex(data => data.path.id === item.id)
  }

  mkEditTool = () => {
    const EditTool = new Paper.Tool();
    EditTool.onMouseDown = ({ item }: paper.ToolEvent) => {
      if (item) {
        if (item.selected) {
          item.selected = false;
          this.setState({
            pathSelected: undefined,
          })
        } else {
          let itemId = this.getDataByPath(item);
          item.bringToFront()
          item.selected = true;
          this.setState({
            pathSelected: itemId,
          })
        }
      }
    }
    return EditTool;
  }

  removePath = () => {
    const { data, pathSelected } = this.state;
    if (pathSelected !== undefined) {
      this.removeFromCanvas(data[pathSelected]);
      const newData = remove(pathSelected, 1, data);
      if (!newData.length) {
        this.toggleEditMode(false);
      }
      this.setState({
        pathSelected: undefined,
        data: newData,
        current: newData.length,
      })
    }
  }

  toggleEditMode = (showEdit: boolean) => {
    const { editTool, drawTool, data, pathSelected } = this.state
    if (showEdit) {
      editTool?.activate()
      this.setState({
        editMode: showEdit,
      })
    } else {
      drawTool?.activate();
      if (pathSelected !== undefined) {
        data[pathSelected].path.selected = false;
      }
      this.setState({
        editMode: showEdit,
        pathSelected: undefined
      })
    }
  }

  componentDidMount = () => {
    Paper.setup('magic-canvas');
    this.setState({
      drawTool: this.mkDrawTool(),
      editTool: this.mkEditTool(),
    })
  }

  render = () => {
    const { pathSelected, data } = this.state;
    return (
      <>
      <div id="vom-canvas-tools">
        <ButtonGroup className="mb-3 ">
          <Button onClick={() => this.clearCanvas()} color="danger">
            <FontAwesomeIcon icon={faTrashAlt} />
          </Button>
          {
            this.state.editMode ? (
              <Button onClick={() => this.toggleEditMode(false)} color="warning">
                <FontAwesomeIcon icon={faReply} />
              </Button>
            ) : null
          }
          {
            this.state.data.length && !this.state.editMode ? (
              <Button color="success" onClick={() => this.toggleEditMode(true)} disabled={this.state.current === 0}>
                <FontAwesomeIcon icon={faPen} />
              </Button>
            ) : null
          }
        </ButtonGroup>

        {
          this.state.pathSelected !== undefined ? (
            <ButtonGroup className="mb-3">
              <Button onClick={() => this.removePath()}>
                <FontAwesomeIcon icon={faEraser} />
              </Button>
              <Button onClick={() => this.toggleModal(true)}>
                <FontAwesomeIcon icon={faEdit} />
              </Button>
              <Button onClick={() => this.toggleEditMode(false)}>
                <FontAwesomeIcon icon={faSave} />
              </Button>
            </ButtonGroup>
          ) : null 
        }
      </div>
        <canvas id="magic-canvas" className={`mb-4 border rounded ${this.state.editMode && 'border-success'}`}/>
        <Button
          color="primary"
          onClick={() => this.props.saveData(this.state.data)}
          disabled={this.state.current === 0}
        >Finish</Button>
        <Modal isOpen={this.state.openModal}>
          <PathQuestions
            saveData={this.saveData}
            cancel={this.cancel}
            initialData={pathSelected !== undefined ? data[pathSelected].form : undefined}
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
  saveData: (data: CanvasData[]) => void
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