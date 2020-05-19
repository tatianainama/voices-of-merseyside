import React, { Component } from 'react';
import { Path, PaperScope, Point, Size, Rectangle, Color, PointText } from 'paper';

const CANVAS_STYLE = {
  width: '50%',
  border: '2px solid black'
};

const X_SEGMENTS = 30;
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

class Heatmap extends Component<HeatmapProps, HeatmapState> {
  
  constructor(props: HeatmapProps) {
    super(props);

    this.state = {
      data: [],
      canvas: undefined,
      grid: [],
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
    let xs: number[] = [];
    grid.forEach(section => {
      section.forEach(({ area, items }) => {
        xs = [
          ...xs,
          items.length
        ];
        area.fillColor = new Color(`rgb(${items.length}, ${items.length}, ${items.length})`)
      })
    })
  }

  heatmapBy = (key: 'correctness' | 'friendliness' | 'pleasantness' | 'trustworthiness', grid: Grid) => {    
    grid.forEach(section => {
      section.forEach(({area, items}) => {
        const total = items.reduce<number>((tot, item) => {
          return tot + (item.data[key] || 0);
        }, 0);
        if (total !== 0) {
          area.fillColor = new Color({ hue: RANGE(total / items.length), saturation: 1, brightness: items.length/MAX})
          new PointText({
            point: area.bounds.leftCenter,
            content: (total / items.length).toFixed(1)
          })
        }
      })
    })
  }

  componentDidMount = () => {
    const canvas = new PaperScope();
    canvas.setup('vom-heatmap-canvas');
    canvas.view.viewSize.height = canvas.view.size.width * 1.25;
    const data = this.drawMapData(this.props.data, canvas.view.size.width);
    const grid = this.mkGrid(canvas);
    this.setState({
      data,
      canvas,
      grid,
    })
  }

  render = () => (
    <div className="vom-heatmap" style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
      <div>
        <button onClick={() => { this.heatmapByAmount(this.state.grid)}}>by shape amount</button>
        <button onClick={() => { this.heatmapBy('friendliness', this.state.grid)}}>by friendliness</button>
        <button onClick={() => { this.heatmapBy('correctness', this.state.grid)}}>by correct</button>
        <button onClick={() => { this.heatmapBy('pleasantness', this.state.grid)}}>by pleasant</button>
        <button onClick={() => { this.heatmapBy('trustworthiness', this.state.grid)}}>by trustworthiness</button>
      </div>
      <div id="vom-heatmap-range">
        <div>1</div>
        <div>2</div>
        <div>3</div>
        <div>4</div>
        <div>5</div>
      </div>
      <canvas id="vom-heatmap-canvas" style={CANVAS_STYLE}></canvas>
    </div>
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
}


export default Heatmap;