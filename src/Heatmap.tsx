import React, { Component } from 'react';
import { Path, PaperScope, Point, Size, Rectangle, Color, Layer } from 'paper';
import { Container, CustomInput, FormGroup, Label, Row, Col } from 'reactstrap';
import './Heatmap.css';

const X_SEGMENTS = 25;
const Y_SEGMENTS = X_SEGMENTS * 1.25;
const MAX = 200;
const output_start = 0,
      output_end = 240,
      input_start = 1,
      input_end = 5;
const RANGE = (n: number) => output_start + ((output_end - output_start) / (input_end - input_start)) * (n - input_start);


type Grid = Array<Array<{
  area: paper.Path.Rectangle,
  items: Array<paper.Item>
}>>

type HeatmapData = {
  id: [number, number],
  correctness: number,
  friendliness: number,
  pleasantness: number,
  trustworthiness: number
}

enum HeatmapType {
  Amount = 'amount',
  Friendliness = 'friendliness',
  Correctness = 'correctness',
  Pleasantness = 'pleasantness',
  Trustworthiness = 'trustworthiness'
}

class Heatmap extends Component<HeatmapProps, HeatmapState> {
  
  constructor(props: HeatmapProps) {
    super(props);

    this.state = {
      data: [],
      canvas: undefined,
      grid: [],
      heatmapType: HeatmapType.Amount,
      heatmapLayers: {
        amount: undefined,
        correctness: undefined,
        friendliness: undefined,
        pleasantness: undefined,
        trustworthiness: undefined
      }
    }
  }

  drawShape = (path: string, scale: number, data: HeatmapData) => {
    const _path = new Path();
    _path.importJSON(path);
    _path.scale(scale, new Point(0, 0));
    _path.data = data;
    _path.strokeWidth = 0.5;
    _path.selected = false;
    return _path;
  }

  drawMapData = (data: Result[], canvasWidth: number) => {
    const _data = data.reduce<Array<HeatmapData>>((newData, result) => {
      return [
        ...newData,
        ...result.canvas.map((shape, shapeId) => {
          let data: HeatmapData = {
            id: [result.id, shapeId],
            correctness: shape.form.correctness,
            friendliness: shape.form.friendliness,
            pleasantness: shape.form.pleasantness,
            trustworthiness: shape.form.trustworthiness,
          }
          this.drawShape(shape.path, canvasWidth / result.canvasSize.width, data);
          return data as HeatmapData;
        })
      ]
    }, [])
    return _data;
  }

  mkGrid = (canvas: paper.PaperScope): Grid=> {
    const width = canvas.view.size.width,
          height = canvas.view.size.height;
    const gridSectionSize = new Size(width/X_SEGMENTS, height/Y_SEGMENTS);
    let grid: Grid = [];

    for(let row = 0; row < Y_SEGMENTS; row ++) {
      grid[row] = [];

      for(let column = 0; column < X_SEGMENTS; column ++) {
        let rect = new Rectangle({
          point: [column * gridSectionSize.width, row * gridSectionSize.height],
          size: gridSectionSize,
        });

        grid[row][column] = {
          area: new Path.Rectangle(rect),
          items: canvas.project.activeLayer.getItems({
            overlapping: rect
          })
        }
      }
    }
    return grid;
  }

  heatmapByAmount = (grid: Grid) => {
    if (this.state.heatmapLayers.amount === undefined) {
      const newLayer = new Layer({ name: 'amount' });
      grid.forEach(section => {
        section.forEach(({ area, items }) => {
          const newArea = area.clone();
          newArea.fillColor = new Color(`rgb(${items.length}, ${items.length}, ${items.length})`)
          newLayer.addChild(newArea);
        })
      });
      this.setState({
        heatmapLayers: {
          ...this.state.heatmapLayers,
          amount: newLayer
        }
      })
    } else {
      this.state.canvas!.project.layers.forEach(l => {
        if (l.name === 'amount') {
          l.visible = true;
        } else {
          l.visible = false
        }
      })
    }
  }

  heatmapBy = (key: 'correctness' | 'friendliness' | 'pleasantness' | 'trustworthiness', grid: Grid) => {    
    if (this.state.heatmapLayers[key] === undefined) {
      const newLayer = new Layer({ name: key });
      grid.forEach(section => {
        section.forEach(({area, items}) => {
          const newArea = area.clone();
          const total = items.reduce<number>((tot, item) => {
            return item.data[key] ? tot + item.data[key] : tot;
          }, 0);
          if (total !== 0) {
            newArea.fillColor = new Color({ hue: RANGE(total / items.length), saturation: 1, brightness: items.length/MAX})
          } else {
            newArea.fillColor = new Color('black')
          }
          newLayer.addChild(newArea);
        })
      });
      this.setState({
        heatmapLayers: {
          ...this.state.heatmapLayers,
          [key]: newLayer
        }
      })
    } else {
      this.state.canvas!.project.layers.forEach(l => {
        if (l.name === key) {
          l.visible = true;
        } else {
          l.visible = false;
        }
      })
    }
  }

  changeHeatmapType = (type: HeatmapType) => {
    this.setState({
      heatmapType: type
    });
    if (type === HeatmapType.Amount) {
      this.heatmapByAmount(this.state.grid)
    } else {
      this.heatmapBy(type, this.state.grid)
    }
  }

  componentDidMount = () => {
    const canvas = new PaperScope();
    canvas.setup('vom-heatmap-canvas');
    canvas.view.viewSize.height = canvas.view.size.width * 1.25;
    const data = this.drawMapData(this.props.data, canvas.view.size.width);
    const grid = this.mkGrid(canvas);
    this.heatmapByAmount(grid);
    this.setState({
      data,
      canvas,
      grid,
    })
  }

  render = () => (
    <Container className="vom-heatmap">
      <Row>
        <Col xs="12" md="8">
          <div className="vom-heatmap-map">
            {
              this.state.heatmapType !== HeatmapType.Amount ? (
                <div id="vom-heatmap-range">
                  <div>1</div>
                  <div>2</div>
                  <div>3</div>
                  <div>4</div>
                  <div>5</div>
                </div>
              ) : null
            }
            <canvas id="vom-heatmap-canvas"></canvas>
          </div>
        </Col>
        <Col>
          <div className="vom-heatmap-actions">
            <FormGroup>
              <h4>Heatmap type</h4> 
              <div>
                <CustomInput type="radio" id="heatmap-by-amount" name="by-amount" 
                  label="by amount of responses"
                  value={HeatmapType.Amount}
                  checked={this.state.heatmapType === HeatmapType.Amount}
                  onChange={ e => { this.changeHeatmapType(e.currentTarget.value as HeatmapType)}}
                />
                <CustomInput type="radio" id="heatmap-by-friendliness" name="by-friendliness"
                  label="by friendliness"
                  value={HeatmapType.Friendliness}
                  checked={this.state.heatmapType === HeatmapType.Friendliness}
                  onChange={ e => { this.changeHeatmapType(e.currentTarget.value as HeatmapType)}}
                />
                <CustomInput type="radio" id="heatmap-by-correctness" name="by-correctness"
                  label="by correctness"
                  value={HeatmapType.Correctness}
                  checked={this.state.heatmapType === HeatmapType.Correctness}
                  onChange={ e => { this.changeHeatmapType(e.currentTarget.value as HeatmapType)}}
                />
                <CustomInput type="radio" id="heatmap-by-pleasantness" name="by-pleasantness"
                  label="by pleasantness"
                  value={HeatmapType.Pleasantness}
                  checked={this.state.heatmapType === HeatmapType.Pleasantness}
                  onChange={ e => { this.changeHeatmapType(e.currentTarget.value as HeatmapType)}}
                />
                <CustomInput type="radio" id="heatmap-by-trustworthiness" name="by-trustworthiness"
                  label="by trustworthiness"
                  value={HeatmapType.Trustworthiness}
                  checked={this.state.heatmapType === HeatmapType.Trustworthiness}
                  onChange={ e => { this.changeHeatmapType(e.currentTarget.value as HeatmapType)}}
                />
              </div>
            </FormGroup>
          </div>
        </Col>
      </Row>
    </Container>
  )
}

type PersonalInformation = {
  age: string,
  gender: string,
  genderCustom: string,
  birthPlace: string,
  currentPlace: string,
  levelEducation: string[],
  nonNative: string,
}

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

type HeatmapProps = {
  data: Result[],
}

type HeatmapState = {
  data: HeatmapData[],
  canvas?: paper.PaperScope,
  grid: Grid,
  heatmapType: HeatmapType,
  heatmapLayers: {
    amount: paper.Layer | undefined,
    friendliness: paper.Layer | undefined,
    correctness: paper.Layer | undefined,
    pleasantness: paper.Layer | undefined,
    trustworthiness: paper.Layer | undefined,
  }
}


export default Heatmap;