;(function(exports) {
  function Game() {
    this.c = new Coquette(this, "canvas", 1000, 600, "#fff");
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

      this.c.entities.create(StaticBlock, {
        center: { x: 250, y: 800 },
        size: { x: 200, y: 20 }
      });

      for (var i = 0; i < 100; i++) {
        this.c.entities.create(StaticBlock, {
          center: { x: i * 250, y: 350 },
          size: { x: 200, y: 20 }
        });
      }
    },

    update: function(delta) {
      this.physics.update(delta);
      this.c.renderer.setViewCenter({
        x: this.player.center.x,
        y: this.player.center.y - this.c.renderer.getViewSize().y / 4
      });
    },

    draw: function(delta) {
      this.physics.draw();
    }
  };

  exports.Game = Game;
})(this);
