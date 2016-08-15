;(function(exports) {
  function Game() {
    this.c = new Coquette(this, "canvas", 600, 600, "#fff");
    this.c.collider.update = function() {}; // collision notifications handled by box2d

    this.physics = new Physics(this, { x: 0, y: 0.0002 });
    // this.physics = new Physics(this, { x: 0, y: 0 });
    this.drawer = new Drawer(this, this.c.renderer._ctx);
    this.setupEntities();
  };

  Game.prototype = {
    setupEntities: function() {
      this.player = this.c.entities.create(Player, {
        center: { x: 200, y: 520 }
      });

      this.block = this.c.entities.create(StaticBlock, {
        center: { x: 450, y: 600 },
        size: { x: 600, y: 40 }
      });
    },

    update: function(delta) {
      this.physics.update(delta);
    },

    draw: function(delta) {
      this.physics.draw();
    }
  };

  exports.Game = Game;
})(this);
