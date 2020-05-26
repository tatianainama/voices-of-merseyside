import React, { Component } from 'react';
import { Path, PaperScope, Point, Size, Rectangle, Color, Layer, Raster, PointText } from 'paper';
import { Container, CustomInput, FormGroup, Row, Col, Button } from 'reactstrap';
import FileSaver from 'file-saver';
import map from './merseyside-nobg-white.png';

import './Heatmap.css';

const X_SEGMENTS = 36;
const Y_SEGMENTS = X_SEGMENTS * 1.25;
const MAX = 200;
const output_start = 0,
      output_end = 240,
      input_start = 1,
      input_end = 5;
const RANGE = (n: number) => output_start + ((output_end - output_start) / (input_end - input_start)) * (n - input_start);


type Grid = Array<{
  area: paper.Path.Rectangle,
  items: Array<paper.Item>
}>

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
      mapLayer: undefined,
      areaAmount: undefined,
      heatmapType: HeatmapType.Amount,
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

  mkGrid = (canvas: paper.PaperScope): Grid => {
    const width = canvas.view.size.width,
          height = canvas.view.size.height;
    const gridSectionSize = new Size(width/X_SEGMENTS, height/Y_SEGMENTS);
    let grid: Grid = [];

    for(let row = 0; row < Y_SEGMENTS; row ++) {
      for(let column = 0; column < X_SEGMENTS; column ++) {
        let rect = new Rectangle({
          point: [column * gridSectionSize.width, row * gridSectionSize.height],
          size: gridSectionSize,
        });

        const area = new Path.Rectangle(rect);
        const items = canvas.project.activeLayer.getItems({
          overlapping: rect
        })
        
        grid.push({area, items});
      }
    }
    return grid;
  }

  mkFillColor = (key: HeatmapType, items: paper.Item[]) => {
    if (key === HeatmapType.Amount) {
      return new Color(`rgb(${items.length}, ${items.length}, ${items.length})`);
    } else {
      const total = items.reduce<number>((tot, item) => {
        return item.data[key] ? tot + item.data[key] : tot;
      }, 0);
      return total !== 0 ? 
        new Color({ hue: RANGE(total / items.length), saturation: 1, brightness: items.length/MAX}) : 
        new Color('black')
    }
  }

  changeHeatmapColor = (type: HeatmapType, grid: Grid) => {
    grid.forEach(({area, items}) => {
      area.fillColor = this.mkFillColor(type, items);
    })
    this.setState({
      heatmapType: type
    })
  }

  showMap = (canvas: paper.PaperScope) => {
    if (this.state.mapLayer) {
      this.state.mapLayer.bringToFront();
    } else {
      const mapLayer = new Layer({ name: 'mapLayer' });
      const raster = new Raster(map);
      raster.onLoad = () => {
        raster.position = canvas.view.center;
        raster.size = canvas.view.viewSize;
      }
      mapLayer.addChild(raster);
      mapLayer.bringToFront();
      this.setState({ mapLayer });
    }
  }

  saveAsImage = () => {
    const canvas = document.getElementById("vom-heatmap-canvas");
    //@ts-ignore
    canvas.toBlob((blob) => {
      FileSaver.saveAs(blob, `vom-${this.state.heatmapType}.png`);
    })
  }

  componentDidMount = () => {
    const canvas = new PaperScope();
    canvas.setup('vom-heatmap-canvas');
    canvas.view.viewSize.height = canvas.view.size.width * 1.25;
    const data = this.drawMapData(this.props.data, canvas.view.size.width);
    const grid = this.mkGrid(canvas);
    this.changeHeatmapColor(HeatmapType.Amount, grid);
    this.showMap(canvas);
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
              ) : (
                <div id="vom-heatmap-amount-range">
                  <div>1</div>
                  <div>200</div>
                </div>
              )
            }
            <canvas id="vom-heatmap-canvas"></canvas>
          </div>
        </Col>
        <Col>
          <div className="vom-heatmap-actions">
            <FormGroup>
              <Button size="sm" onClick={() => {this.saveAsImage()} }>download current map</Button>
              <h4>Heatmap type</h4> 
              <div>
                <CustomInput type="radio" id="heatmap-by-amount" name="by-amount" 
                  label="by amount of responses"
                  value={HeatmapType.Amount}
                  checked={this.state.heatmapType === HeatmapType.Amount}
                  onChange={ e => { this.changeHeatmapColor(e.currentTarget.value as HeatmapType, this.state.grid)}}
                />
                <CustomInput type="radio" id="heatmap-by-friendliness" name="by-friendliness"
                  label="by friendliness"
                  value={HeatmapType.Friendliness}
                  checked={this.state.heatmapType === HeatmapType.Friendliness}
                  onChange={ e => { this.changeHeatmapColor(e.currentTarget.value as HeatmapType, this.state.grid)}}
                />
                <CustomInput type="radio" id="heatmap-by-correctness" name="by-correctness"
                  label="by correctness"
                  value={HeatmapType.Correctness}
                  checked={this.state.heatmapType === HeatmapType.Correctness}
                  onChange={ e => { this.changeHeatmapColor(e.currentTarget.value as HeatmapType, this.state.grid)}}
                />
                <CustomInput type="radio" id="heatmap-by-pleasantness" name="by-pleasantness"
                  label="by pleasantness"
                  value={HeatmapType.Pleasantness}
                  checked={this.state.heatmapType === HeatmapType.Pleasantness}
                  onChange={ e => { this.changeHeatmapColor(e.currentTarget.value as HeatmapType, this.state.grid)}}
                />
                <CustomInput type="radio" id="heatmap-by-trustworthiness" name="by-trustworthiness"
                  label="by trustworthiness"
                  value={HeatmapType.Trustworthiness}
                  checked={this.state.heatmapType === HeatmapType.Trustworthiness}
                  onChange={ e => { this.changeHeatmapColor(e.currentTarget.value as HeatmapType, this.state.grid)}}
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
  mapLayer: paper.Layer | undefined,
  areaAmount: paper.TextItem | undefined,
  heatmapType: HeatmapType,
}


export default Heatmap;