import React, { useState } from 'react';
import { Container, Badge, FormGroup, Label, Input } from 'reactstrap';
import Paper, { Path, PaperScope, Group } from 'paper';
import { equals, without, append } from 'ramda';
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
const ETHNICITY = [
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
    nonNative: string
  },
  canvas: OriginalCanvasData[],
  email: string
}

type StateData = {
  personalInformation: {
    age: AgeVal,
    gender: GenderVal,
    genderCustom: string,
    ethnicity: EthnicityVal,
    ethnicityCustom: string,
    birthPlace: string,
    currentPlace: string,
    nonNative: string
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

class Admin extends React.Component<{}, AdminState> {

  constructor(props: any) {
    super(props);
    this.state = {
      canvas: undefined,
      data: []
    };
  }

  mkPathGroup = (data: OriginalCanvasData[]) => {
    const _data = data.reduce<(paper.Path|paper.Item)[]>((group, value) => {
      const _path = new Path();
      _path.importJSON(value.path);
      const _text = mkPathLabel(value.form.name, _path);
      return [
        ...group,
        _path,
        _text,
      ]
    }, []);
    return new Group(_data);
  }

  componentDidMount = () => {
    const canvas = new PaperScope();
    canvas.setup('vom-admin-canvas');

    Axios.get<Result[]>('https://voicesofmerseyside.inama.dev/backend/').then(response => {
      const _data = response.data.map(result => {
        return {
          ...result,
          canvas: undefined,
          group: this.mkPathGroup(result.canvas)
        };
      })
      this.setState({
        canvas,
        data: _data,
      })
    })
  }

  render() {
    return (
      <div className="App Admin">
        <Container fluid>
          <h2>Administration panel</h2>
          <p>total responses: <Badge color="info">{this.state.data.length}</Badge></p>
          <div id="vom-results">
            <canvas id="vom-admin-canvas"></canvas>
            <FilterPanel></FilterPanel>
          </div>
        </Container>
      </div>
    )
  }
}

const FilterPanel = () => {
  const [filters, setFilters] = useState<{
    [x: string]: string[]
  }>({
    age: [ '1', '2', '3', '4', '5', '6' ],
    gender: [ 'female', 'male', 'other'],
    ethnicity: [...ETHNICITY],
    nonNative: ['1', '2', '3', '4']
  });

  const isChecked = (field: string, value: string) => {
    return !!filters[field].find(equals(value));
  }

  const handleCheck = (field: string, value: string) => ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      [field]: target.checked ? append(value, filters[field]) : without([ value ], filters[field])
    })
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