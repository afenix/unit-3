/**
 *
 *
 *
 */

//begin script when window loads
window.onload = setMap()

/**
 * Sets up the map by creating an SVG container and adding hexagons and state boundaries to it.
 */
function setMap () {
  // map frame dimensions
  var width = 960,
    height = 460

  //create new svg container for the map
  var map = d3
    .select('body')
    .append('svg')
    .attr('class', 'map')
    .attr('width', width)
    .attr('height', height)

  // Create Oblique Lambert azimuthal equal-area projection centered on the specified location
  var projection = d3
    .geoAzimuthalEqualArea()
    .rotate([120.894, -41.767]) // rotation to center on the specified lon,lat (note the sign inversion for lat)
    .center([0, 0]) // set center to 0,0 (since we've already rotated the globe)
    .scale(2500) // adjust the scale
    .translate([width / 2, height / 2])

  // specify the path generator using the projection
  var path = d3.geoPath().projection(projection)

  function callback (data) {
    let csvData = data[0],
      whpTopo = data[1],
      adminTopo = data[2]

    // translate whp TopoJSON
    let whpHex = topojson.feature(whpTopo, whpTopo.objects.WHPORCA)
    console.log(whpHex)

    // Determine the range of TOT_IGNSUM values within the GeoJSON features
    var extent = d3.extent(whpHex.features, function (d) {
      return d.properties.TOT_IGNSUM
    })

    // Create color ramp from https://observablehq.com/@d3/color-schemes?collection=@d3/d3-scale-chromatic
    var YlOrRd = [
      '#ffffcc',
      '#ffeda0',
      '#fed976',
      '#feb24c',
      '#fd8d3c',
      '#fc4e2a',
      '#e31a1c',
      '#bd0026',
      '#800026'
    ]

    // Create a quantize scale to map TOT_IGNSUM values to a color
    var colorScale = d3
      .scaleQuantize()
      .domain(extent) // Your existing data extent
      .range(YlOrRd)

     // Next, add state boundaries as overlay to the map
    map
     .selectAll('.admin')
     .data(topojson.feature(adminTopo, adminTopo.objects.admin_bnds).features)
     .enter()
     .append('path')
     .attr('class', 'admin')
     .attr('d', path)
     .style('fill', '#E1E1E1') // No fill, just the boundaries
     .style('stroke', '#ccc') // Example stroke color

    // First, add hexagons to the map
    map
      .selectAll('.hex')
      .data(whpHex.features)
      .enter()
      .append('path')
      .attr('class', 'hex')
      .attr('d', path) // Use the path generator to draw each hexagon
      .style('fill', function (d) {
        // Directly use the TOT_IGNSUM value from each feature's properties to determine its fill color
        return colorScale(d.properties.TOT_IGNSUM)
      })

  }

  // create graticule generator
  var graticule = d3.geoGraticule().step([5, 5]) //place graticule lines every 5 degrees of longitude and latitude'

  // create graticule background
  var gratBackground = map
    .append('path')
    .datum(graticule.outline()) //bind graticule background
    .attr('class', 'gratBackground') //assign class for styling
    .attr('d', path) //project graticule

  // create graticule lines
  var gratLines = map
    .selectAll('.gratLines') //select graticule elements that will be created
    .data(graticule.lines()) //bind graticule lines to each element to be created
    .enter() //create an element for each datum
    .append('path') //append each element to the svg as a path element
    .attr('class', 'gratLines') //assign class for styling
    .attr('d', path) //project graticule lines

  // use Promise.all to parallelize asynchronous data loading of various data layers
  var promises = []
  promises.push(d3.csv('data/whp_attrs.csv')) //load attributes from csv
  promises.push(d3.json('data/whp_orca.topojson')) //load background spatial data
  promises.push(d3.json('data/admin_bnds.topojson')) //load background spatial data
  Promise.all(promises).then(callback)
}
