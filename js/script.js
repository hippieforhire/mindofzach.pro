let map = L.map('map').setView([39.800, -91.500], 12);  // Default to Marion County, MO

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let boundaryLayer = L.polygon([], { color: 'blue', draggable: true }).addTo(map);
let boundaryPoints = [];

function parseLegalDescription() {
    let input = document.getElementById("legalDescription").value;
    boundaryPoints = parseDescription(input);
    
    if (boundaryPoints.length > 2) {
        boundaryPoints.push(boundaryPoints[0]); // Ensure closure
        boundaryLayer.setLatLngs(boundaryPoints);
        map.fitBounds(boundaryLayer.getBounds());
    } else {
        alert("Error: Not enough points parsed.");
    }
}

// Parses the legal description and extracts coordinates
function parseDescription(text) {
    let parsedPoints = [];
    let startLat = 39.800, startLng = -91.500; // Starting reference point
    let currentPoint = [startLat, startLng];
    
    let lines = text.split("\n");
    for (let line of lines) {
        let match = line.match(/(North|South|East|West)\s?(\d+)\s?degrees\s?(\d+)\s?minutes\s?(\d+)\s?seconds\s?(East|West|North|South)?\s?(\d+\.\d+)\s?feet/i);
        if (match) {
            let bearing = convertBearing(match[1], parseInt(match[2]), parseInt(match[3]), parseInt(match[4]), match[5]);
            let distance = parseFloat(match[6]);

            let newPoint = movePoint(currentPoint, bearing, distance);
            parsedPoints.push(newPoint);
            currentPoint = newPoint;
        }
    }

    return parsedPoints;
}

// Converts bearings from legal descriptions into degrees
function convertBearing(dir1, degrees, minutes, seconds, dir2) {
    let decimalDegrees = degrees + (minutes / 60) + (seconds / 3600);
    if (dir1 === "South") decimalDegrees = 180 - decimalDegrees;
    if (dir2 === "West") decimalDegrees = 360 - decimalDegrees;
    return decimalDegrees;
}

// Moves a point based on bearing and distance
function movePoint(start, bearing, distanceFeet) {
    let distanceMeters = distanceFeet * 0.3048;
    let destination = turf.destination(turf.point(start), distanceMeters / 1000, bearing, { units: "kilometers" });
    return destination.geometry.coordinates.reverse();  // Reverse for Leaflet compatibility
}

// Exports data as GeoJSON
function exportGeoJSON() {
    let geojson = {
        type: "Feature",
        geometry: {
            type: "Polygon",
            coordinates: [boundaryPoints.map(p => [p[1], p[0]])] // Convert to GeoJSON format
        }
    };
    downloadFile(JSON.stringify(geojson, null, 2), "property.geojson");
}

// Exports data as KML
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

// Exports data as CAD DXF
function exportCAD() {
    let dxf = `0\nSECTION\n2\nHEADER\n0\nENDSEC\n0\nSECTION\n2\nTABLES\n0\nENDSEC\n0\nSECTION\n2\nBLOCKS\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n`;
    boundaryPoints.forEach((p, i) => {
        if (i < boundaryPoints.length - 1) {
            let next = boundaryPoints[i + 1];
            dxf += `0\nLINE\n8\n0\n10\n${p[1]}\n20\n${p[0]}\n11\n${next[1]}\n21\n${next[0]}\n`;
        }
    });
    dxf += `0\nENDSEC\n0\nEOF`;
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
