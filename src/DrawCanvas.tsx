
import React, { useEffect, useState } from 'react';
import Paper, { Path, Tool } from 'paper';

const COLORS = [
  '#FFC6BC',
  '#FEDEA2',
  '#FFF9B8',
  '#D3DBB2',
  '#A7D3D2',
  '#EFE3F3',
  '#C4D0F5',
  '#FFC6BC',
];

const mkBgColor = (color: string) => {
  const _color = new Paper.Color(color);
  _color.alpha = 0.5;
  return _color;
};

const mkPath = (color: string) => {
  let style = {
    strokeColor: color,
    strokeWidth: 5,
    fillColor: mkBgColor(color)
  }
  return new Path(style);
}

type CanvasProps = {
  log: (data: string) => void,
  maxDrawingsReached: () => void
};

type CanvasState = {
  data: {
    form: any,
    path: paper.Path
  }[],
  current: number
};

class Canvas2 extends React.Component<any, CanvasState> {
  current = 0;
  Paths: paper.Path[];

  constructor(props: any){
    super(props);
    this.Paths = [];
    this.state = {
      data: [],
      current: 0,
    }
  }

  addPoint = (event: any) => {
    const { data, current } = this.state;
    data[current].path.add(event.point)
  }

  closePath = (event: any) => {
    const { data, current } = this.state;
    data[current].path.add(data[current].path.firstSegment);
    data[current].path.closed = true;
    data[current].path.simplify();
  }

  componentDidMount = () => {
    Paper.setup('magic-canvas');
    let Tool = new Paper.Tool();
    Tool.onMouseDown = this.addPoint; 
    Tool.onMouseDrag = this.addPoint;
    Tool.onMouseUp = (event: any) => {
      this.closePath(event);

      if (this.state.current < 7) {
        this.setState(({ current }) => ({
          current: current + 1
        }))
      } else {
        Tool.remove();
      }
    }
    this.setState({
      data: COLORS.map(color => ({
        form: {},
        path: mkPath(color)
      }))
    })
  }
  render = () => {
    return (
      <canvas id="magic-canvas" />
    )
  }
}


export const DrawCanvas: React.FunctionComponent = () => {
  const log = (data: string) => console.log(data);
  return (
    <section id="draw-canvas">
      <h2>Draw time</h2>
      <Canvas2></Canvas2>
    </section>
  )
};

export default DrawCanvas;