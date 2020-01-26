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

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private xScale: ScaleLinear<number, number>;
  private yScale: ScaleLinear<number, number>;

  ngOnInit(): void {
    const svgWidth = window.innerWidth - 25;
    const svgHeight = window.innerHeight - 25;

    const xMaxValue = 100;
    const yMaxValue = 60;

    const xAxisHeight = 100;
    const yAxisWidth = 100;

    this.xScale = d3.scaleLinear()
      .domain([0, xMaxValue])
      .range([yAxisWidth, svgWidth]);

    this.yScale = d3.scaleLinear()
      .domain([0, yMaxValue])
      .range([0, svgHeight - xAxisHeight]);

    const extent = getExtents(this.xScale.range(), this.yScale.range());
    const zoomBehavior = d3.zoom<SVGSVGElement, null>()
      .extent(extent)
      .translateExtent(extent)
      .scaleExtent([1, 8]);

    const svgSelection = d3.select<SVGSVGElement, null>('svg#graph-container')
      .style('border', '1px solid black')
      .attr('width', svgWidth)
      .attr('height', svgHeight)
      .call(zoomBehavior.on('zoom', () => this.zoomedIn(d3.event as ZoomEvent)));

    svgSelection.insert('rect', 'g#x-axis')
      .attr('width', '100%')
      .attr('height', xAxisHeight)
      .style('transform', 'translate(0, ' + (svgHeight - xAxisHeight) + 'px)')
      .style('fill', 'white');

    svgSelection.insert('rect', 'g#y-axis')
      .attr('width', yAxisWidth)
      .attr('height', '100%')
      .style('fill', 'white');

    this.updateData(this.generateData());
  }

  private updateData(linesData: Point[][]): void {
    const selection = d3.select<SVGGElement, Point[][]>('g#data-group')
      .selectAll('path')
      .data(linesData)
      .join('path')
      .attr('stroke', 'blue')
      .attr('stroke-width', 2)
      .attr('fill', 'none');
    this.rescale(selection as any, d3.zoomIdentity);
  }

  private generateData(): Point[][] {
    const xMaxValue = this.xScale.domain()[1];
    const yMaxValue = this.yScale.domain()[1];

    const xGenerator = d3.randomUniform(xMaxValue);
    const yGenerator = d3.randomUniform(yMaxValue);
    const linesData = d3.range(10)
      .map(() => d3.range(8)
        .map(() => ({ x: xGenerator(), y: yGenerator(), }))
        .sort((a, b) => a.x - b.x || a.y - b.y)
      );
    linesData.push([{x: 0, y: 0}, {x: xMaxValue, y: 0}, {x: 0, y: yMaxValue}, {x: xMaxValue, y: yMaxValue}]);
    console.log(linesData);
    return linesData;
  }

  private zoomedIn(event: ZoomEvent): void {
    this.rescale(d3.select<SVGGElement, Point[][]>('g#data-group').selectAll('path'), event.transform as ZoomTransform);
  }

  private rescale(selection: Selection<SVGPathElement, Point[], SVGGElement, Point[][]>,
                  transform: ZoomTransform) {
    const xScale = transform.rescaleX(this.xScale);
    const yScale = transform.rescaleY(this.yScale);
    const line = d3.line();

    selection.attr('d', (lineData: Point[]) => line(lineData.map(({x, y}) => [xScale(x), yScale(y)])));

    d3.select('g#x-axis')
      .attr('transform', d3.zoomIdentity.translate(0, yScale.range()[1]).toString())
      .call(d3.axisBottom(xScale));

    d3.select('g#y-axis')
      .attr('transform', d3.zoomIdentity.translate(xScale.range()[0], 0).toString())
      .call(d3.axisLeft(yScale));
  }
}
