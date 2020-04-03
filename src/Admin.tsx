import React, { useState } from 'react';
import { Container, Badge, FormGroup, Label, Input, Button } from 'reactstrap';
import Paper, { Path, PaperScope, Group, Color } from 'paper';
import { equals, without, append, isNil, identity } from 'ramda';
import Axios from 'axios';
import VALUES, { AgeVal, GenderVal, EthnicityVal, NonNativeVal, Filters } from './services';

type Result = {
  personalInformation: {
    age: AgeVal,
    gender: GenderVal,
    genderCustom: string,
    ethnicity: EthnicityVal,
    ethnicityCustom: string,
    birthPlace: string,
    currentPlace: string,
    nonNative: NonNativeVal
  },
  canvas: OriginalCanvasData[],
  email: string
}

type StateData = {
  personalInformation: {
    [key: string]: string,
    age: AgeVal,
    gender: GenderVal,
    genderCustom: string,
    ethnicity: EthnicityVal,
    ethnicityCustom: string,
    birthPlace: string,
    currentPlace: string,
    nonNative: NonNativeVal
  },
  canvas?: CanvasData[],
  group: paper.Group,
  email: string
};

type FormPath = {
  name: 'string',
  soundExample: 'string',
  associations: 'string'
}

type OriginalCanvasData = {
  form: FormPath,
  path: string,
}

type CanvasData = {
  form: FormPath,
  path: paper.Path
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
  _color.alpha = 0.5;
  return _color;
};

const mkPath = (pathData: string, i: number): paper.Path => {
  const color = COLORS[i % COLORS.length];
  const _path = new Path();
  _path.importJSON(pathData);
  _path.strokeColor = new Color(color);
  _path.strokeWidth = 5;
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

  mkPathGroup = (data: OriginalCanvasData[], index: number) => {
    const _data = data.reduce<(paper.Path|paper.Item)[]>((group, value) => {
      const _path = mkPath(value.path, index);
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

    Axios.get<Result[]>('https://voicesofmerseyside.inama.dev/backend/').then(response => {
      const _data = response.data.map((result, index) => {
        return {
          ...result,
          canvas: undefined,
          group: this.mkPathGroup(result.canvas, index)
        };
      })
      this.setState({
        canvas,
        original: _data,
        data: _data,
      })
    })
  }

  applyFilters = (filters: Filters) => {
    const keys = Object.keys(filters);
    const results = this.state.original.filter(
      result => {
        const matches = keys.map(k => {
          if ( k !== 'nonNative') {
            return !isNil(filters[k].find(equals(result.personalInformation[k])));
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
          </div>
        </Container>
      </div>
    )
  }
}

const FilterPanel: React.FunctionComponent<{
  applyFilters: (filters: Filters) => void
}> = ({ applyFilters }) => {

  const [filters, setFilters] = useState<Filters>({ ...VALUES.FILTER });

  const isChecked = (field: string, value: string) => {
    return !!filters[field].find(equals(value));
  }

  const handleCheck = (field: string, value: string) => ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    const _filters = {
      ...filters,
      [field]: target.checked ? append(value, filters[field]) : without([ value ], filters[field])
    };
    handleFilter(_filters)
  }

  const handleFilter = (filters: Filters) => {
    applyFilters(filters);
    setFilters(filters)
  }

  return (
    <div id="vom-results-filters">
      <h4>
        Filters
        <div id="vom-filter-actions">
          <Button outline size="sm" color="secondary" onClick={() => handleFilter({ ...VALUES.FILTER })}>Select all</Button>  
          <Button outline size="sm" color="secondary" onClick={() => handleFilter({ ...VALUES.CLEAN_FILTER })} disabled>Clear all</Button>  
        </div>
      </h4>
      <h6>
        Age
      </h6>
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

      <hr></hr>

      <h6>Gender</h6>
      <FormGroup className="vom-filter-group">
        {
          VALUES.GENDER.map(value => (
            <FormGroup check inline key={value}>
              <Label check>
                <Input type="checkbox" checked={isChecked('gender', value)} onChange={handleCheck('gender', value)}/>{value}
              </Label>
            </FormGroup>
          ))
        }
      </FormGroup>

      <hr/>
      <h6>ethnicity</h6>
      <FormGroup className="vom-filter-group">
        {
          VALUES.ETHNICITY.map(value => (
            <FormGroup check inline key={value}>
              <Label check>
                <Input type="checkbox" checked={isChecked('ethnicity', value)} onChange={handleCheck('ethnicity', value)}/>{value}
              </Label>
            </FormGroup>
          ))
        }
      </FormGroup>
        <hr/>
      <h6>
        Non natives
      </h6>
      <FormGroup className="vom-filter-group">
        {
          (Object.keys(VALUES.NON_NATIVE) as NonNativeVal[]).map(value => (
            <FormGroup check inline key={value}>
              <Label check>
                <Input type="checkbox" checked={isChecked('nonNative', value)} onChange={handleCheck('nonNative', value)}/>{VALUES.NON_NATIVE[value]}
              </Label>
            </FormGroup>
          ))
        }
      </FormGroup>

    </div>
  )
}

export default Admin;