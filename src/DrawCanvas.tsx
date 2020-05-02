
import React, { useState, useEffect } from 'react';
import Paper, { Path, PaperScope } from 'paper';
import { Modal, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input, Fade, ModalHeader, ButtonGroup, Badge, FormFeedback, InputGroup, InputGroupAddon, FormText } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import { remove, update, difference } from 'ramda';

const COLORS = [
  '#ffc6bc',
  '#fedea2',
  '#fff9b8',
  '#d3dbb2',
  '#a7d3d2',
  '#efe3f3',
  '#c4d0f5',
  '#c0ba98',
];

const getUnusedColor = (used: CanvasData[]): string => {
  const usedColors = used.map(data => data.path.strokeColor?.toCSS(true));
  const availableColors = difference(COLORS, usedColors);
  return availableColors[0] || COLORS[0];
}

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
    fillColor: '#4b505a',
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
  canvas: {
    height: number,
    width: number
  },
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
  saveData: (data: {
    data: CanvasData[],
    canvas: {
      width: number,
      height: number
    }
  }) => void,
  showHelp: () => void,
};

type FormData = {
  [key: string]: any } &
  {
    name: string,
    soundExample: string,
    associations: string[],
    correctness: number,
    pleasantness: number,
    trustworthiness: number,
    friendliness: number
};

type PathQuestionFormState = {
  submitted: boolean,
  validation: {
    [y: string]: boolean
  }
}

const Associations: React.FunctionComponent<{ 
  initialValue: string[],
  saveAssociations: (list: string[]) => void,
  id: string,
  valid?: boolean,
  invalid?: boolean,
}> = 
({ saveAssociations, initialValue, id, valid, invalid }) => {
  const [ associations, setAssociations ] = useState<string[]>(initialValue);
  const [ newValue, setNewValue ] = useState<string>('');

  useEffect(() => {
    setAssociations(initialValue);
  }, [initialValue])

  const maxAssociationsReached = () => associations.length >= 5;

  const updateAssociations = (newAssociations: string[]) => {
    setAssociations(newAssociations);
    saveAssociations(newAssociations);
  }

  return (
    <div id="vom-associations">
      <FormGroup>
        <InputGroup>
          <Input value={newValue} onChange={(e) => setNewValue(e.target.value)} disabled={maxAssociationsReached()} id={id} valid={valid} invalid={invalid}/>
          <InputGroupAddon addonType="append">
            <Button 
              onClick={() => {
                updateAssociations([...associations, newValue]);
                setNewValue('')
              }}
              disabled={maxAssociationsReached()}
            >Add</Button>
          </InputGroupAddon>
        <FormFeedback>At least one association is required</FormFeedback>
        </InputGroup>
      </FormGroup>
      {
        associations.length ? (
          <div className="vom-associations-list mt-1">
            {
              associations.map((association, key) => (
              <Badge color="secondary" key={key} className="vom-associations-value mr-1 mb-1">
                {association}
                <Button className="vom-remove-association p-1" color="link" onClick={() => updateAssociations(remove(key, 1, associations))}>
                  <FontAwesomeIcon icon={faTimes} />
                </Button>
              </Badge>
              ))
            }
          </div>
        ) : null
      }
    </div>
  )
}

const Slider: React.FunctionComponent<{
  label: string,
  onChange: (selection: number) => void,
  initialValue: number,
  valid?: boolean,
  invalid?: boolean,
}> = ({label, onChange, initialValue, valid, invalid}) => {
  const values = [ 1, 2, 3, 4, 5];
  const [ selection, setSelection ] = useState(initialValue);

  useEffect(() => {
    setSelection(initialValue)
  }, [initialValue]);

  const update = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    const result = parseInt(target.value);
    setSelection(result);
    onChange(result)
  }
  
  return (
    <>
      <label className={`vom-rating-label ${invalid ? 'is-invalid' : ''} ${valid ? 'is-valid' : ''}`}>{ label }</label>
      {
        values.map(value => (
          <FormGroup key={value} className="vom-rating-value" check>
            <Label for={`${label}-${value}`} check className={`${invalid ? 'is-invalid' : ''} ${valid ? 'is-valid' : ''}`} >
              <Input
                type="radio" 
                name={`radio-${label}`} 
                id={`${label}-${value}`} 
                value={value} 
                onChange={update} 
                checked={value === selection}
                valid={valid}
                invalid={invalid}
              />{' '}
              {value}
            </Label>
            {/* <input type="radio" value={value} onChange={update} checked={value === selection} name={`radio-${label}`} id={`${label}-${value}`} /> */}
          </FormGroup>
        ))
      }
    </>
  )
}

const PathQuestions: React.FunctionComponent<{
  saveData: (data: FormData, editing?: boolean) => void,
  cancel: () => void,
  initialData?: FormData
}> = ({ saveData, cancel, initialData }) => {
  const [ data, setData ] = useState<FormData>({
    name: '',
    soundExample: '',
    associations: [],
    correctness: 0,
    friendliness: 0,
    pleasantness: 0,
    trustworthiness: 0
  });

  const SLIDER = ['correctness', 'friendliness', 'pleasantness', 'trustworthiness'];

  const [ form, setFormState ] = useState<PathQuestionFormState>({
    submitted: false,
    validation: {
      name: false,
      associations: false,
      correctness: false,
      friendliness: false,
      pleasantness: false,
      trustworthiness: false
    }
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

  const saveAssociations = (associations: string[]) => {
    setData({
      ...data,
      associations,
    })
  }

  const setScale = (scale: keyof FormData) => (value: number) => {
    setData({
      ...data,
      [scale]: value
    })
  }

  const setInputValidation = (field: keyof FormData): undefined | { valid: true } | { invalid: true } => {
    if (!form.submitted) {
      return undefined;
    }
    if (form.validation[field]) {
      return { valid: true }
    } else {
      return { invalid: true }
    }
  }

  const validateForm = () => {
    const _form: PathQuestionFormState = {
      submitted: true,
      validation: {
        name: data.name !== '',
        associations: data.associations.length !== 0,
        correctness: data.correctness !== 0,
        friendliness: data.friendliness !== 0,
        pleasantness: data.pleasantness !== 0,
        trustworthiness: data.trustworthiness !== 0
      }
    }
    setFormState(_form);
    return Object.keys(_form.validation).every(field => _form.validation[field]);
  }

  return (
    <>
      <ModalBody>
        <Form>
          <FormGroup>
            <Label for="path-name">Please name the accent spoken in this area</Label>
            <Input type="text" id="path-name" value={data.name} onChange={handleChange('name')} {...setInputValidation('name')}/>
            <FormFeedback>Please, fill up this input</FormFeedback>
          </FormGroup>

          <FormGroup>
            <Label for="path-sound-example">Please provide an example of how this accent sounds (optional)</Label>
            <Input type="text" id="path-sound-example" value={data.soundExample} onChange={handleChange('soundExample')} placeholder='(e.g. Words, grammar or sounds)'/>
            <FormFeedback>Please, fill up this input</FormFeedback>
          </FormGroup>

          <FormGroup>
            <Label for="path-associations">
              Please provide any associations (ideas, judgements, opinions, etc.) that come to mind when you encounter this accent/a speaker with this accent
              <FormText color="muted">
                Please press the 'Add' button after each association
              </FormText>
            </Label>
            <Associations id="path-associations" initialValue={data.associations} saveAssociations={saveAssociations} {...setInputValidation('associations')}></Associations>
          </FormGroup>

          <FormGroup>
            <Label for="rate-area">How would you rate the speech of this area along the following scales?</Label>
            <div className="vom-rating">
              <div></div>
              <div>least</div>
              <div className="vom-rating-arrow-container">
                <div className="vom-rating-arrow"></div>
              </div>
              <div>most</div>
            {
              SLIDER.map(scale => (
                <Slider
                  key={scale}
                  initialValue={data[scale]}
                  label={scale}
                  onChange={setScale(scale)}
                  {...setInputValidation(scale)}
                />
              ))
            }
            </div>
            {
              form.submitted && !(form.validation.correctness || form.validation.friendliness || form.validation.pleasantness || form.validation.trustworthiness) &&
              (<div className="is-invalid invalid-feedback">
                Please, select on option for each category
              </div>)
            }
          </FormGroup>
        </Form> 
      </ModalBody>
      <ModalFooter>
        <Button onClick={() => { cancel() }}>Cancel</Button>
        <Button color="primary" onClick={() => {
          if (validateForm()) {
            saveData(data, !!initialData) 
          }
        }}>Save</Button>
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
      editMode: false,
      canvas: {
        height: 0,
        width: 0
      }
    }
  }

  addPoint = (event: any) => {
    const { _path } = this.state;
    if (_path) {
      _path.path.add(event.point)
    } else {
      const color = getUnusedColor(this.state.data);
      this.setState({
        _path: {
          form: {
            name: '',
            associations: [''],
            soundExample: '',
            correctness: 0,
            friendliness: 0,
            pleasantness: 0,
            trustworthiness: 0
          },
          path: mkPath(color, event.point),
          text: mkText(color)
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
      if (this.state._path?.path.isEmpty()) {
        this.setState({
          _path: undefined
        });
        return;
      }
      this.toggleModal(true);
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
      if (item && item instanceof Path) {
        if (!item.selected && this.state.pathSelected === undefined) {
          let itemId = this.getDataByPath(item);
          item.bringToFront();
          item.selected = true;
          this.setState({
            pathSelected: itemId,
          })
        } else {
          if (item.selected) {
            item.selected = false;
            item.sendToBack();
            this.setState({
              pathSelected: undefined,
            })
          }
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

  maxReached = () => {
    return this.state.data.length === 8;
  }

  getDrawsLeft = () => {
    return 8 - this.state.data.length;
  }

  componentDidMount = () => {
    const canvas = new PaperScope();
    canvas.setup('magic-canvas');
    canvas.view.viewSize.height = canvas.view.size.width * 1.25;
    this.setState({
      drawTool: this.mkDrawTool(),
      editTool: this.mkEditTool(),
      canvas: {
        height: canvas.view.size.height,
        width: canvas.view.size.width
      }
    })
  }

  render = () => {
    const { pathSelected, data } = this.state;
    return (
      <>
      <div id="vom-canvas-tools">
        <ButtonGroup className="" size="sm">
          <Button onClick={() => this.props.showHelp()} color="info">
            HELP
          </Button>
          {
            this.state.editMode ? (
              <Button onClick={() => this.toggleEditMode(false)} color="success" disabled={this.maxReached()}>
                SAVE
              </Button>
            ) : null
          }
          {
            this.state.data.length && !this.state.editMode ? (
              <Button onClick={() => this.toggleEditMode(true)} disabled={this.state.current === 0} color="success">
                EDIT
              </Button>
            ) : null
          }
        </ButtonGroup>
        {
          this.state.pathSelected !== undefined ? (
            <ButtonGroup className="" size="sm">
              <Button onClick={() => this.toggleModal(true)}>
                EDIT DATA
              </Button>
              <Button onClick={() => this.removePath()}>
                <FontAwesomeIcon icon={faTrashAlt} />
              </Button>
            </ButtonGroup>
          ) : null 
        }
      </div>
      <div className="vom-draw-reminder">
        You can draw up to {this.getDrawsLeft()} more shapes
      </div>
      <div id="vom-canvas-mode">
        {
          this.state.editMode ? (
            <Badge color="success">Select a shape to edit</Badge>
          ) : (
            <Badge color="primary">Drawing</Badge>
          )
        }
      </div>
        <canvas id="magic-canvas" className='mb-4 rounded'/>
        <Button
          color="primary"
          onClick={() => {
            this.props.saveData({
              data: this.state.data,
              canvas: this.state.canvas
            })
          }}
          disabled={this.state.current === 0}
        >Finished</Button>
        <Modal isOpen={this.state.openModal}>
          <PathQuestions
            saveData={this.saveData}
            cancel={this.cancel}
            initialData={pathSelected !== undefined ? data[pathSelected].form : undefined}
          />
        </Modal>
        <Modal isOpen={this.maxReached() && !this.state.editMode}>
          <ModalBody>
            <p>Maximun amount of drawings reached</p>
            <p>You can change your drawings or submit the map as it is</p>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => this.toggleEditMode(true)} color="success" outline>Edit drawings</Button>
            <Button onClick={() => this.props.saveData({
              data: this.state.data,
              canvas: this.state.canvas
            })} color="primary">Finished</Button>
          </ModalFooter>
        </Modal>
      </>

    )
  }
}


export const DrawCanvas: React.FunctionComponent<{
  saveData: (data: {
    data: CanvasData[],
    canvas: {
      width: number,
      height: number
    }
  }) => void
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
            <li>Please draw a shape around an area where you think a certain accent or dialect is spoken in Merseyside. <b>Please be as precise as possible.</b></li>
            <li>Please name the accent, give an example of how it sounds, write down any associations (ideas, judgements, opinions etc.) that <b>immediately</b> come to mind when you encounter this accent/a speaker with this accent.</li>
            <li>You are free to edit your map using the edit function.</li>
            <li><b>Repeat stages 1 and 2 until you have finished your map.</b> Once you have finished, click ‘finished’. It will not be possible to make changes after your map has been submitted.</li>
          </ol>
        </ModalBody>
        <ModalFooter>
          <Button outline color="primary" onClick={() => setShowInstructions(false)}>Ok</Button>
        </ModalFooter>
      </Modal>
      <Canvas
        saveData={saveData}
        showHelp={() => setShowInstructions(true)}
      />
    </Fade>
  )
};

export default DrawCanvas;