import React, { useState } from 'react';
import { Container, Badge, FormGroup, Label, Input, Button, Collapse, Table, ListGroup, ListGroupItem } from 'reactstrap';
import Paper, { Path, PaperScope, Point, Raster, Color } from 'paper';
import { without, append, isNil, identity, includes, is } from 'ramda';
import Axios from 'axios';
import VALUES, { AgeVal, GenderVal, NonNativeVal, Filters, FilterVal, FilterStatus, EducationVal } from './services';
import FileDownload from 'js-file-download';
import map from './merseyside-nobg-white.png';
import './Admin.css';

const BACKEND = process.env.REACT_APP_BACKEND || '/backend';

type PersonalInformation = {
  age: AgeVal,
  gender: GenderVal,
  genderCustom: string,
  birthPlace: string,
  currentPlace: string,
  levelEducation: EducationVal[],
  nonNative: NonNativeVal,
}

type Result = {
  personalInformation: PersonalInformation,
  canvas: OriginalCanvasData[],
  canvasSize: {
    width: number,
    height: number
  },
  email: string,
  id: number,
}

interface StateData {
  id: number,
  personalInformation: PersonalInformation,
  canvas: CanvasData[],
  // group: paper.Group,
  email: string
};

interface FormPath {
  name: string,
  soundExample: string,
  associations: string[],
  correctness: number,
  friendliness: number,
  pleasantness: number,
  trustworthiness: number
}

interface ShapeData extends FormPath, PersonalInformation {
  shapeId: number,
  id: number,
}

type OriginalCanvasData = {
  form: FormPath,
  path: string,
}

type CanvasData = {
  form: FormPath,
  path: paper.Path,
  label: paper.PointText
};

type AdminState = {
  original: StateData[],
  data: StateData[],
  canvas?: paper.PaperScope,
  height: number,
  focusedResponse?: StateData,
  path?: paper.Path,
  selectedArea?: paper.Item[],
  focusedDrawResponse?: {
    shape: paper.Item,
    label: paper.TextItem
  },
};

const mkPathLabel = (pathName: string, path: paper.Path) => {
  return new Paper.PointText({
    fillColor: '#4b505a',
    justification: 'center',
    fontWeight: 'bold',
    fontSize: '16px',
    point: path.bounds.center,
    content: pathName,
    visible: true
  })
}

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

const mkBgColor = (color: string) => {
  const _color = new Paper.Color(color);
  _color.alpha = 0.2;
  return _color;
};

const mkPath = (pathData: string, i: number, scale: number, data: ShapeData): paper.Path => {
  const color = COLORS[i % COLORS.length];
  const _path = new Path();
  _path.importJSON(pathData);
  _path.strokeColor = new Color(color);
  _path.strokeWidth = 2;
  _path.fillColor = mkBgColor(color)
  _path.selected = false;
  _path.scale(scale, new Point(0, 0));
  _path.data = data;
  return _path;
}

class Admin extends React.Component<{}, AdminState> {

  constructor(props: any) {
    super(props);
    this.state = {
      height: 100,
      canvas: undefined,
      original: [],
      data: [],
      focusedResponse: undefined,
      path: undefined,
      selectedArea: undefined,
      focusedDrawResponse: undefined,
    };
  }

  createPath = (canvas: paper.PaperScope) => (event: any) => {
    if(this.state.path === undefined) {
      this.toggleDrawings(this.state.data, false);
      let path = new canvas.Path({
        strokeColor: new Color('red'),
        strokeWidth: 5,
      });
      path.bringToFront();
      path.add(event.point);
      this.setState({ path });
    }
  }

  addPoint = (event: any) => {
    if (this.state.path && this.state.selectedArea === undefined) {
      this.state.path?.add(event.point)
    }
  };

  getItems = (canvas: paper.PaperScope) => () => {
    const { path, selectedArea } = this.state;
    if (path && !selectedArea) {
      path.add(path.firstSegment);
      path.closePath();
      path.simplify();
      const items = canvas.project.activeLayer.getItems({
        match: (value: paper.Item) => {
          return value.data.id && path.intersects(value);
        },
        class: Path,
      });
      items.forEach(item => {
        item.visible = true;
      });
      this.setState({
        selectedArea: items || []
      })
    }
  }

  toggleDrawings = (data: StateData[], visibility: boolean) => {
    data.forEach(result => {
      result.canvas.forEach(({ path, label }) => {
        path.visible = visibility;
        label.visible = visibility;
      })
    })
  }

  mkDrawingTool = (canvas: paper.PaperScope) => {
    let Tool = new canvas.Tool();
    Tool.onMouseDown = this.createPath(canvas);
    Tool.onMouseDrag = this.addPoint;
    Tool.onMouseUp = this.getItems(canvas);
  }

  componentDidMount = () => {
    const canvas = new PaperScope();
    canvas.setup('vom-admin-canvas');
    const height = canvas.view.size.width * 1.25;
    canvas.view.viewSize.height = height;
    this.mkDrawingTool(canvas);
    Axios.get<Result[]>(BACKEND, {
      headers: {
        'X-Token': 'secret-potato',
      }
    }).then(response => {
      const _data = response.data.map((result, index) => {
        const item = {
          ...result,
          canvas: result.canvas.map((item, i) => {
            const pathData: ShapeData = {
              id: result.id,
              shapeId: i,
              ...result.personalInformation,
              ...item.form
            };
            const _path = mkPath(item.path, index, canvas.view.size.width / result.canvasSize.width, pathData);
            const _text = mkPathLabel(`${item.form.name} (${i})`, _path);
            return {
              path: _path,
              label: _text,
              form: item.form
            }
          }),
        };
        return item;
      })
      
      const raster = new Raster(map);
      raster.onLoad = () => {
        raster.position = canvas.view.center;
        raster.size = canvas.view.viewSize;
        raster.bringToFront();
      }

      this.setState({
        canvas,
        height,
        original: _data,
        data: _data,
      })
    })
  }

  isNotEducational = (value: AgeVal | GenderVal | NonNativeVal | string | EducationVal[]): value is AgeVal | GenderVal | NonNativeVal | string => {
    return is(String, value);
  }

  applyFilters = (filters: Filters) => {
    const results = this.state.original.filter(
      result => {
        const matches = VALUES.FILTER_KEYS.map(filterKey => {
          const filterValues = filters[filterKey];
          const resultValue = result.personalInformation[filterKey];
          if (filterValues) {
            if (this.isNotEducational(resultValue)) {
              return !isNil(filterValues.find(v => {
                return v === resultValue
              }));
            } else {
              return filterValues.some(v => includes(v, resultValue))
            }
          } else {
            return true;
          }
        }).every(identity);
        if (matches) {
          result.canvas.forEach(({ path, label }) => {
            path.visible = true;
            label.visible = true;
          })
          return true
        } else {
          result.canvas.forEach(({path, label}) => {
            path.visible = false;
            label.visible = false;
          })
          return false;
        }
      }
    )
    this.setState({
      data: results,
      focusedResponse: undefined,
    })
  }

  focusPath = (id: number) => {
    this.state.data.forEach(result => {
      if (result.id === id) {
        result.canvas.forEach(({path, label}) => {
          path.visible = true;
          label.visible = true;
        })
        this.setState({
          focusedResponse: result
        })
      } else {
        result.canvas.forEach(({ path, label}) => {
          path.visible = false;
          label.visible = false;
        })
      }
    });
  }

  clearFocus = () => {
    this.state.data.forEach(result => {
      result.canvas.forEach(({path, label}) => {
        label.visible = true;
        path.visible = true;
      })
    })
    this.setState({
      focusedResponse: undefined
    })
  }

  clearDrawing = () => {
    this.state.data.forEach(result => {
      result.canvas.forEach(({path, label}) => {
        path.visible = true;
        label.visible = true;
        path.selected = false;
      })
    });
    this.state.path?.remove();
    this.setState({
      path: undefined,
      selectedArea: undefined,
      focusedDrawResponse: undefined
    })
  }

  hideDrawing = (item: paper.Item) => {
    const { selectedArea } = this.state;
    if (selectedArea) {
      const newSelection = selectedArea.filter(i => {
        if (item.id === i.id) {
          i.visible = false;
          return false;
        } else {
          return true;
        }
      });
      this.setState({
        selectedArea: newSelection
      })
    }
  }
  downloadData = () => {
    Axios.get(`${BACKEND}/csv`, {
      headers: {
        'X-Token': 'secret-potato',
      }
    }).then(response => {
      FileDownload(response.data, 'voices-of-merseyside.csv')
    })
  }

  downloadResultsData = () => {
    const data = this.state.selectedArea?.map(item => {
      return {
        id: item.data.id,
        shapeId: item.data.shapeId
      }
    });
    Axios.post(`${BACKEND}/csv`, data).then(response => {
      FileDownload(response.data, 'vom-drawing-results.csv');
    }).catch(e => {
      alert('error downloading the data, please try again')
    })
  }

  focuseDrawResponse = (item: ShapeData) => {
    const focused = this.state.data.find(response => response.id === item.id);
    let newFocused;
    if (focused) {
      focused.canvas.forEach(draw => {
        if (draw.path.data.shapeId === item.shapeId) {
          draw.path.bringToFront();
          draw.label.visible = true;
          draw.label.bringToFront();
          draw.path.selected = true;
          draw.path.selectedColor = new Color('red');
          newFocused = {
            shape: draw.path,
            label: draw.label
          }
        }
      });
      if (this.state.focusedDrawResponse) {
        // eslint-disable-next-line react/no-direct-mutation-state
        this.state.focusedDrawResponse.shape.selected = false;
        // eslint-disable-next-line react/no-direct-mutation-state
        this.state.focusedDrawResponse.label.visible = false;
        this.state.focusedDrawResponse.shape.sendToBack();
      }
      this.setState({
        focusedDrawResponse: newFocused
      })
    }
  }

  render() {
    return (
      <div className="App Admin">
        <Container fluid>
          <h2>Administration panel</h2>
          <div className="vom-results-data">
            <p>total responses: <Badge color="info">{this.state.original.length}</Badge></p>
            <p>showing: <Badge color="info">{this.state.data.length}</Badge></p>
            <p><Badge color="success" href="#" onClick={() => this.downloadData() }>download</Badge></p>
          </div>
          <div>
            <FilterPanel
              applyFilters={this.applyFilters}
            ></FilterPanel>
          </div>
          <div className="vom-canvii">
            <canvas id="vom-admin-canvas"></canvas>
            <div id="vom-results">
              <h4>Results</h4>
              <div id="vom-results-table" style={{height: this.state.height}}>
                {
                  this.state.selectedArea ? (
                    <>
                      <p>drawings in area: 
                        <Badge color="info">{this.state.selectedArea.length}</Badge> <Badge color="warning" href="#" onClick={() => this.clearDrawing() }>clear drawing</Badge> <Badge color="success" href="#" onClick={() => this.downloadResultsData() }>download results</Badge>
                      </p>
                      <DrawingsTable
                        items={this.state.selectedArea}
                        focusResponse={this.focuseDrawResponse}
                        hideResponse={this.hideDrawing}
                      />
                    </>
                  ) : (
                    <ResultsTable
                      data={this.state.data}
                      focusPath={this.focusPath}
                      clearFocus={this.clearFocus}
                    />
                  )
                }
              </div>
            </div>
          </div>
          <div className="vom-selected-data">
            {
              this.state.selectedArea ? (
                <>
                  <div>
                    
                  </div>
                  <SelectedAreaTable items={this.state.selectedArea}></SelectedAreaTable>
                </>
              ) : null
            }
          </div>
          {
            this.state.focusedResponse ? (
              <div id="vom-results-panel">
                <div id="vom-focused-result" className="mt-3">
                  <h4>Showing:</h4>
                  <ViewResponse response={this.state.focusedResponse}/>
                </div>
              </div>
            ) : null
          }
        </Container>
      </div>
    )
  }
}

type SelectedAreaTotals = {
  age: {
    [k: string]: number,
    '1': number,
    '2': number,
    '3': number,
    '4': number,
    '5': number,
    '6': number
  },
  gender: {
    [k: string]: number,
    'female': number,
    'male': number,
    'other': number
  },
  levelEducation: {
    [k: string]: number,
    '1': number,
    '2': number,
    '3': number,
    '4': number
  }
}

const SelectedAreaTable: React.FunctionComponent<{items: paper.Item[]}> = ({ items }) => {
  const init = {
    age: {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
      '6': 0
    },
    gender: {
      'female': 0,
      'male': 0,
      'other': 0
    },
    levelEducation: {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0
    }
  };
  const [totals] = useState<SelectedAreaTotals>(items.reduce((totals, item) => {
    const data = item.data as ShapeData;
    const lvlEd = data.levelEducation ? data.levelEducation.reduce((tot, lvl) => {
      return {
        ...tot,
        [lvl]: totals.levelEducation[lvl] + 1
      }
    }, {}) : {};
    return data.age ? {
      age: {
        ...totals.age,
        [data.age]: totals.age[data.age] + 1
      },
      gender: {
        ...totals.gender,
        [data.gender]: totals.gender[data.gender] + 1
      },
      levelEducation: {
        ...totals.levelEducation,
        ...lvlEd
      }
    } : totals;
  }, { ...init }) || init)

  return (
    <>
      <h6>Age</h6>
      <Table bordered>
        <thead>
          <tr>
            <th>16-17</th>
            <th>18-25</th>
            <th>26-45</th>
            <th>46-65</th>
            <th>66-75</th>
            <th>75+</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            { Object.keys(totals.age).map((age, key) => (
              <td key={key}>{totals.age[age]}</td>
            ))}
          </tr>
        </tbody>
      </Table>
      <h6>Gender</h6>
      <Table bordered>
        <thead>
          <tr>
            <th>female</th>
            <th>male</th>
            <th>other</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            {
              Object.keys(totals.gender).map((gender, key) => (
                <td key={key}>{totals.gender[gender]}</td>
              ))
            }
          </tr>
        </tbody>
      </Table>
      <h6>Level of Education</h6>
      <Table bordered>
        <thead>
          <tr>
            <th>high school or lower</th>
            <th>bachelors</th>
            <th>masters</th>
            <th>doctorate</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            {
              Object.keys(totals.levelEducation).map((levelEducation, key) => (
                <td key={key}>{totals.levelEducation[levelEducation]}</td>
              ))
            }
          </tr>
        </tbody>
      </Table>
    </>
  )
}

type TableProps = { 
  data: StateData[], 
  focusPath: (id: number) => void,
  clearFocus: () => void,
};

const DrawingsTable: React.FunctionComponent<{
  items: paper.Item[],
  focusResponse: (i: ShapeData) => void,
  hideResponse: (i: paper.Item) => void
}> = ({ items, focusResponse, hideResponse }) => {
  const [focused, setFocused] = useState<{id?: number, shapeId?: number}>({id: undefined, shapeId: undefined});
  return (
    <Table bordered >
      <thead>
        <tr>
          <th></th>
          <th>#</th>
          <th>age</th>
          <th>G</th>
          <th>education</th>
          <th>birth place</th>
          <th>current place</th>
          <th>NN</th>
          <th>name</th>
          <th>example</th>
          <th>associations</th>
          <th>C</th>
          <th>F</th>
          <th>P</th>
          <th>T</th>
        </tr>
      </thead>
      <tbody>
        {
          items.map((item, key) => {
            const d = item.data as ShapeData;
            return d.gender ? (
              <tr 
                key={key}
                onClick={() => { 
                  focusResponse(d);
                  setFocused({
                    id: d.id,
                    shapeId: d.shapeId
                  })
                }}
                className={(focused.id === d.id && focused.shapeId === d.shapeId) ? 'data-focused' : ''}
              >
                <td><Badge href="#" onClick={() => { hideResponse(item) }}>X</Badge></td>
                <td>{d.id}</td>
                <td>{VALUES.AGE[d.age] || ''}</td>
                <td>{d.gender[0] || ''}</td>
                <td>{d.levelEducation.map(e => VALUES.EDUCATION[e] || '').join(', ')}</td>
                <td>{d.birthPlace}</td>
                <td>{d.currentPlace}</td>
                <td>{VALUES.NON_NATIVE[d.nonNative]  || '-'}</td>
                <td>{d.name}</td>
                <td>{d.soundExample || '-'}</td>
                <td>{d.associations.join(', ')}</td>
                <td>{d.correctness}</td>
                <td>{d.friendliness}</td>
                <td>{d.pleasantness}</td>
                <td>{d.trustworthiness}</td>
              </tr>
            ) : null
          })
        }
      </tbody>

    </Table>
  )
}

const ResultsTable: React.FunctionComponent<TableProps> = ({ data, focusPath, clearFocus }) => {
  const [ focused, setFocused ] = useState<number>();
  return (
    <>
    <div className="vom-results-table__actions">
      <Button onClick={() => {
        setFocused(undefined);
        clearFocus();
      }} outline>clear focus</Button>
    </div>
    <Table bordered className="vom-table-results">
      <thead>
        <tr>
          <th>#</th>
          <th>age</th>
          <th>G</th>
          <th>education</th>
          <th>birth place</th>
          <th>current place</th>
          <th>NN</th>
          <th>#</th>
          <th>name</th>
          <th>example</th>
          <th>associations</th>
          <th>C</th>
          <th>F</th>
          <th>P</th>
          <th>T</th>
        </tr>
      </thead>
      <tbody>
        {
          data.map(({ id, personalInformation, canvas }) => {
            return canvas.map(({ form }, i) => (
              <tr
                key={i}
                onClick={() => { focusPath(id); setFocused(id) }}
                className={
                  `${i === 0 ? 'main-row' : ''}
                   ${id === focused ? 'data-focused' : ''}
                  `
                }
              >
                {
                  i === 0 ? (
                    <>
                      <th rowSpan={canvas.length} scope="rowGroup">{id}</th>
                      <th rowSpan={canvas.length} scope="rowGroup">{VALUES.AGE[personalInformation.age]}</th>
                      <th rowSpan={canvas.length} scope="rowGroup">{personalInformation.gender[0]}</th>
                      <th rowSpan={canvas.length} scope="rowGroup">{personalInformation.levelEducation.map(e => VALUES.EDUCATION[e])}</th>
                      <th rowSpan={canvas.length} scope="rowGroup">{personalInformation.birthPlace}</th>
                      <th rowSpan={canvas.length} scope="rowGroup">{personalInformation.currentPlace}</th>
                      <th rowSpan={canvas.length} scope="rowGroup">{VALUES.NON_NATIVE[personalInformation.nonNative]  || '-'}</th>
                    </>
                  ) : null
                }
                <td>{i}</td>
                <td>{form.name}</td>
                <td>{form.soundExample || '-'}</td>
                <td>{form.associations.join(', ')}</td>
                <td>{form.correctness}</td>
                <td>{form.friendliness}</td>
                <td>{form.pleasantness}</td>
                <td>{form.trustworthiness}</td>
              </tr>
            ))
          })
        }
      </tbody>
    </Table>
    </>
  )
}

const FilterPanel: React.FunctionComponent<{
  applyFilters: (filters: Filters) => void
}> = ({ applyFilters }) => {

  const [filters, setFilters] = useState<Filters>({ 
    ...VALUES.FILTER,
    nonNative: undefined
  });
  const [activeFilters, setActiveFilters] = useState<FilterStatus>({
    age: true,
    gender: true,
    levelEducation: true,
    nonNative: false,
  });

  const isFilterActive = (field: FilterVal) => {
    return activeFilters[field]
  };

  const activateFilter = (field: FilterVal) => ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    const _filters = {
      ...activeFilters,
      [field]: target.checked
    }
    
    if (target.checked) {
      handleFilter({
        ...filters,
        [field]: VALUES.FILTER[field]
      });
    } else {
      handleFilter({
        ...filters,
        [field]: undefined
      })
    }
    setActiveFilters(_filters);
  }

  const selectAll = () => {
    handleFilter({ 
      ...VALUES.FILTER,
      nonNative: undefined
    })
  }

  const isChecked = (field: FilterVal, value: string) => {
    const values = filters[field];
    if (values){
      return includes(value, values);
    } else {
      return false
    }
  }

  const handleCheck = (field: FilterVal, value: string) => ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    const _filters = {
      ...filters,
      [field]: target.checked ? append(value, filters[field] || []) : without([ value ], filters[field] || [])
    };
    handleFilter(_filters)
  }

  const handleFilter = (_filters: Filters) => {
    applyFilters(_filters);
    setFilters(_filters)
  }

  return (
    <div id="vom-results-filters">
      <h4>
        Filters
        <div id="vom-filter-actions">
          <Button outline size="sm" color="secondary" onClick={selectAll}>Select all</Button>  
          <Button outline size="sm" color="secondary" onClick={() => handleFilter({ ...VALUES.CLEAN_FILTER })} disabled>Clear all</Button>  
        </div>
      </h4>

      <div className="vom-filter-switch-group mb-3">
      
        <div className="vom-filter-switch">
          <Switch id="age-switch" checked={isFilterActive('age')} onChange={activateFilter('age')}>
            <h6>
              Age
            </h6>
          </Switch>
          <Collapse isOpen={isFilterActive('age')}>
            <FormGroup className="vom-filter-group">
                {
                  (Object.keys(VALUES.AGE) as AgeVal[]).map(value => (
                    <FormGroup check inline key={value}>
                      <Label check>
                        <Input type="checkbox" checked={isChecked('age', value)} onChange={handleCheck('age', value)}/>{VALUES.AGE[value]}
                      </Label>
                    </FormGroup>
                  ))
                }
            </FormGroup>
          </Collapse>
        </div>

        <div className="vom-filter-switch">
          <Switch id="gender-switch" checked={isFilterActive('gender')} onChange={activateFilter('gender')}>
            <h6>Gender</h6>
          </Switch>
          <Collapse isOpen={isFilterActive('gender')}>
            <FormGroup className="vom-filter-group">
              {
                VALUES.GENDER.map(value => (
                  <FormGroup check inline key={value}>
                    <Label check>
                      <Input disabled={!isFilterActive('gender')} type="checkbox" checked={isChecked('gender', value)} onChange={handleCheck('gender', value)}/>{value}
                    </Label>
                  </FormGroup>
                ))
              }
            </FormGroup>
          </Collapse>
        </div>
        <div className="vom-filter-switch">
          <Switch id="education-switch" checked={isFilterActive('levelEducation')} onChange={activateFilter('levelEducation')}>
            <h6>Level of education</h6>
          </Switch>
          <Collapse isOpen={isFilterActive('levelEducation')}>
            <FormGroup className="vom-filter-group">
              {
                (Object.keys(VALUES.EDUCATION) as EducationVal[]).map(value => (
                  <FormGroup check inline key={value}>
                    <Label check>
                      <Input disabled={!isFilterActive('levelEducation')} type="checkbox" checked={isChecked('levelEducation', value)} onChange={handleCheck('levelEducation', value)}/>
                      {VALUES.EDUCATION[value]}
                    </Label>
                  </FormGroup>
                ))
              }
            </FormGroup>
          </Collapse>
        </div>
        <div className="vom-filter-switch">
          <Switch id="non-native-switch" checked={isFilterActive('nonNative')} onChange={activateFilter('nonNative')}>
            <h6> Non natives </h6>
          </Switch>
          <Collapse isOpen={isFilterActive('nonNative')}>
            <FormGroup className="vom-filter-group">
              {
                (Object.keys(VALUES.NON_NATIVE) as NonNativeVal[]).map(value => (
                  <FormGroup check inline key={value}>
                    <Label check>
                      <Input disabled={!isFilterActive('nonNative')} type="checkbox" checked={isChecked('nonNative', value)} onChange={handleCheck('nonNative', value)}/>{VALUES.NON_NATIVE[value]}
                    </Label>
                  </FormGroup>
                ))
              }
            </FormGroup>
          </Collapse>
        </div>
      </div>

    </div>
  )
}

const Switch: React.FunctionComponent<React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>> = ({ id, children , ...props}) => {
  return (
    <div className="custom-control custom-switch">
      <input type="checkbox" className="custom-control-input" id={id} {...props} />
      <label className="custom-control-label" htmlFor={id}>
        { children }
      </label>
    </div>
  )
};

const ViewResponse: React.FunctionComponent<{response: StateData}> = ({ response }) => {
  const {
    personalInformation,
    email,
    canvas
  } = response;

  return (
    <div className="vom-view-response">
      <ListGroup>
        <ListGroupItem>
          <b>Age</b>: {VALUES.AGE[personalInformation.age]}
        </ListGroupItem>
        <ListGroupItem>
          <b>Gender</b>: {personalInformation.gender}
        </ListGroupItem>
        <ListGroupItem>
          <b>Education</b>: {personalInformation.levelEducation.map(e => VALUES.EDUCATION[e]).join(', ')}
        </ListGroupItem>
        <ListGroupItem>
          <b>Birth Place</b>: {personalInformation.birthPlace}
        </ListGroupItem>
        <ListGroupItem>
          <b>Current Place</b>: {personalInformation.currentPlace}
        </ListGroupItem>
        <ListGroupItem>
          <b>Non Native?</b>: {VALUES.NON_NATIVE[personalInformation.nonNative]  || '-'}
        </ListGroupItem>
        <ListGroupItem>
          <b>email</b>: {email || '-'}
        </ListGroupItem>
        {
          canvas.map(({form}, i) => (
            <ListGroupItem key={i}>
              <b>Accent name</b>: {form.name} ({i})<br/>
              <b>Example</b>: {form.soundExample} <br/>
              <b>Associations</b>: {form.associations.join(', ')} <br/>
              <b>Correctness</b>: {form.correctness} <br/>
              <b>Friendliness</b>: {form.friendliness} <br/>
              <b>Pleasantness</b>: {form.pleasantness} <br/>
              <b>Trustworthiness</b>: {form.trustworthiness} <br/>
            </ListGroupItem>
          ))
        }
      </ListGroup>
    </div>
  )
}

export default Admin;