// Create an anonymous function wrapper to move "global" variables to "local" scope
;(() => {
  // Constants and configurations
  const config = {
    chart: {
      width: window.innerWidth * 0.45,
      height: 600,
      padding: { left: 25, right: 2, top: 5, bottom: 5 },
      colors: ['#feedde', '#fdbe85', '#fd8d3c', '#e6550d', '#a63603'], // Oranges5 from D3
      initialAttribute: 'RISK_SCORE',
      initialTitle: 'All Hazards Risk Level'
    },
    map: {
      width: window.innerWidth * 0.5,
      height: 600,
      hoverColor: '#eec42d',
      defaultFill: '#ccc'
    },
    dataPaths: {
      csv: 'data/NRI_Table_Counties_Oregon.csv',
      nriTopojson: 'data/NRI_OR4326.topojson',
      adminTopojson: 'data/admin_bnds.topojson'
    },
    csvFullAttributes: {
      COUNTY: 'County',
      POPULATION: 'Population',
      RISK_SCORE: 'National Risk Index',
      RISK_RATNG: 'National Risk Index - Rating',
      EAL_SCORE: 'Expected Annual Loss - Score',
      EAL_RATNG: 'Expected Annual Loss - Rating',
      SOVI_SCORE: 'Social Vulnerability - Score',
      SOVI_RATNG: 'Social Vulnerability - Rating',
      RESL_RATNG: 'Community Resilience - Rating',
      RESL_SCORE: 'Community Resilience - Score',
      WFIR_EVNTS: 'Wildfire - Number of Events',
      WFIR_AFREQ: 'Wildfire - Annualized Frequency',
      WFIR_EXPB: 'Wildfire - Exposure - Building Value',
      WFIR_EXPP: 'Wildfire - Exposure - Population',
      WFIR_EXPA: 'Wildfire - Exposure - Agriculture Value',
      WFIR_EXP_AREA: 'Wildfire - Exposure - Impacted Area (sq mi)',
      WFIR_HLRB: 'Wildfire - Historic Loss Ratio - Buildings',
      WFIR_HLRP: 'Wildfire - Historic Loss Ratio - Population',
      WFIR_HLRA: 'Wildfire - Historic Loss Ratio - Agriculture',
      WFIR_HLRR: 'Wildfire - Historic Loss Ratio - Total Rating',
      WFIR_EALB: 'Wildfire - Expected Annual Loss - Building Value',
      WFIR_EALP: 'Wildfire - Expected Annual Loss - Population',
      WFIR_EALA: 'Wildfire - Expected Annual Loss - Agriculture Value',
      WFIR_EALT: 'Wildfire - Expected Annual Loss - Total',
      WFIR_EALS: 'Wildfire - Expected Annual Loss Score',
      WFIR_ALR_NPCTL:
        'Wildfire - Expected Annual Loss Rate - National Percentile',
      WFIR_RISKS: 'Wildfire - Hazard Type Risk Index Score',
      WFIR_RISKR: 'Wildfire - Hazard Type Risk Index Rating',
      WNTW_EVNTS: 'Winter Weather - Number of Events',
      WNTW_RISKS: 'Winter Weather - Hazard Type Risk Index Score',
      WNTW_RISKR: 'Winter Weather - Hazard Type Risk Index Rating',
      VLCN_RISKS: 'Volcanic Activity - Hazard Type Risk Index Score',
      VLCN_RISKR: 'Volcanic Activity - Hazard Type Risk Index Rating',
      TSUN_RISKS: 'Tsunami - Hazard Type Risk Index Score',
      TSUN_RISKR: 'Tsunami - Hazard Type Risk Index Rating',
      TRND_RISKS: 'Tornado - Hazard Type Risk Index Score',
      TRND_RISKR: 'Tornado - Hazard Type Risk Index Rating',
      SWND_RISKS: 'Strong Wind - Hazard Type Risk Index Score',
      SWND_RISKR: 'Strong Wind - Hazard Type Risk Index Rating',
      RFLD_RISKS: 'Riverine Flooding - Hazard Type Risk Index Score',
      RFLD_RISKR: 'Riverine Flooding - Hazard Type Risk Index Rating',
      LTNG_RISKS: 'Lightning - Hazard Type Risk Index Score',
      LTNG_RISKR: 'Lightning - Hazard Type Risk Index Rating',
      LNDS_RISKS: 'Landslide - Hazard Type Risk Index Score',
      LNDS_RISKR: 'Landslide - Hazard Type Risk Index Rating',
      ISTM_RISKS: 'Ice Storm - Hazard Type Risk Index Score',
      ISTM_RISKR: 'Ice Storm - Hazard Type Risk Index Rating',
      HRCN_RISKS: 'Hurricane - Hazard Type Risk Index Score',
      HRCN_RISKR: 'Hurricane - Hazard Type Risk Index Rating',
      HWAV_RISKS: 'Heat Wave - Hazard Type Risk Index Score',
      HWAV_RISKR: 'Heat Wave - Hazard Type Risk Index Rating',
      HAIL_RISKS: 'Hail - Hazard Type Risk Index Score',
      HAIL_RISKR: 'Hail - Hazard Type Risk Index Rating',
      ERQK_RISKS: 'Earthquake - Hazard Type Risk Index Score',
      ERQK_RISKR: 'Earthquake - Hazard Type Risk Index Rating',
      DRGT_RISKS: 'Drought - Hazard Type Risk Index Score',
      DRGT_RISKR: 'Drought - Hazard Type Risk Index Rating',
      CFLD_RISKS: 'Coastal Flooding - Hazard Type Risk Index Score',
      CFLD_RISKR: 'Coastal Flooding - Hazard Type Risk Index Rating',
      AVLN_RISKS: 'Avalanche - Hazard Type Risk Index Score',
      AVLN_RISKR: 'Avalanche - Hazard Type Risk Index Rating'
    },
    vizAttributes: {
      RISK_SCORE: 'All Hazards Risk Level',
      SOVI_SCORE: 'Social Vulnerability Risk Level',
      RESL_SCORE: 'Community Resilience Risk Level',
      DRGT_RISKS: 'Drought Risk Level',
      ERQK_RISKS: 'Earthquake Risk Level',
      HAIL_RISKS: 'Hail Risk Level',
      HWAV_RISKS: 'Heat Wave Risk Level',
      ISTM_RISKS: 'Ice Storm Risk Level',
      LANDS_RISKS: 'Landslide Risk Level',
      LTNG_RISKS: 'Lightning Risk Level',
      RFLD_RISKS: 'Riverine Flooding Risk Level',
      SWND_RISKS: 'Strong Wind Risk Level',
      TRND_RISKS: 'Tornado Risk Level',
      WFIR_RISKS: 'Wildfire Risk Level',
      WNTW_RISKS: 'Winter Weather Risk Level'
    }
  }

  let currentAttribute = config.chart.initialAttribute;

  // Initialize scales and dimensions
  const yScale = d3
    .scaleLinear()
    .range([0, config.chart.height])
    .domain([0, 100])

  /**
 *
  Reusable functions
 *
**/

  // Map creation - pass in dimensions and projection
  const createMap = (map, projection) => {
    return d3
      .select('body')
      .append('svg')
      .attr('class', 'map')
      .attr('width', map.width)
      .attr('height', map.height)
      .append('g') // Add a group element to contain map layers
  }

  // Chart creation - pass in dimensions and padding
  const createChart = (chart, padding) => {
    return d3
      .select('body')
      .append('svg')
      .attr('class', 'chart')
      .attr('width', chart.width)
      .attr('height', chart.height)
      .append('g') // Add a group element for chart elements
  }

  const updateChart = (chart, nriJSON, colorScale, tooltip) => {
    // Set bars for each Oregon County

    let selectedAttribute = currentAttribute;
    console.log('selectedAttribute', selectedAttribute);

    chart
      .selectAll('.bars')
      .data(nriJSON.features)
      .enter()
      .append('rect')
      .sort(function (a, b) {
        // Use || 0 to assign 0 if data is missing or undefined
        return (
          (a.properties[config.chart.initialAttribute] || 0) -
          (b.properties[config.chart.initialAttribute] || 0)
        )
      })
      .attr('class', function (d) {
        return 'bars ' + d.properties.COUNTY
      })
      .attr('width', config.chart.width / nriJSON.features.length - 1)
      .attr('x', function (d, i) {
        return i * (config.chart.width / nriJSON.features.length)
      })
      .attr('height', function (d) {
        return yScale(
          parseFloat(d.properties[config.chart.initialAttribute] || 0)
        )
      })
      .attr('y', function (d) {
        return (
          config.chart.height -
          yScale(parseFloat(d.properties[config.chart.initialAttribute] || 0))
        )
      })
      .style('fill', function (d) {
        return colorScale(d.properties[config.chart.initialAttribute])
      })
      .on('mouseover', function (d, i) {
        const attributeName = config.csvFullAttributes[currentAttribute] || currentAttribute;
        const attributeValue = d.properties[currentAttribute] || 'N/A'; // Fallback to 'N/A' if undefined
        tooltip
        .html(
          `<div><h2>${d.properties.COUNTY} County</h2></div>` +
          `<div><b>${attributeName}:</b> ${Math.round(parseFloat(attributeValue || 0))}</div>`
        )
        .style('visibility', 'visible');
        highlightElement(d)
      })
      .on('mousemove', function () {
        tooltip
          .style('top', d3.event.pageY - 10 + 'px')
          .style('left', d3.event.pageX + 10 + 'px')
      })
      .on('mouseout', function (d) {
        tooltip.html(``).style('visibility', 'hidden')
        // Return to original outline style
        //d3.select(this).style('stroke', 'white').style('stroke-width', '.5')
        dehighlightElement(d)
      })

    var desc = chart
      .selectAll('.bars')
      .append('desc')
      .text('{"stroke": "none", "stroke-width": "0px"}')
  }

  //function to highlightElement enumeration units and bars
  const highlightElement = props => {
    //change stroke
    var selected = d3
      .selectAll('.' + props.COUNTY)
      .style('stroke', 'yellow')
      .style('stroke-width', '3')
  }

  //function to reset the element style on mouseout
  const dehighlightElement = props => {
    var selected = d3
      .selectAll('.' + props.COUNTY)
      .style('stroke', function () {
        return getStyle(this, 'stroke')
      })
      .style('stroke-width', function () {
        return getStyle(this, 'stroke-width')
      })

    function getStyle (element, styleName) {
      var styleText = d3.select(element).select('desc').text()

      var styleObject = JSON.parse(styleText)

      return styleObject[styleName]
    }
  }

  //function to create dynamic label
  const setPopup = props => {
    //label content
    var labelAttribute =
      '<h1>' + props[expressed] + '</h1><b>' + expressed + '</b>'

    //create info label div
    var infolabel = d3
      .select('body')
      .append('div')
      .attr('class', 'infolabel')
      .attr('id', props.adm1_code + '_label')
      .html(labelAttribute)

    var regionName = infolabel
      .append('div')
      .attr('class', 'labelname')
      .html(props.name)
  }

  // Tooltip creation
  const createTooltip = () => {
    return d3
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
      .text('')
  }

  // Add layers to an existing map (counties and admin bounds)
  const addMapLayers = (map, path, nriJSON, adminTopo, colorScale, tooltip) => {
    // Add admin bounds
    map
      .selectAll('.admin')
      .data(topojson.feature(adminTopo, adminTopo.objects.admin_bnds).features)
      .enter()
      .append('path')
      .attr('class', 'admin')
      .attr('d', path)
      .style('fill', '#E1E1E1') // No fill, just the boundaries
      .style('stroke', '#ccc') // Example stroke color

    // Add counties
    map
      .selectAll('.counties')
      .data(nriJSON.features)
      .enter()
      .append('path')
      .attr('class', function (d) {
        return 'counties ' + d.properties.COUNTY
      })
      .attr('d', path)
      .style('fill', function (d) {
        let value = d.properties[config.chart.initialAttribute] // Use the initial attribute
        return value ? colorScale(value) : '#ccc'
      })
      .on('mouseover', function (d, i) {
        // Add tooltip
        const attributeName = config.csvFullAttributes[currentAttribute] || currentAttribute;
        const attributeValue = d.properties[currentAttribute] || 'N/A'; // Fallback to 'N/A' if undefined
        tooltip
        .html(
          `<div><h2>${d.properties.COUNTY} County</h2></div>` +
          `<div><b>${attributeName}:</b> ${Math.round(parseFloat(attributeValue || 0))}</div>`
        )
        .style('visibility', 'visible');
        highlightElement(d.properties)
      })
      .on('mousemove', function () {
        tooltip
          .style('top', d3.event.pageY - 10 + 'px')
          .style('left', d3.event.pageX + 10 + 'px')
      })
      .on('mouseout', function (d) {
        // Return to original style
        dehighlightElement(d.properties)
        tooltip.html(``).style('visibility', 'hidden')
      })

    let desc = map
      .selectAll('.counties')
      .append('desc')
      .text('{"stroke": "#fff", "stroke-width": ".5px"}')
  }

  // Create the dropdown
  const createDropdown = attributes => {
    const dropdown = d3
      .select('body')
      .append('select')
      .attr('class', 'dropdown')
      .on('change', function () {
        //TODO: Determien if this is a better pla
      })

    // Title option
    dropdown
      .append('option')
      .attr('class', 'titleOption')
      .attr('disabled', 'true')
      .text('Select Attribute')

    // Attribute options
    dropdown
      .selectAll('attrOptions')
      .data(attributes)
      .enter()
      .append('option')
      .attr('value', function (d) {
        return d.key
      })
      .text(function (d) {
        return d.value
      })
  }

  const setupChartAnno = (chart, nriJSON, colorScale) => {
    let chartAnno = chart
      .selectAll('.chartAnno')
      .data(nriJSON.features)
      .enter()
      .append('text')
      .sort(function (a, b) {
        return (
          a.properties[config.chart.initialAttribute] -
          b.properties[config.chart.initialAttribute]
        )
      })
      .attr('class', function (d) {
        return 'chartAnno ' + d.properties[config.chart.initialAttribute]
      })
      .attr('text-anchor', 'middle')
      .attr('x', function (d, i) {
        const fraction = config.chart.width / nriJSON.features.length
        return i * fraction + (fraction - 1) / 2
      })
      .attr('y', function (d) {
        return (
          config.chart.height -
          yScale(parseFloat(d.properties[config.chart.initialAttribute])) +
          15
        )
      })
      .text(function (d) {
        return Math.round(
          parseFloat(d.properties[config.chart.initialAttribute])
        )
      })

    let chartTitle = chart
      .append('text')
      .attr('x', 40)
      .attr('y', 40)
      .attr('class', 'chartTitle')
      .text(config.chart.initialTitle)
  }

  // Update map and chart with new attribute and colorscale
  const changeAttribute = (value, nriJSON, colorScale, map, chart) => {
    // Update the map
    map
      .selectAll('.counties')
      .transition()
      .duration(1000)
      .style('fill', function (d) {
        let attValue = d.properties[value]
        return attValue ? colorScale(attValue) : '#ccc'
      })

    // Update chart
    chart
      .selectAll('.bars')
      .sort(function (a, b) {
        return a.properties[value] - b.properties[value] // Sort by new attribute
      })
      .transition() // Add transition for smooth update
      .delay(function (d, i) {
        return i * 20
      })
      .duration(500)
      .attr('class', function (d) {
        // Update class name to reflect the current attribute
        return 'bars ' + d.properties.COUNTY
      })
      .attr('x', function (d, i) {
        return i * (config.chart.width / nriJSON.features.length)
      })
      .attr('height', function (d) {
        return yScale(parseFloat(d.properties[value]))
      })
      .attr('y', function (d) {
        return config.chart.height - yScale(parseFloat(d.properties[value]))
      })
      .style('fill', function (d) {
        return colorScale(d.properties[value])
      })

    // Update the chart annotation
    chart
      .selectAll('.chartAnno')
      .data(nriJSON.features) // Re-bind the data to ensure correct update
      .sort(function (a, b) {
        return a.properties[value] - b.properties[value] // Sort by new attribute
      })
      .transition() // Add transition for smooth update
      .delay(function (d, i) {
        return i * 20
      })
      .duration(500)
      .attr('class', function (d) {
        return 'chartAnno ' + d.properties[value]
      })
      .attr('text-anchor', 'middle')
      .attr(
        'x',
        (d, i) =>
          i * (config.chart.width / nriJSON.features.length) +
          (config.chart.width / nriJSON.features.length - 1) / 2
      )
      .attr(
        'y',
        d => config.chart.height - yScale(parseFloat(d.properties[value])) + 15
      )
      .text(d => Math.round(parseFloat(d.properties[value])))

    // Update the chart title
    chart.select('.chartTitle').text(config.vizAttributes[value])

    // Remove any existing legend (optional)
    chart.select('.legend-container').remove()

    // update the legend
    updateLegend(map, colorScale)

    // Create the legend
    const legendContainer = chart.append('g')
  }

  // Generate a color scale (adjust if not Jenks)
  const createColorScale = (
    nriJSON,
    attribute = config.chart.initialAttribute
  ) => {
    // Create color ramp
    const oranges5 = ['#feedde', '#fdbe85', '#fd8d3c', '#e6550d', '#a63603']
    // Extract values for the selected attribute
    let attributeValues = nriJSON.features.map(
      feature => feature.properties[attribute]
    )
    // Filter out nulls/undefined
    attributeValues = attributeValues.filter(value => value != null)
    // Calculate Jenks Natural Breaks (you'll need the 'ss' library for ckmeans)
    const numberOfClasses = 5
    const clusters = ss.ckmeans(attributeValues, numberOfClasses)
    // Extract breaks
    const breaks = clusters.map(cluster => cluster[0])
    breaks.push(
      clusters[clusters.length - 1][clusters[clusters.length - 1].length - 1]
    )
    // Create a D3 quantize scale
    const colorScale = d3
      .scaleThreshold()
      .domain(breaks.slice(1)) // Slice for correct domain
      .range(oranges5)
    return colorScale
  }

  const createLegendRanges = domain => {
    const ranges = []
    for (let i = 0; i < domain.length - 1; i++) {
      const start = d3.format('.2f')(domain[i])
      const end = d3.format('.2f')(domain[i + 1])
      ranges.push(`${start}-${end}`)
    }
    return ranges
  }

  const updateLegend = (map, colorScale) => {
    const riskLevels = [
      'Very Low Risk',
      'Low Risk',
      'Moderate Risk',
      'High Risk',
      'Very High Risk'
    ]
    const legendRanges = createLegendRanges(colorScale.domain())
    const legendContainer = map.selectAll('.legend-container')

    // Update legend items
    const legendItems = legendContainer
      .selectAll('.legend-item')
      .data(legendRanges)

    legendItems
      .enter()
      .append('g') // Each item is a group
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 20})`)

    // Update for existing legend items
    legendItems.select('rect').style('fill', d => colorScale(d.split('-')[0]))

    legendItems.select('text').text((range, i) => `${riskLevels[i]}: ${range}`)
    // Exit - for any removed items
    legendItems.exit().remove()
  }

  // Create the legend and update the ranges per the selected attributes
  const createLegend = (map, colorScale) => {
    // Create the legend container
    const legendContainer = map
      .append('g')
      .attr('class', 'legend-container')
      .attr('transform', `translate(${config.chart.width - 200}, 20)`) // Position the legend

    const riskLevels = [
      'Very Low Risk',
      'Low Risk',
      'Moderate Risk',
      'High Risk',
      'Very High Risk'
    ]
    const legendRanges = createLegendRanges(colorScale.domain())

    const legend = legendContainer
      .selectAll('.legend-item')
      .data(legendRanges)
      .enter()
      .append('g') // Each item is a group
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 20})`)

    // Add legend rectangles
    legend
      .append('rect')
      .attr('width', 18)
      .attr('height', 18)
      .style('fill', d => colorScale(d.split('-')[0])) // Get color based on the domain value

    // Add legend text (sibling to rect)
    legend
      .append('text')
      .attr('x', 25)
      .attr('y', 13)
      .text((range, i) => `${riskLevels[i]}: ${range}`)
  }

  // Main Data Loading and Setup
  const initialize = dataPaths => {
    Promise.all([
      d3.csv(dataPaths.csv),
      d3.json(dataPaths.nriTopojson),
      d3.json(dataPaths.adminTopojson)
    ]).then(([csvData, nriTopo, adminTopo]) => {
      // Data Processing (from your original code)
      const csvMap = new Map()
      csvData.forEach(row => csvMap.set(row.NRI_ID, row))
      // translate whp TopoJSON
      let nriJSON = topojson.feature(nriTopo, nriTopo.objects.NRI_OR4326)

      // Join NRI GeoJSON with corresponding CSV file
      nriJSON.features.forEach(feature => {
        const gridId = feature.properties.NRI_ID
        if (csvMap.has(gridId)) {
          const csvRow = csvMap.get(gridId)
          Object.keys(csvRow).forEach(attr => {
            const value = csvRow[attr]
            feature.properties[attr] = !isNaN(parseFloat(value))
              ? parseFloat(value)
              : value
          })
        }
      })

      // Initialize reusable components
      const projection = d3
        .geoAzimuthalEqualArea()
        .rotate([120.6, -44.35]) // rotation to center on the specified lon,lat (note the sign inversion for lat)
        .center([0, 0]) // set center to 0,0 (since we've already rotated the globe)
        .scale(6000) // adjust the scale
        .translate([config.map.width / 2, config.map.height / 2])
      // ... (your projection configuration)
      const map = createMap(config.map, projection)
      const chart = createChart(config.chart, config.chart.padding)
      const tooltip = createTooltip()

      // Initial Color Scale
      const colorScale = createColorScale(nriJSON)

      // Create the dropdown
      const attributeData = Object.entries(config.vizAttributes).map(
        ([key, value]) => ({ key, value })
      )
      createDropdown(attributeData)

      // Set up map and chart
      addMapLayers(
        map,
        d3.geoPath().projection(projection),
        nriJSON,
        adminTopo,
        colorScale,
        tooltip
      )
      updateChart(chart, nriJSON, colorScale, tooltip)

      // Initial annotation setup
      setupChartAnno(chart, nriJSON, colorScale)

      // Create the legend
      createLegend(map, colorScale)

      // Event listener for dropdown
      d3.select('.dropdown').on('change', function () {
        currentAttribute = d3.select('.dropdown').property('value');
        const newColorScale = createColorScale(nriJSON, currentAttribute)
        changeAttribute(currentAttribute, nriJSON, newColorScale, map, chart)
      })
    })
  }

  //begin script when window loads
  window.onload = initialize(config.dataPaths)
})() // close the anonymous function wrapper
