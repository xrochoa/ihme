import { styles } from 'd3-selection-multi';

/*----------  EXPORT  ----------*/

let rectWidth = 100,
    rectHeight = 10;

let rectSvgWrapper, rectSvg;

export function barGraph(infoBoxContent, mean, lower, upper) {

    makeSvgAndBackground(infoBoxContent);
    makeBar(mean);

    if ((lower !== 0) && (upper !== 0)) {
        let intervalWidth = parseFloat(upper) - parseFloat(lower);
        makeIntervalLine(lower, intervalWidth);
    }

    makeLabel('0%', 0, 'auto', '-25%');
    makeLabel('100%', 'auto', 0, '75%');

}

function makeSvgAndBackground(infoBoxContent) {

    rectSvgWrapper = infoBoxContent.append('div');

    rectSvg = rectSvgWrapper.append('svg')
        .style('width', '100%')
        .style('height', `${rectHeight}px`)
        .attr('viewBox', `0 0 ${rectWidth} ${rectHeight}`)
        .attr('preserveAspectRatio', 'none');

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

function makeIntervalLine(x, width) {

    rectSvg.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width)
        .attr('height', rectHeight)
        .style('fill', '#4A4A4A')
        .style('opacity', 0.25)
        .transition()
        .duration(750)
        .attr('x', x);
}

function makeLabel(text, left, right, translate) {

    rectSvgWrapper.style('position', 'relative')
        .append('p')
        .styles({
            display: 'block',
            position: 'absolute',
            left: left,
            right: right,
            transform: `translateX(${ translate })`,
            margin: '2px',
            'font-size': rectHeight + 'px'
        })
        .text(text);
}
