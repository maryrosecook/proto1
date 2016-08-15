;(function(exports) {
  exports.Rope = function(game, settings) {
    this.game = game;
    this.zindex = 0;
    this.color = "#000";
    this.angle = 180;
    this.bodies = [];

    this.initialise(settings.startPosition, settings.blockToAttachEndTo);
  };

  exports.Rope.prototype = {
    initialise: function(startPosition, blockToAttachEndTo) {
      var startBlock = this.game.c.entities.create(StaticBlock, {
        center: startPosition,
        size: { x: 10, y: 10 }
      });

      var previousLink = startBlock;
      for (var i = 1; i <= 10; i++) {
        var currentLink = this.createLink(previousLink.center);
        var jointPosition = {
          x: previousLink.center.x,
          y: previousLink.center.y + previousLink.size.y / 2
        };

        this.game.physics.createRevoluteJoint(previousLink, currentLink, jointPosition);

				previousLink = currentLink;
			}

      this.game.physics.createRevoluteJoint(previousLink,
                                            blockToAttachEndTo,
                                            blockToAttachEndTo.center);
    },

    update: function(delta) {
      this.bodies.forEach(function(body) {
        body.update();
      });
    },

    createLink: function(previousLinkCenter, angle) {
      var size = { x: 1, y: 40 };
      var link = this.game.c.entities.create(ChainBlock, {
        center: { x: previousLinkCenter.x, y: previousLinkCenter.y + size.y },
        size: size
      });

      link.body.SetAngle(link.body.GetPosition(), Maths.degToRad(90));


      this.bodies.push(link);
      return link;
    },
  };
})(this);
