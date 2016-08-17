;(function(exports) {
  function Reticule(game, settings) {
    this.game = game;
    this.zindex = 2;
    this.center = settings.center;
    this._getPlayerCenter = settings.getPlayerCenter;
    this.size = { x: 5, y: 5 };
    this.color = "#000";
  };

  var RETICULE_DISTANCE_FROM_PLAYER = 130;

  Reticule.prototype = {
    getCenter: function() {
      return Maths.copyPoint(this.center);
    },

    getOffScreenLineEnd: function() {
      var offsetFromPlayer =
          Maths.vectorMultiply(Maths.vectorTo(this._getPlayerCenter(), this.getCenter()),
                               100);

      return Maths.addVectors(this._getPlayerCenter(), offsetFromPlayer);
    },

    _calculateReticuleCenter: function() {
      return Maths.addVectors(this._getPlayerCenter(),
                              this._calculateReticuleOffsetFromPlayer());
    },

    _calculateReticuleOffsetFromPlayer: function() {
      var inputter = this.game.c.inputter;
      return Maths.vectorMultiply(Maths.unitVector({
        x: inputter.getControllerRightHorizontal(),
        y: inputter.getControllerRightVertical()
      }), RETICULE_DISTANCE_FROM_PLAYER);
    },

    update: function() {
      this.center = this._calculateReticuleCenter();
    },

    draw: function() {
      this.game.drawer.circle(this.center, this.size.x / 2, undefined, this.color);
    }
  };

  exports.Reticule = Reticule;
})(this);
