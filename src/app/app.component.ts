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
      const lineData = [ { x: 1,   y: 5},  { x: 20,  y: 20},
                         { x: 40,  y: 10}, { x: 60,  y: 40},
                         { x: 80,  y: 5},  { x: 100, y: 60}];

      const yScale = d3.scaleLinear()
            .domain([1, 100])
            .range([100, 600]);

      const xScale = d3.scaleLinear()
            .domain([1, 100])
            .range([0, 700]);

          // This is the accessor function we talked about above
      const line = d3.line();
      d3.select('#graph-container')
            .append('svg')
            .attr('width', 800)
            .attr('height', 600)

            .append('path')
            .data(lineData)
            .attr('d', line(lineData.map(({x, y}) => [xScale(x), yScale(y)])))
            .attr('stroke', 'blue')
            .attr('stroke-width', 2)
            .attr('fill', 'none');
  }
}
