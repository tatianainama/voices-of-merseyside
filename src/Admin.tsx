import React, { useState } from 'react';
import { Container, Badge, FormGroup, Label, Input, Button, Collapse, Table } from 'reactstrap';
import Paper, { Path, PaperScope, Point, Group, Color } from 'paper';
import { without, append, isNil, identity, includes, is } from 'ramda';
import Axios from 'axios';
import VALUES, { AgeVal, GenderVal, NonNativeVal, Filters, FilterVal, FilterStatus, EducationVal } from './services';
import './Admin.css';

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

type StateData = {
  id: number,
  personalInformation: PersonalInformation,
  canvas: CanvasData[],
  group: paper.Group,
  email: string
};

type FormPath = {
  name: string,
  soundExample: string,
  associations: string[],
  correctness: number,
  friendliness: number,
  pleasantness: number,
  trustworthiness: number
}

type OriginalCanvasData = {
  form: FormPath,
  path: string,
}

type CanvasData = {
  form: FormPath,
  // path: paper.Group
};

type AdminState = {
  original: StateData[],
  data: StateData[],
  canvas?: paper.PaperScope
};

const mkPathLabel = (pathName: string, path: paper.Path) => {
  return new Paper.PointText({
    fillColor: '#4b505a',
    justification: 'center',
    fontWeight: 'bold',
    fontSize: '16px',
    point: path.bounds.center,
    content: pathName
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

const mkPath = (pathData: string, i: number): paper.Path => {
  const color = COLORS[i % COLORS.length];
  const _path = new Path();
  _path.importJSON(pathData);
  _path.strokeColor = new Color(color);
  _path.strokeWidth = 2;
  _path.fillColor = mkBgColor(color)
  return _path;
}

class Admin extends React.Component<{}, AdminState> {

  constructor(props: any) {
    super(props);
    this.state = {
      canvas: undefined,
      original: [],
      data: [],
    };
  }

  mkPathGroup = (data: OriginalCanvasData[], index: number, canvas: paper.PaperScope, originalCanvas: { width: number, height: number}) => {
    const _data = data.reduce<(paper.Path|paper.Item)[]>((group, value) => {
      const _path = mkPath(value.path, index);
      _path.scale(canvas.view.viewSize.width / originalCanvas.width, new Point(0, 0));
      const _text = mkPathLabel(value.form.name, _path);
      return [
        ...group,
        _path,
        _text,
      ]
    }, []);
    const group = new Group(_data);
    return group;
  }

  componentDidMount = () => {
    const canvas = new PaperScope();
    canvas.setup('vom-admin-canvas');
    canvas.view.viewSize.height = canvas.view.size.width * 1.25;
    // Axios.get<Result[]>('/backend/').then(response => {
    Axios.get<Result[]>('https://voicesofmerseyside.inama.dev/backend/').then(response => {
      const _data = response.data.map((result, index) => {
        return {
          ...result,
          group: this.mkPathGroup(result.canvas, index, canvas, result.canvasSize),
        };
      })
      this.setState({
        canvas,
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
          result.group.visible = true;
          return true
        } else {
          result.group.visible = false;
          return false;
        }
      }
    )
    this.setState({
      data: results
    })
  }

  render() {
    return (
      <div className="App Admin">
        <Container fluid>
          <h2>Administration panel</h2>
          <div className="vom-results-data">
            <p>total responses: <Badge color="info">{this.state.original.length}</Badge></p>
            <p>showing: <Badge color="info">{this.state.data.length}</Badge></p>
          </div>
          <div id="vom-results">
            <canvas id="vom-admin-canvas"></canvas>
            <FilterPanel
              applyFilters={this.applyFilters}
            ></FilterPanel>
            <div id="vom-results-table">
              <h4>Results</h4>
              <ResultsTable data={this.state.data}></ResultsTable>
            </div>
          </div>
        </Container>
      </div>
    )
  }
}

const ResultsTable: React.FunctionComponent<{ data: StateData[] }> = ({ data }) => {
  return (
    <Table dark>
      <thead>
        <tr>
          <th>#</th>
          <th>age</th>
          <th>g</th>
          <th>education</th>
          <th>birth place</th>
          <th>current place</th>
          <th>non native</th>
          <th colSpan={7}>map</th>
        </tr>
        <tr>
          <th colSpan={7}></th>
          <th>accent name</th>
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
            return canvas.map(({ form }, i) => {
              return i === 0 ? (
                <tr key={i}>
                  <th rowSpan={canvas.length} scope="rowGroup">{id}</th>
                  <th rowSpan={canvas.length} scope="rowGroup">{VALUES.AGE[personalInformation.age]}</th>
                  <th rowSpan={canvas.length} scope="rowGroup">{personalInformation.gender[0]}</th>
                  <th rowSpan={canvas.length} scope="rowGroup">{personalInformation.levelEducation.map(e => VALUES.EDUCATION[e])}</th>
                  <th rowSpan={canvas.length} scope="rowGroup">{personalInformation.birthPlace}</th>
                  <th rowSpan={canvas.length} scope="rowGroup">{personalInformation.currentPlace}</th>
                  <th rowSpan={canvas.length} scope="rowGroup">{VALUES.NON_NATIVE[personalInformation.nonNative]  || '-'}</th>
                  <td>{form.name}</td>
                  <td>{form.soundExample}</td>
                  <td>{form.associations.join(', ')}</td>
                  <td>{form.correctness}</td>
                  <td>{form.friendliness}</td>
                  <td>{form.pleasantness}</td>
                  <td>{form.trustworthiness}</td>
                </tr>
              ) : (
                <tr key={i}>
                  <td>{form.name}</td>
                  <td>{form.soundExample}</td>
                  <td>{form.associations.join(', ')}</td>
                  <td>{form.correctness}</td>
                  <td>{form.friendliness}</td>
                  <td>{form.pleasantness}</td>
                  <td>{form.trustworthiness}</td>
                </tr>
              )
            })
          })
        }
      </tbody>
    </Table>
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

      <hr></hr>

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

      <hr/>

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

      <hr />
      
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

export default Admin;