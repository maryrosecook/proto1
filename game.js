;(function(exports) {
  function Game() {
    this.c = new Coquette(this, "canvas", 1000, 600, "#fff");
    this.c.collider.update = function() {}; // collision notifications handled by box2d

    this.physics = new Physics(this, { x: 0, y: 0.0002 });
    // this.physics = new Physics(this, { x: 0, y: 0 });
    this.drawer = new Drawer(this, this.c.renderer._ctx);
    this.setupEntities();
  };

  var WORLD_SIZE = {
    x: 5000,
    y: 5000
  };

  var PLATFORM_COUNT = 100;

  Game.prototype = {
    setupEntities: function() {
      var playerStart = { x: WORLD_SIZE.x / 2, y: WORLD_SIZE.y };

      this.player = this.c.entities.create(Player, {
        center: playerStart
      });

      // platform to start on
      this.c.entities.create(StaticBlock, {
        center: { x: playerStart.x, y: playerStart.y + 50 },
        size: { x: 200, y: 20 }
      });

      // platforms
      for (var i = 0; i < PLATFORM_COUNT; i++) {
        this.c.entities.create(StaticBlock, {
          center: this.randomBlockCenter(),
          size: { x: 100, y: 25 }
        });
      }

      // goal platform
      this.c.entities.create(StaticBlock, {
        center: { x: WORLD_SIZE.x / 2, y: 0 },
        size: { x: 200, y: 20 },
        color: "#ff0"
      });
    },

    randomBlockCenter: function() {
      return {
        x: WORLD_SIZE.x * Math.random(),
        y: WORLD_SIZE.y * Math.random(),
      };
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
