import {Component, OnInit} from '@angular/core';
import * as d3 from 'd3';
import {ScaleLinear, zoom, ZoomBehavior, ZoomTransform} from 'd3';
import {Selection} from 'd3-selection';

interface Point {
  x: number;
  y: number;
}

interface ZoomEvent {
  target: ZoomBehavior<any, any>;
  type: 'start' | 'zoom' | 'end';
  transform: ZoomTransform;
  sourceEvent: MouseEvent | WheelEvent | any;
}

function getExtents([x0, x1]: number[], [y0, y1]: number[]): [[number, number], [number, number]] {
  return [[x0, y0], [x1, y1]];
}

const line = d3.line();

const xAxisWidth = 100;
const yAxisHeight = 100;

const xMaxValue = 100;
const yMaxValue = 60;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private dataGroupSelection: Selection<SVGGElement, Point[][], HTMLElement, any>;
  private svgSelection: Selection<SVGSVGElement, null, HTMLElement, any>;
  private zoom: ZoomBehavior<SVGSVGElement, null>;
  private xScale: ScaleLinear<number, number>;
  private yScale: ScaleLinear<number, number>;
  private transform = d3.zoomIdentity;

  ngOnInit(): void {

    const svgWidth = window.innerWidth - 25;
    const svgHeight = window.innerHeight - 25;

    this.xScale = d3.scaleLinear()
      .domain([0, xMaxValue])
      .range([xAxisWidth, svgWidth]);

    this.yScale = d3.scaleLinear()
      .domain([0, yMaxValue])
      .range([0, svgHeight - yAxisHeight]);

    // The data for our line
    const linesData = this.generateData();

    // This is the accessor function we talked about above
    const extent = getExtents(this.xScale.range(), this.yScale.range());
    this.zoom = d3.zoom<SVGSVGElement, null>()
      .extent(extent)
      .translateExtent(extent)
      .scaleExtent([1, 8]);

    this.svgSelection = d3.select<SVGSVGElement, null>('svg#graph-container')
      .style('border', '1px solid black')
      .attr('width', svgWidth)
      .attr('height', svgHeight)
      .call(this.zoom.on('zoom', () => this.zoomedIn(d3.event as ZoomEvent)));

    this.dataGroupSelection = d3.select<SVGGElement, Point[][]>('g#data-group');

    const xAxis = d3.axisLeft(this.xScale);
    const yAxis = d3.axisLeft(this.yScale);

    this.updateData(linesData);
  }

  private updateData(linesData: Point[][]): void {
    const selection = this.dataGroupSelection
      .selectAll('path')
      .data(linesData)
      .join('path')
      .attr('stroke', 'blue')
      .attr('stroke-width', 2)
      .attr('fill', 'none');
    this.rescale(selection as any);
  }

  private generateData(): Point[][] {
    const xGenerator = d3.randomUniform(xMaxValue);
    const yGenerator = d3.randomUniform(yMaxValue);
    const linesData = d3.range(10)
      .map(() => d3.range(8)
        .map(() => ({ x: xGenerator(), y: yGenerator(), }))
        .sort((a, b) => a.x - b.x || a.y - b.y)
      );
    linesData.push([{x: 0, y: 0}, {x: xMaxValue - 1, y: 0}, {x: 0, y: yMaxValue - 1}, {x: xMaxValue - 1, y: yMaxValue - 1}]);
    console.log(linesData);
    return linesData;
  }

  private zoomedIn(event: ZoomEvent): void {
    this.transform = event.transform;
    this.rescale(this.dataGroupSelection.selectAll('path'));
  }

  private rescale(selection: Selection<SVGPathElement, Point[], SVGGElement, Point[][]>) {
    const xScale = this.transform.rescaleX(this.xScale);
    const yScale = this.transform.rescaleY(this.yScale);
    selection.attr('d', (lineData: Point[]) => line(lineData.map(({x, y}) => [xScale(x), yScale(y)])));
  }
}
