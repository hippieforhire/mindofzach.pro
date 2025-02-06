// Initialize the map with the starting location in Marion County, Missouri
let map = L.map('map').setView([39.800, -91.500], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Create a polygon layer to display the property boundary
let boundaryLayer = L.polygon([], { color: 'blue' }).addTo(map);
let boundaryPoints = [];

// Called when the user clicks the "Map Property" button
function parseLegalDescription() {
  console.log("parseLegalDescription() called.");
  let input = document.getElementById("legalDescription").value;
  
  if (!input.trim()) {
    alert("Please enter a legal description.");
    return;
  }
  
  // Clear any previous polygon from the map
  boundaryLayer.setLatLngs([]);
  boundaryPoints = [];

  boundaryPoints = parseDescription(input);
  
  console.log("Parsed points:", boundaryPoints);
  
  if (boundaryPoints.length > 2) {
    // Ensure the polygon closes by appending the starting point
    boundaryPoints.push(boundaryPoints[0]);
    boundaryLayer.setLatLngs(boundaryPoints);
    map.fitBounds(boundaryLayer.getBounds());
    console.log("Polygon drawn with " + boundaryPoints.length + " points.");
  } else {
    alert("Error: Not enough points parsed. Please check the legal description format.");
    console.warn("Only " + boundaryPoints.length + " point(s) were parsed.");
  }
}

// Parses the legal description text and extracts coordinates
function parseDescription(text) {
  let parsedPoints = [];
  // Starting reference point in Marion County, MO (as [lat, lng])
  let startLat = 39.800, startLng = -91.500;
  let currentPoint = [startLat, startLng];
  parsedPoints.push(currentPoint);
  console.log("Starting at:", currentPoint);

  // Improved regex to capture segments with:
  //   1. A primary direction (North, South, East, West)
  //   2. Degrees (number with optional decimals) and the word "degree(s)" or the symbol "°"
  //   3. Optional minutes (number) with "minute(s)" (or ' or min) optionally preceded by "and"
  //   4. Optional seconds (number) with "second(s)" (or " or sec) optionally preceded by "and"
  //   5. An optional secondary direction (North, South, East, West)
  //   6. Then non-digit characters and finally a distance value (number) followed by "ft" or "feet"
  let regex = /(North|South|East|West)\s+(\d+(?:\.\d+)?)\s*(?:°|degrees?)\s*(?:(\d+(?:\.\d+)?)\s*(?:minutes?|min|['’])\s*(?:and\s*)?)?(?:(\d+(?:\.\d+)?)\s*(?:seconds?|sec|["”])\s*(?:and\s*)?)?\s*(North|South|East|West)?[^0-9]*?(\d+(?:\.\d+)?)\s*(?:ft|feet)/gi;
  
  let match;
  let matchCount = 0;
  while ((match = regex.exec(text)) !== null) {
    matchCount++;
    console.log("Match " + matchCount + " found:", match);
    // match[1]: primary direction
    // match[2]: degrees
    // match[3]: minutes (optional)
    // match[4]: seconds (optional)
    // match[5]: secondary direction (optional)
    // match[6]: distance in feet
    let dir1 = match[1];
    let deg = parseFloat(match[2]);
    let min = match[3] ? parseFloat(match[3]) : 0;
    let sec = match[4] ? parseFloat(match[4]) : 0;
    let dir2 = match[5] || "";
    let distance = parseFloat(match[6]);

    // Compute the bearing from the provided directions and angle values
    let bearing = convertBearing(dir1, deg, min, sec, dir2);
    console.log(`Segment ${matchCount}: ${dir1} ${deg}° ${min}' ${sec}" ${dir2}, Distance: ${distance} ft, Bearing: ${bearing}°`);

    // Compute the next point from the current point
    let newPoint = movePoint(currentPoint, bearing, distance);
    console.log("New point:", newPoint);
    parsedPoints.push(newPoint);
    currentPoint = newPoint;
  }

  if (matchCount === 0) {
    console.warn("No segments matched in the legal description. Please verify the format.");
  }
  
  return parsedPoints;
}

// Converts bearing information from legal descriptions into a numeric degree bearing.
// This function uses a simple conversion based on the primary and optional secondary direction.
function convertBearing(dir1, degrees, minutes, seconds, dir2) {
  let decimalDegrees = degrees + (minutes / 60) + (seconds / 3600);
  // Adjust based on primary direction
  switch(dir1) {
    case "North":
      if (dir2 === "East") return decimalDegrees;
      if (dir2 === "West") return 360 - decimalDegrees;
      return decimalDegrees;
    case "South":
      if (dir2 === "East") return 180 - decimalDegrees;
      if (dir2 === "West") return 180 + decimalDegrees;
      return 180 + decimalDegrees;
    case "East":
      if (dir2 === "North") return 90 - decimalDegrees;
      if (dir2 === "South") return 90 + decimalDegrees;
      return 90 + decimalDegrees;
    case "West":
      if (dir2 === "North") return 270 + decimalDegrees;
      if (dir2 === "South") return 270 - decimalDegrees;
      return 270 - decimalDegrees;
    default:
      return decimalDegrees;
  }
}

// Moves a starting point by a given bearing (in degrees) and distance (in feet)
// using Turf.js to compute the destination point.
// Note: The input point is in [lat, lng] order, but Turf.js requires [lng, lat].
function movePoint(start, bearing, distanceFeet) {
  let distanceMeters = distanceFeet * 0.3048;
  let distanceKilometers = distanceMeters / 1000;
  // Convert start from [lat, lng] to [lng, lat]
  let turfStart = turf.point([start[1], start[0]]);
  let destination = turf.destination(turfStart, distanceKilometers, bearing, { units: "kilometers" });
  // Turf returns [lng, lat]; convert to [lat, lng] for Leaflet
  return [destination.geometry.coordinates[1], destination.geometry.coordinates[0]];
}

// Exports the drawn boundary as GeoJSON
function exportGeoJSON() {
  let geojson = {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [boundaryPoints.map(p => [p[1], p[0]])] // GeoJSON expects [lng, lat]
    }
  };
  downloadFile(JSON.stringify(geojson, null, 2), "property.geojson");
}

// Exports the drawn boundary as KML
function exportKML() {
  let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Placemark>
    <Polygon>
      <outerBoundaryIs>
        <LinearRing>
          <coordinates>
            ${boundaryPoints.map(p => `${p[1]},${p[0]},0`).join(" ")}
          </coordinates>
        </LinearRing>
      </outerBoundaryIs>
    </Polygon>
  </Placemark>
</kml>`;
  downloadFile(kml, "property.kml");
}

// Exports the drawn boundary as a CAD DXF file
function exportCAD() {
  let dxf = `0
SECTION
2
HEADER
0
ENDSEC
0
SECTION
2
TABLES
0
ENDSEC
0
SECTION
2
BLOCKS
0
ENDSEC
0
SECTION
2
ENTITIES
`;
  boundaryPoints.forEach((p, i) => {
    if (i < boundaryPoints.length - 1) {
      let next = boundaryPoints[i + 1];
      dxf += `0
LINE
8
0
10
${p[1]}
20
${p[0]}
11
${next[1]}
21
${next[0]}
`;
    }
  });
  dxf += `0
ENDSEC
0
EOF`;
  downloadFile(dxf, "property.dxf");
}

// Helper function for downloading files
function downloadFile(content, filename) {
  let blob = new Blob([content], { type: "text/plain" });
  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
