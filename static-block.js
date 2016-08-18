;(function(exports) {
  exports.StaticBlock = function(game, settings) {
    this.game = game;
    this.zindex = 0;
    this.color = "#000";
    this.angle = 180;

    this.body = game.physics.createBody(this, {
      type: Box2D.Dynamics.b2Body.b2_staticBody,
      center: settings.center,
      size: settings.size
    }, {
      shape: "rectangle",
      size: settings.size,
      restitution: 0,
      friction: 0.2
    });
  };

  exports.StaticBlock.prototype = {
    update: function(delta) {
      this.body.update();
    },

    draw: function(ctx) {
      this.game.drawer.rectangle(this.center, this.size, this.color, this.color);
    }
  };
})(this);
