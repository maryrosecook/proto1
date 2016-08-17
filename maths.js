;(function(exports) {
  exports.Maths = {
    copyPoint: function(point) {
      return { x: point.x, y: point.y };
    },

    opposite: function(dir) {
      return this.dirData(dir).opp;
    },

    // adds change to current.  Resets to zero and continues changing if limit passed.
    // doesn't allow for change that encompasses more than one revolution
    dial: function(current, change, limit) {
      var absolute = current + change;
      if(current === 0 && limit === 0) {
        return 0;
      }
      else if(change < 0 && absolute < 0) {
        return limit + (absolute % limit);
      }
      else if(change > 0 && absolute > limit) {
        return absolute % limit;
      }
      else {
        return absolute;
      }
    },

    dirData: function(dir) {
      for(var i in this.DIR) {
        if(this.DIR[i].id === dir) {
          return this.DIR[i];
        }
      }
    },

    equilateralTriangleHeight: function(width) {
      return width * Math.sqrt(3) / 2;
    },

    distributedVectors: function(num) {
      var v = [];
      var inc = 360 / num;
      for(var i = 0; i < num; i++) {
        v.push(this.angleToVector(i * inc));
      }

      return v;
    },

    vectorTo: function(start, end) {
      return {
        x: end.x - start.x,
        y: end.y - start.y
      };
    },

    spread: function(num) {
      return (num / 2) + num * Math.random();
    },

    jitter: function(value, proportion) {
      var maxAdjust = value * proportion;
      return (value - (maxAdjust / 2)) + (maxAdjust * Math.random());
    },

    randomElement: function(arrOrObj) {
      var i;
      if (arrOrObj instanceof Array) {
        return arrOrObj[Math.floor(arrOrObj.length * Math.random())];
      } else if (arrOrObj instanceof Object) {
        var keys = [];
        for (var i in arrOrObj) {
          if (arrOrObj.hasOwnProperty(i)) {
            keys.push(i);
          }
        }
        return arrOrObj[keys[Math.floor(Math.random() * keys.length)]];
      }
    },

    inside: function(point, obj) {
      objPos = this.floor(obj.pos);
      return point.x >= objPos.x
        && point.y >= objPos.y
        && point.x <= objPos.x + obj.size.x
        && point.y <= objPos.y + obj.size.y;
    },

    angleToVector: function(angle) {
      var r = this.degToRad(angle);

      var x = Math.cos(r) * 0 - Math.sin(r) * -1;
      var y = Math.sin(r) * 0 + Math.cos(r) * -1;
      var normalisedVec = this.unitVector({ x: x, y: y });
      return normalisedVec;
    },

    vectorToAngle: function(vec) {
      var unitVec = this.unitVector(vec);
      var uncorrectedDeg = this.radToDeg(Math.atan2(unitVec.x, -unitVec.y));
      var angle = uncorrectedDeg;
      if(uncorrectedDeg < 0) {
        angle = 360 + uncorrectedDeg;
      }

      return angle;
    },

    distance: function(pos1, pos2) {
      return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
    },

    // returns magnitude of passed vector
    magnitude: function(vector) {
      return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    },

    // returns unit vector of passed vector
    unitVector: function(vector) {
      var magnitude = this.magnitude(vector);
      if (magnitude === 0) {
        return { x: 0, y: 0 };
      } else {
        return {
          x: vector.x / this.magnitude(vector),
          y: vector.y / this.magnitude(vector)
        };
      }
    },

    vectorMultiply: function(vector, multiplier) {
      return {
        x: vector.x * multiplier,
        y: vector.y * multiplier
      };
    },

    addVectors: function(vector1, vector2) {
      return {
        x: vector1.x + vector2.x,
        y: vector1.y + vector2.y
      };
    },

    // returns dot product of two passed vectors
    dotProduct: function(vector1, vector2) {
      return vector1.x * vector2.x + vector1.y * vector2.y;
    },

    floor: function(pos) {
      return {
        x: Math.floor(pos.x),
        y: Math.floor(pos.y)
      };
    },

    identitySign: function(num) {
      return num < 0 ? -1 : 0;
    },

    withinRange: function(number, start, end) {
      return number >= start && number <= end;
    },

    // http://jsfiddle.net/justin_c_rounds/Gd2S2/
    lineLineCollisionPoint: function(line1, line2) {
      var line1StartX = line1.start.x,
          line1StartY = line1.start.y,
          line1EndX = line1.end.x,
          line1EndY = line1.end.y,
          line2StartX = line2.start.x,
          line2StartY = line2.start.y,
          line2EndX = line2.end.x,
          line2EndY = line2.end.y;

      // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
      var denominator, a, b, numerator1, numerator2, result = {
        x: null,
        y: null,
        onLine1: false,
        onLine2: false
      };
      denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
      if (denominator == 0) {
        return;
        // return result;
      }
      a = line1StartY - line2StartY;
      b = line1StartX - line2StartX;
      numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
      numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
      a = numerator1 / denominator;
      b = numerator2 / denominator;

      // if we cast these lines infinitely in both directions, they intersect here:
      result.x = line1StartX + (a * (line1EndX - line1StartX));
      result.y = line1StartY + (a * (line1EndY - line1StartY));
      /*
      // it is worth noting that this should be the same as:
      x = line2StartX + (b * (line2EndX - line2StartX));
      y = line2StartX + (b * (line2EndY - line2StartY));
      */
      // if line1 is a segment and line2 is infinite, they intersect if:
      if (a > 0 && a < 1) {
        result.onLine1 = true;
      }
      // if line2 is a segment and line1 is infinite, they intersect if:
      if (b > 0 && b < 1) {
        result.onLine2 = true;
      }
      // if line1 and line2 are segments, they intersect if both of the above are true
      if (result.onLine1 && result.onLine2) {
        return result;
      }
    },

    // from: http://www.xarg.org/2010/06/is-an-angle-between-two-other-angles/
    withinSegment: function(n, a, b) {
	    n = (360 + (n % 360)) % 360;
	    a = (3600000 + a) % 360;
	    b = (3600000 + b) % 360;

	    if (a < b) {
		    return a <= n && n <= b;
      }
	    return a <= n || n <= b;
    },

    quickestDirection: function(start, end, limit) {
      var halfLimit = limit / 2;
      if(end > start) {
        return end - start <= halfLimit ? this.DIR.RIGHT.id : this.DIR.LEFT.id;
      }
      else {
        return start - end < halfLimit ? this.DIR.LEFT.id : this.DIR.RIGHT.id;
      }
    },

    timePassed: function(last, interval) { return last + interval < new Date().getTime(); },

    zero: function() { return { x:0, y:0 }; },

    surroundingSpawnPoint: function(center, minDistance) {
      var rand = Math.random();
      if (rand < 0.25) { // top
        return {
          x: center.x - minDistance + Maths.spread(minDistance),
          y: center.y - minDistance * .5
        };
      } else if (rand < 0.5) { // right
        return {
          x: center.x + minDistance * .5,
          y: center.y - minDistance + Maths.spread(minDistance),
        };
      } else if (rand < 0.75) { // bottom
        return {
          x: center.x - minDistance + Maths.spread(minDistance),
          y: center.y + minDistance * .5
        };
      } else { // left
        return {
          x: center.x - minDistance * .5,
          y: center.y - minDistance + Maths.spread(minDistance),
        };
      }
    },

    degToRad: function(degrees) { return 0.01745 * degrees; },
    radToDeg: function(rad) { return rad / 0.01745; },

    colors: {
      red: "#FF2600",
      orange: "#FFB432",
      yellow: "#FFF700",
      green: "#4DFA51",
      blue: "#5669FF",
      indigo: "#5669FF",
      violet: "#8A6CFF"
    }
  };
})(this);
