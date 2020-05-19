import React, { Component } from 'react';
import { Path, PaperScope, Point, Size, Rectangle, PointText, Color } from 'paper';

const CANVAS_STYLE = {
  width: '50%',
  border: '2px solid black'
};

const X_SEGMENTS = 25;
const Y_SEGMENTS = X_SEGMENTS * 1.25;

type HeatmapData = {
  id: [number, number],
  shape: paper.Path,
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
      grid: []
    }
  }

  drawShape = (path: string, scale: number, data: any) => {
    const _path = new Path();
    _path.importJSON(path);
    _path.scale(scale, new Point(0, 0));
    _path.data = data;
    _path.strokeWidth = 0.5;
    _path.selected = false;
    return _path;
  }

  mkGrid = (canvas: paper.PaperScope) => {
    const width = canvas.view.size.width,
          height = canvas.view.size.height;
    const size = new Size(width/X_SEGMENTS, height/Y_SEGMENTS);

    const data = this.props.data.reduce<Array<HeatmapData>>((newData, result) => {
      return [
        ...newData,
        ...result.canvas.map((shape, shapeId) => {
          let data = {
            id: [result.id, shapeId],
            correctness: shape.form.correctness,
            friendliness: shape.form.friendliness,
            pleasantness: shape.form.pleasantness,
            trustworthiness: shape.form.trustworthiness,
            shape: {},
          }
          data.shape = this.drawShape(shape.path, width / result.canvasSize.width, data);
          return data as HeatmapData;
        })
      ]
    }, [])


    let grid: Array<Array<paper.Path.Rectangle>> = [];
    for(let row = 0; row < Y_SEGMENTS; row ++) {
      grid[row] = [];
      for(let column = 0; column < X_SEGMENTS; column ++) {
        let rect = new Rectangle({
          point: [column * size.width, row * size.height],
          size: size,
        });

        let items = canvas.project.activeLayer.getItems({
          overlapping: rect
        })
        new Path.Rectangle({
          rectangle: rect,
          fillColor: new Color(`rgb(${items.length}, ${items.length}, ${items.length})`)
        })
        new PointText({
          point: rect.leftCenter,
          content: items.length,
          fillColor: items.length < 50 ? 'white' : 'black',
          fontSize: 10
        })
        // grid[row][column] = new Path.Rectangle({
        //   point: [column * size.width, row * size.height],
        //   size: size,
        // });
      }
    }
    this.setState({ grid, data })
  }



  componentDidMount = () => {
    const canvas = new PaperScope();
    canvas.setup('vom-heatmap-canvas');
    canvas.view.viewSize.height = canvas.view.size.width * 1.25;
    this.mkGrid(canvas);
    this.setState({
      canvas,
    })
  }

  render = () => (
    <div className="vom-heatmap" style={{display: 'flex', justifyContent: 'center'}}>
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
  grid: Array<Array<paper.Path.Rectangle>>
}


export default Heatmap;