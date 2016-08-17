;(function(exports) {
  function lineRectanglesIntersectionPoints(rectangularEntities, line1) {
    var lines = rectangularEntities
      .map(function(entity) {
        return rectangleLines(entity.center, entity.size);
      })
      .reduce(function (lines, entityLines) {
        return lines.concat(entityLines);
      }, [])
      .map(function(line2) {
        return Maths.lineLineCollisionPoint(line1, line2);
      })
      .filter(function(intersectionPoint) {
        return intersectionPoint !== undefined;
      });

    return lines;
  };

  function rectangleLines(center, size) {
    return [
      {
        // top
        start: { x: center.x - size.x / 2, y: center.y - size.y / 2 },
        end: { x: center.x + size.x / 2, y: center.y - size.y / 2 }
      }, {
        // right
        start: { x: center.x + size.x / 2, y: center.y - size.y / 2 },
        end: { x: center.x + size.x / 2, y: center.y + size.y / 2 }
      }, {
        // bottom
        start: { x: center.x + size.x / 2, y: center.y + size.y / 2 },
        end: { x: center.x - size.x / 2, y: center.y + size.y / 2 }
      }, {
        // left
        start: { x: center.x - size.x / 2, y: center.y + size.y / 2 },
        end: { x: center.x - size.x / 2, y: center.y - size.y / 2 }
      }
    ];
  };

  exports.lineRectanglesIntersectionPoints = lineRectanglesIntersectionPoints;
})(this);
