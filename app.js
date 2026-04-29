document.getElementById("insight-text").innerHTML = `
  Total Demand: ${insidePoints.length + outsidePoints.length} <br>
  Covered: ${insidePoints.length} <br>
  Not Covered: ${outsidePoints.length} <br><br>

  There are significant uncovered areas indicating potential expansion zones.
`;