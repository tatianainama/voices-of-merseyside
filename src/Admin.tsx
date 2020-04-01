import React, { useState } from 'react';
import { Container, Badge, FormGroup, Label, Input } from 'reactstrap';
import Paper, { Path, PaperScope, Group, Color } from 'paper';
import { equals, without, append, isNil, not, identity } from 'ramda';
import Axios from 'axios';

type AgeVal = '1' | '2' | '3' | '4' | '5' | '6';
type GenderVal = 'female' | 'male' | 'other';
type EthnicityVal =
  'English/Welsh/Scottish/Northern Irish/British' |
  'Irish' |
  'Gypsy or Irish Traveller' |
  'White and Black Caribbean' |
  'White and Black African' |
  'White and Asian' |
  'Indian' |
  'Pakistani' |
  'Bangladeshi' |
  'Chinese' |
  'African' |
  'Caribbean' |
  'Arab' |
  'other';
  
type NonNativeVal = '1' | '2' | '3' | '4';

const AGE_MAP: {
  [x: string]: string,
} = {
  '1': '11 - 17',
  '2': '18 - 25',
  '3': '26 - 45',
  '4': '46 - 65',
  '5': '66 - 75',
  '6': '75+'
};

const NON_NATIVE_MAP: {
  [x: string]: string,
} = {
  '1': 'Less than two years',
  '2': '3-5 years',
  '3': '6-10 years',
  '4': '10+ years'
}

const GENDER = [ 'female', 'male', 'other' ];
const ETHNICITY: EthnicityVal[] = [
  'English/Welsh/Scottish/Northern Irish/British',
  'Irish',
  'Gypsy or Irish Traveller',
  'White and Black Caribbean',
  'White and Black African',
  'White and Asian',
  'Indian',
  'Pakistani',
  'Bangladeshi',
  'Chinese',
  'African',
  'Caribbean',
  'Arab',
  'other'
];

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
    const result = this.state.original.filter(
      result => {
        const matches = keys.map(k => {
          if ( k !== 'nonNative') {
            return !isNil(filters[k].find(equals(result.personalInformation[k])))
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
      data: result
    })
    console.log("filter, original", result, this.state.original);
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

type Filters = {
  [filter: string]: string[],
  age: AgeVal[],
  gender: GenderVal[],
  ethnicity: EthnicityVal[],
  nonNative: NonNativeVal[]
}

const FilterPanel: React.FunctionComponent<{
  applyFilters: (filters: Filters) => void
}> = ({ applyFilters }) => {
  const [filters, setFilters] = useState<Filters>({
    age: [ '1', '2', '3', '4', '5', '6' ],
    gender: [ 'female', 'male', 'other'],
    ethnicity: [...ETHNICITY],
    nonNative: ['1', '2', '3', '4']
  });

  const isChecked = (field: string, value: string) => {
    return !!filters[field].find(equals(value));
  }

  const handleCheck = (field: string, value: string) => ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    const _filters = {
      ...filters,
      [field]: target.checked ? append(value, filters[field]) : without([ value ], filters[field])
    };
    applyFilters(_filters);
    setFilters(_filters)
  }

  return (
    <div id="vom-results-filters">
      <h4>Filters</h4>
      <h6>Age</h6>
      <FormGroup className="vom-filter-group">
        {
          Object.keys(AGE_MAP).map(value => (
            <FormGroup check inline key={value}>
              <Label check>
                <Input type="checkbox" checked={isChecked('age', value)} onChange={handleCheck('age', value)}/>{AGE_MAP[value]}
              </Label>
            </FormGroup>
          ))
        }
      </FormGroup>

      <h6>Gender</h6>
      <FormGroup className="vom-filter-group">
        {
          GENDER.map(value => (
            <FormGroup check inline key={value}>
              <Label check>
                <Input type="checkbox" checked={isChecked('gender', value)} onChange={handleCheck('gender', value)}/>{value}
              </Label>
            </FormGroup>
          ))
        }
      </FormGroup>

      <h6>ethnicity</h6>
      <FormGroup className="vom-filter-group">
        {
          ETHNICITY.map(value => (
            <FormGroup check inline key={value}>
              <Label check>
                <Input type="checkbox" checked={isChecked('ethnicity', value)} onChange={handleCheck('ethnicity', value)}/>{value}
              </Label>
            </FormGroup>
          ))
        }
      </FormGroup>

      <h6>
        Non natives
      </h6>
      <FormGroup className="vom-filter-group">
        {
          Object.keys(NON_NATIVE_MAP).map(value => (
            <FormGroup check inline key={value}>
              <Label check>
                <Input type="checkbox" checked={isChecked('nonNative', value)} onChange={handleCheck('nonNative', value)}/>{NON_NATIVE_MAP[value]}
              </Label>
            </FormGroup>
          ))
        }
      </FormGroup>

    </div>
  )
}

export default Admin;