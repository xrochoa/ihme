/*----------  LIBRARIES  ----------*/

import { select } from 'd3-selection';
import { geoPath } from 'd3-geo';
import { geoWinkel3 } from 'd3-geo-projection';
import { transition } from 'd3-transition';
import { scalePow, interpolateWarm } from 'd3-scale';
import { extent } from 'd3-array';

import { barGraph } from './bar.js';

/*----------  EXPORT  ----------*/


export function worldMap(dispatcher) {

    /*----------  PROJECTION  ----------*/

    let width = 1000,
        height = 500,
        selected = 'G';

    let projection = geoWinkel3()
        .center([0, 15])
        .scale(180);

    let path = geoPath()
        .projection(projection);

    /*----------  SVG  ----------*/

    let svg = select('.svg-wrapper').append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        //.attr('preserveAspectRatio', 'xMidYMid meet');

    //transparent background
    svg.append('rect')
        .attr('class', 'background')
        .attr('width', width)
        .attr('height', height)
        .on('click', () => {
            //go to global when clicking on background
            dispatcher.call('COUNTRY_CHANGED', this, 'G');
        });


    /*----------  CREATE MAP AND CIRCLES ----------*/

    let mapType = 'bubble'; //used to change styles (this is default)

    let countryGroup = svg.append('g')
        .attr('id', 'countries')
        .style('opacity', 0); //initially invisible

    let circles;

    dispatcher.on('TOPOJSON_LOADED.MAP', function(countries) {

        //add map features
        countryGroup.selectAll('path')
            .data(countries).enter()
            .append('path')
            .attr('d', path)
            .style('fill', 'white') //initializes as bubble map
            .on('click', (country) => {
                //handles click over already selected country
                let data = (selected !== country) ? country : 'G';
                //change of country emitter (on click)
                dispatcher.call('COUNTRY_CHANGED', this, data);
            });

        let circleGroup = countryGroup.append('g')
            .attr('id', 'circles');

        //create circles for each country
        circles = circleGroup.selectAll('circle')
            .data(countries).enter()
            .append('circle');

        //circles radius and position initial values
        circles.attr('r', 0)
            .attr('transform', (country) => {
                return `translate(${ path.centroid(country) })`;
            });

        //initial fade in
        countryGroup.transition()
            .duration(750)
            .style('opacity', 1);


    });

    /*----------  DATA LOADED  ----------*/

    dispatcher.on('DATA_LOADED.HANDLER', function(countryData) {

        //when data has loaded, make this listener available
        dispatcher.on('COUNTRY_CHANGED.MAP', function(countrySelected) {
            zoomIn(countrySelected, countryData);
        });

        /*----------  MAP TYPE ONCE DATA IS AVAILABLE ----------*/

        let btChoropleth = select('#btn-choropleth-map');
        let btnBubble = select('#btn-bubble-map');

        btChoropleth.on('click', () => {
            mapToChoropleth(countryData);
            btChoropleth.classed('active', true);
            btnBubble.classed('active', false);
        });

        btnBubble.on('click', () => {
            mapToBubble();
            btnBubble.classed('active', true);
            btChoropleth.classed('active', false);
        });

    });

    /*----------  MAP TYPE  ----------*/

    let legend = select('.legend');

    function mapToChoropleth(countryData) {

        mapType = 'choropleth';

        countryGroup.selectAll('path')
            .style('fill', (country) => {
                let iso = country.properties.iso_a3;
                if (countryData.hasOwnProperty(iso)) {
                    return interpolateWarm(countryData[iso].mean);
                } else {
                    return 'transparent';
                }
            })
            .style('stroke', 'transparent');

        circles.style('opacity', 0);
        if (selected === 'G') { legend.style('opacity', 1); }

    }

    function mapToBubble() {

        mapType = 'bubble';

        countryGroup.selectAll('path')
            .style('fill', 'white')
            .style('stroke', '#57B055');

        circles.style('opacity', 1);
        legend.style('opacity', 0);

    }


    /*----------  ANIMATE CIRCLES OR COUNTRY COLOR ON DATA CHANGE ----------*/

    //replace and aimate circles on new data
    dispatcher.on('DATA_LOADED.ANIMATE_MAP', function(countryData) {

        if (mapType === 'choropleth') { mapToChoropleth(countryData); }

        //calculate extent (min, max) of mean values to improve visualization
        let meanArray = [];
        for (let key in countryData) {
            meanArray.push(parseFloat(countryData[key].mean));
        }

        let minMax = extent(meanArray);

        let radius = scalePow()
            .domain(minMax) //data limits
            .range([0, 10]); //mapping

        //transition
        circles.transition()
            .duration(750)
            .attr('r', (country) => {
                let iso = country.properties.iso_a3;
                let mean = countryData.hasOwnProperty(iso) ? (countryData[iso].mean) : minMax[0];
                return radius(mean);
            });

    });

    /*----------  ON CLICK  ----------*/

    let infoBox = select('.info-box');

    function zoomIn(data, countryData) {

        let translate, scale;

        if (data === 'G') {

            //if double click, zoom out
            selected = 'G';
            translate = [0, 0];
            scale = 1;

            //animate info box
            infoBox.classed('active', false);
            if (mapType === 'choropleth') { legend.style('opacity', 1); }


        } else {

            legend.style('opacity', 0);


            //calculate scale and translate based on bounding box and centroid
            let box = path.bounds(data),
                boxWidth = box[1][0] - box[0][0],
                boxHeight = box[1][1] - box[0][1];

            let centroid = path.centroid(data);

            let x = centroid[0],
                y = centroid[1];

            selected = data;
            scale = 0.75 / Math.max(boxWidth / width, boxHeight / height);
            translate = [width / 2 - scale * x, height / 2 - scale * y];

            let iso = data.properties.iso_a3;

            let mean = countryData.hasOwnProperty(iso) ? (countryData[iso].mean * 100).toFixed(2) : 0,
                lower = countryData.hasOwnProperty(iso) ? (countryData[iso].lower * 100).toFixed(2) : 0,
                upper = countryData.hasOwnProperty(iso) ? (countryData[iso].upper * 100).toFixed(2) : 0;

            let meanText = countryData.hasOwnProperty(iso) ? `${ mean }%` : 'No data available',
                lowerText = countryData.hasOwnProperty(iso) ? `${ lower }%` : 'No data available',
                upperText = countryData.hasOwnProperty(iso) ? ` - ${ upper }%` : '';

            //animate info box
            let infoBoxContent = infoBox.classed('active', true)
                .select('.content');

            infoBoxContent.html(dedent `
                    <h1>${data.properties.admin}</h1>
                    <p>Mean: ${ meanText }</p>
                    <p>Uncertainty Interval: ${ lowerText } ${ upperText } </p>
                    `);

            //create bar graph
            barGraph(infoBoxContent, mean, lower, upper);


            /*----------  CHANGE INFO BOX WHEN NEW DATA AND ZOOMED IN  ----------*/

            dispatcher.on('DATA_LOADED.INFO_BOX', function(countryData) {
                let data = (selected !== null) ? selected : 'G';
                zoomIn(data, countryData);
            });
        }

        countryGroup.selectAll('path')
            .classed('selected', function(d) {
                return d === selected;
            });

        countryGroup.transition()
            .duration(750)
            .style('stroke-width', `${ 1.5 / scale }px`)
            .attr('transform', `translate(${ translate })scale(${ scale })`);

    }



}
