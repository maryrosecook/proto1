;(function(exports) {
  function Reticule(game, settings) {
    this.game = game;
    this.zindex = 2;
    this.center = settings.center;
    this.getPlayerCenter = settings.getPlayerCenter;
    this.size = { x: 5, y: 5 };
    this.color = "#000";
  };

  var RETICULE_DISTANCE_FROM_PLAYER = 130;

  Reticule.prototype = {
    getCenter: function() {
      return Maths.copyPoint(this.center);
    },

    update: function() {
      this.center = this.calculateReticuleCenter();
    },

    calculateReticuleCenter: function() {
      return Maths.addVectors(this.getPlayerCenter(),
                              this.calculateReticuleOffsetFromPlayer());
    },

    calculateReticuleOffsetFromPlayer: function() {
      var inputter = this.game.c.inputter;
      return Maths.vectorMultiply(Maths.unitVector({
        x: inputter.getControllerRightHorizontal(),
        y: inputter.getControllerRightVertical()
      }), RETICULE_DISTANCE_FROM_PLAYER);
    },

    draw: function() {
      this.game.drawer.circle(this.center, this.size.x / 2, undefined, this.color);
    }
  };

  exports.Reticule = Reticule;
})(this);
