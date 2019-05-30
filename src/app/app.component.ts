import { Component, OnInit, AfterContentInit } from '@angular/core';
import * as d3 from "d3";

import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    title: string;
    data: any;
    svg;
    nrSelect = "connected";
    constructor(private http: HttpClient) {
        this.title = 'Zoomable Line Chart';
    }

    getData() {
        this.http.get("http://localhost:4200/assets/data.json")
            .subscribe((data: any) => {
                this.data = data.map(d => ({
                    x: +d.id,
                    y: +d.units,
                })
                );
                this.drawChart();
            });
    }

    filterData(departmentName) {
        this.svg.remove();
        this.svg = d3.selectAll("body").append("svg");
        this.http.get("http://localhost:4200/assets/data.json")
            .subscribe((data: any) => {
                data = data.filter(d => d.department === departmentName);
                this.data = data.map(d => ({
                    x: +d.id,
                    y: +d.units,
                })
                );
                this.drawChart();
            });
    }

    ngOnInit() {
        this.getData();
    }

    drawChart() {
        var data = this.data;

        var margin = { top: 20, right: 50, bottom: 20, left: 80 },
            width = 900 - margin.left - margin.right,
            height = 450 - margin.top - margin.bottom;

        var zoom = d3.zoom()
            .scaleExtent([1, 5])
            .extent([[100, 100], [width - 100, height - 100]])
            .on("zoom", zoomed);

        function zoomed() {
            svg.selectAll(".charts")
                .attr("transform", d3.event.transform);
            d3.selectAll('.line').style("stroke-width", 2 / d3.event.transform.k);
            gX.call(xAxis.scale(d3.event.transform.rescaleX(x)));
            gY.call(yAxis.scale(d3.event.transform.rescaleY(y)));
        }

        this.svg = d3.select("svg");
        var svg = this.svg
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .call(zoom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var x = d3.scaleLinear()
            .domain([0, 10])
            .range([0, width]);
        var y = d3.scaleLinear()
            .domain([0, 100])
            .range([height, 0]);

        var xAxis = d3.axisBottom(x);
        var yAxis = d3.axisLeft(y);

        var gX = svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
        var gY = svg.append("g")
            .attr("class", "axis axis--y")
            .call(yAxis)

        let line = d3.line()
            .x(function (d) { return x(d.x); })
            .y(function (d) { return y(d.y); });

        svg.append("g")
            .attr("class", "charts")
            .append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", function (d) { return line(d); });
    }

    onDepartmentChange(value) {
        this.filterData(value);
    }
}
