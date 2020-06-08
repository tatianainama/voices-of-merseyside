import React, { Component } from 'react';
import { Path, PaperScope, Point, Size, Rectangle, Color, Layer, Raster } from 'paper';
import { CustomInput, FormGroup, Button } from 'reactstrap';
import FileSaver from 'file-saver';
import map from './merseyside-nobg-white.png';

import './Heatmap.css';
import Axios from 'axios';

const X_SEGMENTS = 12;
const Y_SEGMENTS = X_SEGMENTS * 1.25;
const MAX = 200;
const output_start = 0,
      output_end = 240,
      input_start = 1,
      input_end = 5;
const RANGE = (n: number) => output_start + ((output_end - output_start) / (input_end - input_start)) * (n - input_start);
const OPACITY_RANGE = (n: number, inputEnd: number) => 0 + ((255 - 0) / (inputEnd)) * (n);

const BACKEND = process.env.REACT_APP_BACKEND || '/backend/';

type Grid = Array<{
  area: paper.Path.Rectangle,
  items: Array<paper.Item>
}>

type HeatmapData = {
  id: [number, number],
  correctness: number,
  friendliness: number,
  pleasantness: number,
  trustworthiness: number,
  firstCategory: CategoryType,
  secondCategory?: CategoryType
}

enum HeatmapType {
  Amount = 'amount',
  Friendliness = 'friendliness',
  Correctness = 'correctness',
  Pleasantness = 'pleasantness',
  Trustworthiness = 'trustworthiness'
}

enum CategoryType {
  A,
  B,
  C,
  D,
  E,
  F,
  G,
  H,
  I
}

const CategoryTypeList: CategoryType[] = [
  CategoryType.A,
  CategoryType.B,
  CategoryType.C,
  CategoryType.D,
  CategoryType.E,
  CategoryType.F,
  CategoryType.G,
  CategoryType.H,
  CategoryType.I
];

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

type Result = {
  personalInformation: PersonalInformation,
  canvas: {
    form: FormPath,
    path: paper.Path
  }[],
  email: string,
  id: number,
}

type OriginalData = {
  personalInformation: PersonalInformation,
  canvas: {
    form: FormPath,
    path: string,
    firstCategory: number,
    secondCategory: number | ''
  }[],
  canvasSize: {
    width: number,
    height: number
  },
  email: string,
  id: number,
}

type HeatmapProps = {
}

type CategoryAmount = {
  [CategoryType.A]: number,
  [CategoryType.B]: number,
  [CategoryType.C]: number,
  [CategoryType.D]: number,
  [CategoryType.E]: number,
  [CategoryType.F]: number,
  [CategoryType.G]: number,
  [CategoryType.H]: number,
  [CategoryType.I]: number
}

type HeatmapState = {
  data: HeatmapData[],
  canvas?: paper.PaperScope,
  grid: Grid,
  heatmapLayer: paper.Layer | undefined,
  mapLayer: paper.Layer | undefined,
  gridLayer: paper.Layer | undefined,
  heatmapType: HeatmapType | CategoryType,
  categoryAmount: CategoryAmount
}

const CAT_AMOUNT = CategoryTypeList.reduce<CategoryAmount>((catAmount, cat) => {
  return {
    ...catAmount,
    [cat]: 0
  }
  //@ts-ignore
}, {});

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
      heatmapType: HeatmapType.Amount,
      categoryAmount: {...CAT_AMOUNT}
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

  drawMapData = (data: OriginalData[], canvas: paper.PaperScope) => {
    let categoriesCounter = { ...CAT_AMOUNT };
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
            firstCategory: shape.firstCategory,
            secondCategory: shape.secondCategory === '' ? undefined : shape.secondCategory
          }
          categoriesCounter[data.firstCategory] = categoriesCounter[data.firstCategory] + 1;
          if (data.secondCategory) {
            categoriesCounter[data.secondCategory] = categoriesCounter[data.secondCategory]
          }
          this.drawShape(shape.path, canvas.view.size.width / result.canvasSize.width, data)
          return data as HeatmapData;
        })
      ]
    }, [])
    return {
      data: _data,
      categoryAmount: categoriesCounter
    };
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
    Axios.get<OriginalData[]>(BACKEND, {
      headers: {
        'X-Token': 'secret-potato',
      }
    }).then(response => {
      const { data, categoryAmount } = this.drawMapData(response.data, canvas);
      const { grid, layer } = this.mkGrid(canvas, canvas.project.activeLayer);
      this.changeHeatmapColor(HeatmapType.Friendliness, grid);
      this.setState({
        data,
        canvas,
        grid,
        categoryAmount,
        heatmapLayer: layer,
        heatmapType: HeatmapType.Friendliness,
        mapLayer: this.showMap(canvas),
      })
    })
  }

  handleChangeColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    const heatmapType = e.currentTarget.value as HeatmapType;
    this.changeHeatmapColor(heatmapType, this.state.grid);
    this.setState({
      heatmapType
    });
  }

  handleChangeColorByCat = (e: React.ChangeEvent<HTMLInputElement>) => {
    const type = parseInt(e.currentTarget.value) as unknown as CategoryType;
    this.state.grid.forEach(({area, items}) => {
      const xs = items.filter(i => i.data.firstCategory === type || i.data.secondCategory === type);
      const opacity = OPACITY_RANGE(xs.length, this.state.categoryAmount[type]);
      const color = new Color(`rgb(${opacity}, ${opacity}, ${opacity})`);
      area.fillColor = color;
      area.strokeColor = color;
    });
    this.setState({
      heatmapType: type
    })
  }
  
  heatmapByResponses = (type: HeatmapType | CategoryType): type is HeatmapType => {
    return type === HeatmapType.Amount || type === HeatmapType.Correctness || type === HeatmapType.Friendliness || type === HeatmapType.Pleasantness || type === HeatmapType.Trustworthiness;
  }

  render = () => (
    <div className="vom-heatmap">
      <div className="vom-heatmap-map">
        <canvas id="vom-heatmap-canvas"></canvas>
        {
          this.state.heatmapType === HeatmapType.Amount ? (
            <div id="vom-heatmap-amount-range">
              <div>1</div>
              <div>200</div>
            </div>
          ) : this.heatmapByResponses(this.state.heatmapType) ? (
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
              <div>{this.state.categoryAmount[this.state.heatmapType]} </div>
            </div>
          )
        }
        <Button size="sm" onClick={() => {this.saveAsImage()} }>download current map</Button>
      </div>
      <div className="vom-heatmap-actions">
        <FormGroup>
          <h5>Heatmap based on responses</h5> 
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
      <div className="vom-heatmap-actions">
        <FormGroup>
          <h5>Heatmap based on categorization</h5> 
          <div>
            {
              CategoryTypeList.map(category => (
                <CustomInput
                  key={category}
                  type="radio"
                  id={`heatmap-by-${category}`}
                  name={`by-${category}`}
                  label={`${category}`}
                  value={category}
                  checked={this.state.heatmapType === category}
                  onChange={this.handleChangeColorByCat}
                />
              ))
            }
          </div>
        </FormGroup>
      </div>
    </div>
  )
}
      
export default Heatmap;