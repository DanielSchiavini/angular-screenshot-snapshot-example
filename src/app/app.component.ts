import {Component, OnInit} from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  ngOnInit(): void {
    // The data for our line
    const lineData: [number, number][] = [
      [1,  5],  [20, 20],
      [40, 10], [60, 40],
      [80, 5],  [100, 60]
    ];

    // This is the accessor function we talked about above
    const lineFunction = d3.line()
       .x(([x, ]) => x)
       .y(([, y]) => y)
       .curve(d3.curveLinear);

    const svgContainer = d3.select('#graph-container')
      .append('svg')
      .attr('width', 800)
      .attr('height', 600);

    svgContainer.append('path')
      .attr('d', lineFunction(lineData))
      .attr('stroke', 'blue')
      .attr('stroke-width', 2)
      .attr('fill', 'none');
  }
}
