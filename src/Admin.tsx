import React, { useState } from 'react';
import { Container, Badge, FormGroup, Label, Input, Button, Collapse } from 'reactstrap';
import Paper, { Path, PaperScope, Point, Group, Color } from 'paper';
import { equals, without, append, isNil, identity, includes } from 'ramda';
import Axios from 'axios';
import VALUES, { AgeVal, GenderVal, EthnicityVal, NonNativeVal, Filters, FilterVal, FilterStatus } from './services';

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
  canvasSize: {
    width: number,
    height: number
  },
  email: string
}

type PersonalInformation = Record<FilterVal, string> & {
  age: AgeVal,
  gender: GenderVal,
  genderCustom: string,
  ethnicity: EthnicityVal,
  ethnicityCustom: string,
  birthPlace: string,
  currentPlace: string,
  nonNative: NonNativeVal
}

type StateData = {
  personalInformation: PersonalInformation,
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
    Axios.get<Result[]>('/backend/').then(response => {
    // Axios.get<Result[]>('http://127.0.0.1/backend/').then(response => {
      const _data = response.data.map((result, index) => {
        return {
          ...result,
          canvas: undefined,
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

  applyFilters = (filters: Filters) => {
    const results = this.state.original.filter(
      result => {
        const matches = VALUES.FILTER_KEYS.map(filterKey => {
          const appliedFilter = filters[filterKey];
          if (appliedFilter) {
            return !isNil(filters[filterKey]?.find(equals<string>(result.personalInformation[filterKey])))
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

  const [filters, setFilters] = useState<Filters>({ 
    ...VALUES.FILTER,
    nonNative: undefined
  });
  const [activeFilters, setActiveFilters] = useState<FilterStatus>({
    age: true,
    ethnicity: true,
    gender: true,
    nonNative: false
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

      <Switch id="ethnicity-switch" checked={isFilterActive('ethnicity')} onChange={activateFilter('ethnicity')}>
        <h6>ethnicity</h6>
      </Switch>
      <Collapse isOpen={isFilterActive('ethnicity')}>
        <FormGroup className="vom-filter-group">
          {
            VALUES.ETHNICITY.map(value => (
              <FormGroup check inline key={value}>
                <Label check>
                  <Input disabled={!isFilterActive('ethnicity')} type="checkbox" checked={isChecked('ethnicity', value)} onChange={handleCheck('ethnicity', value)}/>{value}
                </Label>
              </FormGroup>
            ))
          }
        </FormGroup>
      </Collapse>
      <hr/>
      
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