import {Component, OnInit} from '@angular/core';
import * as d3 from 'd3';
import {Selection} from 'd3-selection';
import {zoom, ZoomBehavior, ZoomedElementBaseType} from 'd3';

interface Point {
  x: number;
  y: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private dataGroupSelection: Selection<SVGGElement, any, HTMLElement, any>;

  ngOnInit(): void {

    const svgWidth = window.innerWidth - 25;
    const svgHeight = window.innerHeight - 25;

    const xAxisWidth = 100;
    const yAxisHeight = 100;

    const xMaxValue = 100;
    const yMaxValue = 60;

    // The data for our line
    const linesData = this.generateData(xMaxValue, yMaxValue);
    console.log(linesData);

    const xScale = d3.scaleLinear()
      .domain([1, xMaxValue])
      .range([xAxisWidth, svgWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, yMaxValue])
      .range([0, svgHeight - yAxisHeight]);

    const line = d3.line();

    // This is the accessor function we talked about above
    const zoomBehavior = d3.zoom().on('zoom', () => this.dataGroupSelection.attr('transform', d3.event.transform));

    d3.select('svg#graph-container')
      .style('border', '1px solid black')
      .attr('width', svgWidth)
      .attr('height', svgHeight);

    this.dataGroupSelection = d3.select<SVGGElement, any>('g#data-group')
      .call(zoomBehavior);
    this.updateData(linesData, line, xScale, yScale);
  }

  private updateData(linesData: Point[][],
                     line: d3.Line<[number, number]>,
                     xScale: d3.ScaleLinear<number, number>,
                     yScale: d3.ScaleLinear<number, number>) {
    this.dataGroupSelection
      .selectAll('path')
      .data(linesData)
      .join('path')
      .attr('d', (lineData: Point[]) => line(this.scale(lineData, xScale, yScale)))
      .attr('stroke', 'blue')
      .attr('stroke-width', 2)
      .attr('fill', 'none');
  }

  private scale(lineData: Point[], xScale: d3.ScaleLinear<number, number>, yScale: d3.ScaleLinear<number, number>): [number, number][] {
    return lineData.map(({x, y}) => [xScale(x), yScale(y)]);
  }

  private generateData(xMaxValue: number, yMaxValue: number): Point[][] {
    const xGenerator = d3.randomUniform(xMaxValue);
    const yGenerator = d3.randomUniform(yMaxValue);
    return d3.range(10)
      .map(() => d3.range(8)
        .map(() => ({ x: xGenerator(), y: yGenerator(), }))
        .sort((a, b) => a.x - b.x || a.y - b.y)
    );
  }
}
