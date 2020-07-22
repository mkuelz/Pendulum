var width = 500, height = 500;
var lines = { l1: 90, l2: 90 };
var bobs = { m1: 15, m2: 15 };
var x0 = width / 2;
var y0 = height / 2;
var x1 = x0;
var y1 = y0 + lines.l1;
var x2 = x1;
var y2 = y1 + lines.l2;
var mu = 1 + (bobs.m1 / bobs.m2);
var time = 0.15;
var Theta1 = Math.PI; //radians
var Theta2 = Math.PI / 2; //radians
var d2Theta1 = 0, d2Theta2 = 0, dTheta1 = 0, dTheta2 = 0;
var g = 9.8;
var dragging = false;

var svg = d3.select("#grid").append("svg").attr('width', width).attr('height', height).on('click', function () { dragging = !dragging });

var lineFunction = d3.line()
    .x(function (d) { return d.x; })
    .y(function (d) { return d.y; });

svg.append('g')
    .call(d3.axisBottom(d3.scaleLinear().range([0, height])).tickSize(-500))
    .attr("transform", "translate(0," + width + ")")
    .selectAll("text").remove();

svg.append('g')
    .call(d3.axisLeft(d3.scaleLinear().range([0, width])).tickSize(-500))
    .attr("transform", "translate(0,0)")
    .selectAll("text").remove();

var line_1 = svg.append('path')
    .attr('stroke', 'black')
    .attr('stroke-width', 2)
    .attr('id', "line1")
    .attr('d', lineFunction([{ 'x': x0, 'y': y0 }, { 'x': x1, 'y': y1 }]));

var line_2 = svg.append('path')
    .attr('stroke', 'black')
    .attr('stroke-width', 2)
    .attr('id', "line2")
    .attr('d', lineFunction([{ 'x': x1, 'y': y1 }, { 'x': x2, 'y': y2 }]));

var circle_1 = svg.append('g')
    .data([{ 'x': x1, 'y': y1 }])
    .attr("transform", function (d) { return 'translate(' + d.x + ',' + d.y + ')' });

circle_1.append('circle').attr("id", "circle1")
    .attr('r', bobs.m1)
    .attr('fill', 'red');

circle_1.append('text')
    .text('1')
    .attr('stroke', 'white');

var circle_2 = svg.append('g')
    .data([{ 'x': x2, 'y': y2 }])
    .attr("transform", function (d) { return 'translate(' + d.x + ',' + d.y + ')' });

circle_2.append('circle').attr("id", "circle2")
    .attr('r', bobs.m2)
    .attr('fill', 'red');

circle_2.append('text')
    .text('2')
    .attr('stroke', 'white');

d3.select("#grid").append('div').attr("id", "angle1");
d3.select("#grid").append('div').attr("id", "angle2");

var drag_Circle1 = d3.drag()
    .on("drag", function (d) {
        dragging = true;
        Theta1 = Math.atan2(d3.event.x - x0, d3.event.y - y0);;
        setAttributes();
    })
    .on("end", function () {
        setAttributes()
    });
var drag_Circle2 = d3.drag()
    .on("drag", function (d) {
        dragging = true;
        Theta2 = Math.atan2(d3.event.x - x1, d3.event.y - y1);
        setAttributes();
    })
    .on("end", function () {
        setAttributes();
    });

drag_Circle1(circle_1);
drag_Circle2(circle_2);

function getSlider(range, type, line, title) {

    let margin = { right: 25, left: 25 };
    let height = 100;

    var slider_div = d3.create("div").text(title);
    var slider_svg = slider_div.append("svg").attr("class", "slider").attr('width', width).attr('height', '100px');
    var slider_group = slider_svg.append('g').attr('transform', 'translate(' + margin.left + ',' + height / 2 + ')');

    var x = d3.scaleLinear()
        .domain(range)
        .range([0, width - margin.left - margin.right])
        .clamp(true);

    slider_group.append("line")
        .attr("class", "track")
        .attr("x1", x.range()[0])
        .attr("x2", x.range()[1])
        .select(function () { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-inset");

    slider_group.insert("g", ".track-inset")
        .attr("class", "ticks")
        .attr("transform", "translate(0," + 18 + ")")
        .selectAll("text")
        .data(x.ticks(10))
        .enter().append("text")
        .attr("x", x)
        .on('click', function (d) {
            handle.attr("cx", x(d));
            type === 'line' ? lines[line] = d : bobs[line] = d
            setAttributes();
        })
        .style("cursor", "pointer")
        .text(function (d) { return d; });

    var handle = slider_group.insert("circle")
        .attr("class", "handle")
        .attr("r", 9)
        .call(d3.drag()
            .on("start.interrupt", function () {
                slider_group.interrupt();
            })
            .on("start drag", function () {
                handle.attr("cx", x(x.invert(d3.event.x)));
                type === 'line' ? lines[line] = x.invert(d3.event.x) : bobs[line] = x.invert(d3.event.x);
                setAttributes();
            })
        )
        .attr("cx", function () {
            return type == 'line' ? x(lines[line]) : x(bobs[line]);
        });
    return slider_div.node();
}

function draw() {

    d3.select("#angle1").text('Angle 1: ' + Number.parseFloat(Math.atan2(x1 - x0, y1 - y0) * 180 / Math.PI).toFixed(5));
    d3.select("#angle2").text('Angle 2: ' + Number.parseFloat(Math.atan2(x2 - x1, y2 - y1) * 180 / Math.PI).toFixed(5));

    d2Theta1 = (g * (Math.sin(Theta2) * Math.cos(Theta1 - Theta2) - mu * Math.sin(Theta1)) - (lines.l2 * dTheta2 * dTheta2 + lines.l1 * dTheta1 * dTheta1 * Math.cos(Theta1 - Theta2)) * Math.sin(Theta1 - Theta2)) / (lines.l1 * (mu - Math.cos(Theta1 - Theta2) * Math.cos(Theta1 - Theta2)));
    d2Theta2 = (mu * g * (Math.sin(Theta1) * Math.cos(Theta1 - Theta2) - Math.sin(Theta2)) + (mu * lines.l1 * dTheta1 * dTheta1 + lines.l2 * dTheta2 * dTheta2 * Math.cos(Theta1 - Theta2)) * Math.sin(Theta1 - Theta2)) / (lines.l2 * (mu - Math.cos(Theta1 - Theta2) * Math.cos(Theta1 - Theta2)));
    dTheta1 += d2Theta1 * time;
    dTheta2 += d2Theta2 * time;
    Theta1 += dTheta1 * time;
    Theta2 += dTheta2 * time;

    x1 = x0 + lines.l1 * Math.sin(Theta1);
    y1 = y0 + lines.l1 * Math.cos(Theta1);
    x2 = x1 + lines.l2 * Math.sin(Theta2);
    y2 = y1 + lines.l2 * Math.cos(Theta2);

    d3.select('#line1')
        .attr('d', lineFunction([{ 'x': x0, 'y': y0 }, { 'x': x1, 'y': y1 }]));

    line_2
        .attr('d', lineFunction([{ 'x': x1, 'y': y1 }, { 'x': x2, 'y': y2 }]));

    circle_1
        .data([{ 'x': x1, 'y': y1 }])
        .attr("transform", function (d) { return 'translate(' + d.x + ',' + d.y + ')' });

    circle_2
        .data([{ 'x': x2, 'y': y2 }])
        .attr("transform", function (d) { return 'translate(' + d.x + ',' + d.y + ')' });
}

function setAttributes() {
    mu = 1 + (bobs.m1 / bobs.m2);
    x1 = x0 + lines.l1 * Math.sin(Theta1)
    y1 = y0 + lines.l1 * Math.cos(Theta1)
    x2 = x1 + lines.l2 * Math.sin(Theta2)
    y2 = y1 + lines.l2 * Math.cos(Theta2)

    dTheta1 = 0;
    dTheta2 = 0;
    Theta1 = Math.atan2(x1 - x0, y1 - y0);
    Theta2 = Math.atan2(x2 - x1, y2 - y1);

    d3.select("#angle1").text('Angle 1: ' + (Math.atan2(x1 - x0, y1 - y0) * 180 / Math.PI).toFixed(5));
    d3.select("#angle2").text('Angle 2: ' + (Math.atan2(x2 - x1, y2 - y1) * 180 / Math.PI).toFixed(5));

    line_1
        .attr('d', lineFunction([{ 'x': x0, 'y': y0 }, { 'x': x1, 'y': y1 }]));

    line_2
        .attr('d', lineFunction([{ 'x': x1, 'y': y1 }, { 'x': x2, 'y': y2 }]));

    circle_1
        .data([{ 'x': x1, 'y': y1 }])
        .attr("transform", function (d) { return 'translate(' + d.x + ',' + d.y + ')' });

    circle_2
        .data([{ 'x': x2, 'y': y2 }])
        .attr("transform", function (d) { return 'translate(' + d.x + ',' + d.y + ')' });

    d3.select('#circle1').attr('r', bobs.m1);
    d3.select('#circle2').attr('r', bobs.m2);
}

d3.select('#slider').node().appendChild(getSlider([10, 150], 'line', 'l1', 'Length 1'));
d3.select('#slider').node().appendChild(getSlider([10, 150], 'line', 'l2', 'Length 2'));
d3.select('#slider').node().appendChild(getSlider([10, 30], 'bobs', 'm1', 'Bob 1 Mass'));
d3.select('#slider').node().appendChild(getSlider([10, 30], 'bobs', 'm2', 'Bob 2 Mass'));

setInterval(function () {
    if (!dragging) {
        draw()
    }}, 15);