;(function(exports) {
  exports.MoveableBlock = function(game, settings) {
    this.game = game;
    this.zindex = 0;
    this.color = "#000";
    this.angle = 180;

    this.body = game.physics.createBody(this, {
      type: Box2D.Dynamics.b2Body.b2_dynamicBody,
      center: settings.center,
      size: settings.size
    }, {
      shape: "rectangle",
      size: settings.size
    });
  };

  exports.MoveableBlock.prototype = {
    update: function(delta) {
      this.body.update();
    },

    draw: function(ctx) {
      this.game.drawer.rectangle(this.center, this.size, this.color, this.color);
    }
  };
})(this);
