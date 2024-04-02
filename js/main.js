/**
 *
 *
 *
 */

// Create an anonymous function wrapper to move "global" variables to "local" scope
;(() => {
  // pseudo-global variables
  // Risk attributes to map
  const csvAttr = [
    'COUNTY',
    'POPULATION',
    'RISK_VALUE',
    'RISK_SCORE',
    'RISK_RATNG',
    'RISK_SPCTL',
    'EAL_SPCTL',
    'EAL_SCORE',
    'EAL_RATNG',
    'ALR_VRA_NPCTL',
    'SOVI_SCORE',
    'SOVI_RATNG',
    'SOVI_SCORE',
    'SOVI_SPCTL',
    'RESL_RATNG',
    'RESL_SCORE',
    'RESL_SPCTL',
    'CRF_VALUE',
    'WFIR_EVNTS',
    'WFIR_AFREQ',
    'WFIR_EXPB',
    'WFIR_EXPP',
    'WFIR_EXPPE',
    'WFIR_EXPA',
    'WFIR_EXPT',
    'WFIR_EXP_AREA',
    'WFIR_HLRB',
    'WFIR_HLRP',
    'WFIR_HLRA',
    'WFIR_HLRR',
    'WFIR_EALB',
    'WFIR_EALP',
    'WFIR_EALPE',
    'WFIR_EALA',
    'WFIR_EALT',
    'WFIR_EALS',
    'WFIR_EALR',
    'WFIR_ALRB',
    'WFIR_ALRP',
    'WFIR_ALRA',
    'WFIR_ALR_NPCTL',
    'WFIR_RISKV',
    'WFIR_RISKS',
    'WFIR_RISKR'
  ]

  const index = csvAttr.indexOf('WFIR_RISKS')
  const mappedAttribute = csvAttr[index] // Store the "WFIR_RISKS" index for later retrieval
  const hoverColor = '#eec42d';

  /**
   * Sets up the map by creating an SVG container and adding counties and state boundaries to it.
   */
  const setMap = () => {
    // map frame dimensions
    let width = window.innerWidth * 0.5,
      height = 600

    //create new svg container for the map
    const map = d3
      .select('body')
      .append('svg')
      .attr('class', 'map')
      .attr('width', width)
      .attr('height', height)

    // Create Oblique Lambert azimuthal equal-area projection centered on the specified location
    const projection = d3
      .geoAzimuthalEqualArea()
      .rotate([120.6, -44.15]) // rotation to center on the specified lon,lat (note the sign inversion for lat)
      .center([0, 0]) // set center to 0,0 (since we've already rotated the globe)
      .scale(7500) // adjust the scale
      .translate([width / 2, height / 2])

    // specify the path generator using the projection
    const path = d3.geoPath().projection(projection)

    let callback = data => {
      let csvData = data[0],
        nriTopo = data[1],
        adminTopo = data[2]

      // translate whp TopoJSON
      let nriJSON = topojson.feature(nriTopo, nriTopo.objects.NRI_OR4326)
      // generate graticule
      setGraticule(map, path)
      // join the csv and nri data
      joinData(csvData, nriJSON)
      // Create the map color scale
      let colorScale = makeColorScale(nriJSON)
      // Set the map enumeration units and symbolize values using colorscale
      setEnumerationUnits(nriJSON, adminTopo, map, path, colorScale)
      // Add coordinated visualization to the map
      setChart(csvData, colorScale)
    }
    // Use Promise.all to parallelize asynchronous data loading of data layers
    let promises = []
    promises.push(d3.csv('data/NRI_Table_Counties_Oregon.csv')) //load attributes from csv
    promises.push(d3.json('data/NRI_OR4326.topojson')) //load background spatial data
    promises.push(d3.json('data/admin_bnds.topojson')) //load background spatial data
    Promise.all(promises).then(callback)
  }
  // TODO: remove graticule if keep this map scale (OR)
  const setGraticule = (map, path) => {
    // create graticule generator
    const graticule = d3.geoGraticule().step([5, 5]) //place graticule lines every 1 degrees of longitude and latitude'

    let gratLines = map
      .selectAll('.gratLines') //select graticule elements that will be created
      .data(graticule.lines()) //bind graticule lines to each element to be created
      .enter() //create an element for each datum
      .append('path') //append each element to the svg as a path element
      .attr('class', 'gratLines') //assign class for styling
      .attr('d', path) //project graticule lines*
      .attr('fill', 'lightblue') // Set the fill color for the graticule
  }

  const joinData = (csvData, nriJSON) => {
    // Build a Map for faster CSV lookups
    const csvMap = new Map()
    csvData.forEach(row => csvMap.set(row.NRI_ID, row))

    // Modify GeoJSON features to add appropriate attributes from the CSV features
    nriJSON.features.forEach(feature => {
      const gridId = feature.properties.NRI_ID
      if (csvMap.has(gridId)) {
        const csvRow = csvMap.get(gridId)
        csvAttr.forEach(attr => {
          const value = csvRow[attr]
          feature.properties[attr] = !isNaN(parseFloat(value))
            ? parseFloat(value)
            : value
        })
      }
    })
  }

  const makeColorScale = nriJSON => {
    // Create color ramp from https://observablehq.com/@d3/color-schemes?collection=@d3/d3-scale-chromatic
    const oranges5 = ['#feedde', '#fdbe85', '#fd8d3c', '#e6550d', '#a63603'];

    // Extract the WFIR_RISKS values
    let risksValues = nriJSON.features.map(feature => feature.properties.WFIR_RISKS);

    // Remove any undefined or null values to avoid errors during the ckmeans calculation
    risksValues = risksValues.filter(value => value != null);

    // Calculate Jenks Natural Breaks using ckmeans from simple-statistics (classes refer to'clusters' in ckmeans)
    // Inspired by https://gist.github.com/tmcw/4969184 (thanks!)
    const numberOfClasses = 5;
    const clusters = ss.ckmeans(risksValues, numberOfClasses);

    // Extract the minimum value from each cluster to use as breaks (excluding the highest cluster's maximum)
    const breaks = clusters.map(cluster => cluster[0]);
    breaks.push(clusters[clusters.length - 1][clusters[clusters.length - 1].length - 1]); // Include the max value of the last cluster

    // 3. Create a D3 quantize scale using the breaks
    const colorScale = d3
      .scaleThreshold()
      .domain(breaks.slice(1)) // Use the breaks as domain, slicing off the first break
      .range(oranges5);

    return colorScale;
  }

  const setEnumerationUnits = (nriJSON, adminTopo, map, path, colorScale) => {
    // First, add state boundaries as overlay to the map
    map
      .selectAll('.admin')
      .data(topojson.feature(adminTopo, adminTopo.objects.admin_bnds).features)
      .enter()
      .append('path')
      .attr('class', 'admin')
      .attr('d', path)
      .style('fill', '#E1E1E1') // No fill, just the boundaries
      .style('stroke', '#ccc') // Example stroke color

    // Next, add and symbolize the counties as a choropleth to the map
    map
      .selectAll('.counties')
      .data(nriJSON.features)
      .enter()
      .append('path')
      .attr('class', function (d) {
        return 'counties ' + d.properties.COUNTY
      })
      .attr('d', path) // Use the path generator to draw each county
      .style('fill', function (d) {
        // Use the WFIR_RISKS value from each feature's properties to determine fill color
        // return neutral color if the feature has no properties
        let value = d.properties.WFIR_RISKS
        return value ? colorScale(d.properties.WFIR_RISKS) : '#ccc'
      })
      .on('mouseover', function (d, i) {
        console.log("Mouseover triggered");
        // Add tooltip
        tooltip
          .html(
            `<div><h2>${
              d.properties.COUNTY
            } Couny</h2></div><div><b>Wildfire Risk Index <i>Score</i>:</b> ${Math.round(
              parseFloat(d.properties.WFIR_RISKS)
            )}</div><div><b>Wildfire Risk Index <i>Rating</i>:</b> ${
              d.properties.WFIR_RISKR
            }</div>`
          )
          .style('visibility', 'visible')
        d3.select(this)
          .transition()
          .style('fill', hoverColor); // Directly set the fill color
      })
      .on('mousemove', function () {
        tooltip
          .style('top', d3.event.pageY - 10 + 'px')
          .style('left', d3.event.pageX + 10 + 'px')
      })
      .on('mouseout', function () {
        tooltip.html(``).style('visibility', 'hidden')
        // Return to original style
        d3.select(this)
          .transition()
          .style('fill', function(d) { // Reset fill color based on data
            let value = d.properties.WFIR_RISKS;
            return value ? colorScale(d.properties.WFIR_RISKS) : '#ccc';
          });
      })
  }

  /**
   * Sets up the bar chart by creating an SVG container and adding bars matching mapped elements
   */
  const setChart = (csvData, colorScale) => {
    // Create chart frame dimensions. Use window.innerWidth to make it slightly responsive
    const chartWidth = window.innerWidth * 0.45,
      chartHeight = 600

    // Create a new svg element to hold the bar chart
    const chart = d3
      .select('body')
      .append('svg')
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .attr('class', 'chart')

    // Add a linear Y scale to size bars proportionally to frame
    const yScale = d3.scaleLinear().range([0, chartHeight]).domain([0, 100])

    // Set bars for each Oregon County
    let bars = chart
      .selectAll('.bars')
      .data(csvData)
      .enter()
      .append('rect')
      .sort(function (a, b) {
        return a[mappedAttribute] - b[mappedAttribute]
      })
      .attr('class', function (d) {
        return 'bars ' + d[mappedAttribute]
      })
      .attr('width', chartWidth / csvData.length - 1)
      .attr('x', function (d, i) {
        return i * (chartWidth / csvData.length)
      })
      .attr('height', function (d) {
        return yScale(parseFloat(d[mappedAttribute]))
      })
      .attr('y', function (d) {
        return chartHeight - yScale(parseFloat(d[mappedAttribute]))
      })
      .style('fill', function (d) {
        return colorScale(d[mappedAttribute])
      })
      .on('mouseover', function (d, i) {
        tooltip
          .html(
            `<div><h2>${
              d.COUNTY
            } Couny</h2></div><div><b>Wildfire Risk Index <i>Score</i>:</b> ${Math.round(
              parseFloat(d.WFIR_RISKS)
            )}</div><div><b>Wildfire Risk Index <i>Rating</i>:</b> ${
              d.WFIR_RISKR
            }</div>`
          )
          .style('visibility', 'visible')
        d3.select(this).style('stroke', 'yellow').style('stroke-width', '3')
      })
      .on('mousemove', function () {
        tooltip
          .style('top', d3.event.pageY - 10 + 'px')
          .style('left', d3.event.pageX + 10 + 'px')
      })
      .on('mouseout', function () {
        tooltip.html(``).style('visibility', 'hidden')
        // Return to original outline style
        d3.select(this).style('stroke', 'white').style('stroke-width', '.5')
      })

    tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'd3-tooltip')
      .style('position', 'absolute')
      .style('z-index', '10')
      .style('visibility', 'hidden')
      .style('padding', '10px')
      .style('background', 'rgba(0,0,0,0.6)')
      .style('border-radius', '4px')
      .style('color', '#fff')
      .text('a simple tooltip')

    // Annotate bars with attribute value text
    let chartAnno = chart
      .selectAll('.chartAnno')
      .data(csvData)
      .enter()
      .append('text')
      .sort(function (a, b) {
        return a[mappedAttribute] - b[mappedAttribute]
      })
      .attr('class', function (d) {
        return 'chartAnno ' + d[mappedAttribute]
      })
      .attr('text-anchor', 'middle')
      .attr('x', function (d, i) {
        const fraction = chartWidth / csvData.length
        return i * fraction + (fraction - 1) / 2
      })
      .attr('y', function (d) {
        return chartHeight - yScale(parseFloat(d[mappedAttribute])) + 15
      })
      .text(function (d) {
        return Math.round(parseFloat(d[mappedAttribute]))
      })
  }

  //begin script when window loads
  window.onload = setMap()
})() // close the anonymous function wrapper
