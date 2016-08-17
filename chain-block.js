;(function(exports) {
  exports.ChainBlock = function(game, settings) {
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
      density: 10,
      restitution: 0.2,
      friction: 0.5,
      size: settings.size,
      categoryBits: 0x0001
    });
  };

  exports.ChainBlock.prototype = {
    update: function(delta) {
      this.body.update();
    },

    draw: function(ctx) {
      this.game.drawer.rectangle(this.center, this.size, undefined, this.color);
    }
  };
})(this);
