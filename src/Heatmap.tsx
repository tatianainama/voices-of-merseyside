import React, { Component } from 'react';
import { Path, PaperScope, Point, Size, Rectangle, Color, Layer, Raster } from 'paper';
import { Container, CustomInput, FormGroup, Row, Col, Button } from 'reactstrap';
import FileSaver from 'file-saver';
import map from './merseyside-nobg-white.png';

import './Heatmap.css';

const X_SEGMENTS = 12;
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
  canvas: {
    form: FormPath,
    path: paper.Path
  }[],
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
  heatmapLayer: paper.Layer | undefined,
  mapLayer: paper.Layer | undefined,
  gridLayer: paper.Layer | undefined,
  areaAmount: paper.TextItem | undefined,
  heatmapType: HeatmapType,
}


class Heatmap extends Component<HeatmapProps, HeatmapState> {
  
  constructor(props: HeatmapProps) {
    super(props);
    
    this.state = {
      data: [],
      canvas: undefined,
      grid: [],
      heatmapLayer: undefined,
      mapLayer: undefined,
      gridLayer: undefined,
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
    _path.visible = false;
    return _path;
  }
  
  addshape = (path: paper.Path, data: HeatmapData, canvas: paper.PaperScope) => {
    const _path = new canvas.Path(path.segments);
    _path.data = data;
    canvas.project.layers[0].addChild(_path);
  }

  drawMapData = (data: Result[], canvas: paper.PaperScope) => {
    canvas.project.layers[0]?.removeChildren();
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
          this.addshape(shape.path, data, canvas);
          return data as HeatmapData;
        })
      ]
    }, [])
    return _data;
  }
  
  mkChunk = (xCount: number, yCount: number, parent: paper.Rectangle, group: paper.Group): {rectangle: paper.Rectangle, items: paper.Item[]}[] => {
    let chunks = [];
    const width = parent.width / xCount;
    const height = parent.height / yCount;
    const size = new Size(width, height);
    for(let y = 0; y < yCount; y++){
      for(let x = 0; x < xCount; x++){
        let rectangle = new Rectangle({
          point: [(x*width)+parent.left, (y*height)+parent.top],
          size,
        });
        const items = group.getItems({overlapping: rectangle})
        chunks.push({rectangle, items});
      }
    }
    
    return chunks;
  }
  
  mkGrid = (canvas: paper.PaperScope, itemsLayer: paper.Layer): { grid: Grid, layer: paper.Layer } => {
    const bigChunkSizeX = 4, bigChunkSizeY = 5;
    let layer = new canvas.Layer({ name: 'heatmap' });
    const grid = this.mkChunk(bigChunkSizeX*X_SEGMENTS, Y_SEGMENTS*bigChunkSizeY, canvas.project.view.bounds, itemsLayer).map(({rectangle, items}) => {
      let area = new canvas.Path.Rectangle(rectangle);
      layer.addChild(area);
      return {
        area,
        items
      }
    });
    return {
      grid,
      layer
    }
    // this.mkChunk(bigChunkSizeX, bigChunkSizeY, canvas.project.view.bounds, mainLayer, true).forEach((chunk, i) => {
    //   const x = new Path.Rectangle(chunk.rectangle);
    //   console.log(x.bounds)
    //   x.strokeColor = new Color('red');
    //   x.strokeWidth = 3;
    //   const items = chunk.items;
    //   const group = new Group(items);
    //   this.mkChunk(X_SEGMENTS, Y_SEGMENTS, chunk.rectangle, group).forEach(smallchunk => {
    //     const area = new Path.Rectangle(smallchunk.rectangle);
    //     grid.push({
    //       area,
    //       items: smallchunk.items
    //     })
    //   });
    // });
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
    grid.forEach(({ area, items }) => {
      const color = this.mkFillColor(type, items);
      area.fillColor = color;
      area.strokeColor = color;
    })
  }
  
  showMap = (canvas: paper.PaperScope) => {
    if (this.state.mapLayer) {
      this.state.mapLayer.bringToFront();
      return this.state.mapLayer;
    } else {
      const mapLayer = new Layer({ name: 'mapLayer' });
      const raster = new Raster(map);
      raster.onLoad = () => {
        raster.position = canvas.view.center;
        raster.size = canvas.view.viewSize;
      }
      mapLayer.addChild(raster);
      mapLayer.bringToFront();
      return mapLayer;
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
    const data = this.drawMapData(this.props.data, canvas);
    const { grid, layer } = this.mkGrid(canvas, canvas.project.activeLayer);
    this.changeHeatmapColor(HeatmapType.Friendliness, grid);
    
    this.setState({
      data,
      canvas,
      grid,
      heatmapLayer: layer,
      heatmapType: HeatmapType.Friendliness,
      mapLayer: this.showMap(canvas)
    })
  }

  componentDidUpdate = (prev: HeatmapProps) => {
    if (prev.data.length !== this.props.data.length) {
      const canvas = this.state.canvas!;
      const data = this.drawMapData(this.props.data, canvas);
      this.state.heatmapLayer?.remove();
      const { grid, layer } = this.mkGrid(canvas, canvas.project.layers[0]);
      this.changeHeatmapColor(this.state.heatmapType, grid);
      this.showMap(canvas);
      this.setState({
        grid,
        heatmapLayer: layer,
        data,
      })
    }
  }

  handleChangeColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    const heatmapType = e.currentTarget.value as HeatmapType;
    this.changeHeatmapColor(heatmapType, this.state.grid);
    this.setState({
      heatmapType
    });
  }
  
  render = () => (
    <div className="vom-heatmap">
      <div className="vom-heatmap-map">
        <canvas id="vom-heatmap-canvas"></canvas>
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
      </div>
      <div className="vom-heatmap-actions">
        <FormGroup>
          <Button size="sm" onClick={() => {this.saveAsImage()} }>download current map</Button>
          <h4>Heatmap type</h4> 
          <div>
            <CustomInput type="radio" id="heatmap-by-amount" name="by-amount" 
            label="by amount of responses"
            value={HeatmapType.Amount}
            checked={this.state.heatmapType === HeatmapType.Amount}
            onChange={ this.handleChangeColor }
            />
            <CustomInput type="radio" id="heatmap-by-friendliness" name="by-friendliness"
            label="by friendliness"
            value={HeatmapType.Friendliness}
            checked={this.state.heatmapType === HeatmapType.Friendliness}
            onChange={ this.handleChangeColor }
            />
            <CustomInput type="radio" id="heatmap-by-correctness" name="by-correctness"
            label="by correctness"
            value={HeatmapType.Correctness}
            checked={this.state.heatmapType === HeatmapType.Correctness}
            onChange={ this.handleChangeColor }
            />
            <CustomInput type="radio" id="heatmap-by-pleasantness" name="by-pleasantness"
            label="by pleasantness"
            value={HeatmapType.Pleasantness}
            checked={this.state.heatmapType === HeatmapType.Pleasantness}
            onChange={ this.handleChangeColor }
            />
            <CustomInput type="radio" id="heatmap-by-trustworthiness" name="by-trustworthiness"
            label="by trustworthiness"
            value={HeatmapType.Trustworthiness}
            checked={this.state.heatmapType === HeatmapType.Trustworthiness}
            onChange={ this.handleChangeColor }
            />
          </div>
        </FormGroup>
      </div>
    </div>
  )
}
      
export default Heatmap;