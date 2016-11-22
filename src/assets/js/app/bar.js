/*----------  LIBRARIES  ----------*/

import { select } from 'd3-selection';

/*----------  EXPORT  ----------*/

let rectWidth = 100,
    rectHeight = 10,
    intervalWidth = 0.25;

let rectSvg;

export function barGraph(infoBoxContent, mean, lower, upper) {

    makeSvgAndBackground(infoBoxContent);
    makeBar(mean);

    if (lower !== 0) { makeIntervalLine(lower - intervalWidth); }

    if (upper !== 0) { makeIntervalLine(upper); }

}

function makeSvgAndBackground(infoBoxContent) {

    rectSvg = infoBoxContent.append('svg')
        .style('width', '100%')
        .style('height', `${rectHeight}px`)
        .attr('viewBox', `0 0 ${rectWidth} ${rectHeight}`)
        .attr('preserveAspectRatio', 'none')

    rectSvg.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', rectWidth)
        .attr('height', rectHeight)
        .style('fill', 'white');

}

function makeBar(x) {

    rectSvg.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 0)
        .attr('height', rectHeight)
        .style('fill', '#FF7400')
        .transition()
        .duration(750)
        .attr('width', x);
}

function makeIntervalLine(x) {

    rectSvg.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', intervalWidth)
        .attr('height', rectHeight)
        .style('fill', '#4A4A4A')
        .transition()
        .duration(750)
        .attr('x', x);
}
