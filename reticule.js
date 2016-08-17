;(function(exports) {
  function Reticule(game, settings) {
    this.game = game;
    this.zindex = 2;
    this.center = settings.center;
    this._getPlayerCenter = settings.getPlayerCenter;
    this.size = { x: 5, y: 5 };
    this.color = "#f00";
  };

  var RETICULE_DISTANCE_FROM_PLAYER = 1000;

  Reticule.prototype = {
    getOffScreenLineEnd: function() {
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

    draw: function() {
      this.game.drawer.line(this._getPlayerCenter(),
                            this.getOffScreenLineEnd(),
                            0.3,
                            this.color);
    }
  };

  exports.Reticule = Reticule;
})(this);
