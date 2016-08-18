;(function(exports) {
  exports.Rope = function(game, settings) {
    this.game = game;
    this.zindex = 0;
    this.color = "#000";
    this.angle = 180;
    this.entities = [];

    this.initialise(settings.startCenter, settings.endBlock, settings.endBlockJointCenter);
  };

  var NUMBER_OF_LINKS = 10;

  exports.Rope.prototype = {
    initialise: function(startCenter, endBlock, endBlockJointCenter) {
      var angle = Maths.vectorToAngle(Maths.vectorTo(startCenter,
                                                     endBlock.center));

      var linkLength = Maths.distance(startCenter, endBlockJointCenter) / NUMBER_OF_LINKS;
      var xDelta = endBlockJointCenter.x - startCenter.x;
      var yDelta = endBlockJointCenter.y - startCenter.y;

      var xStep = xDelta / NUMBER_OF_LINKS;
      var yStep = yDelta / NUMBER_OF_LINKS;

      var startBlock = this.game.c.entities.create(StaticBlock, {
        center: startCenter,
        size: { x: 10, y: 10 }
      });

      this.entities.push(startBlock);

      var previousLink = startBlock;
      for (var i = 1; i <= NUMBER_OF_LINKS; i++) {
        var linkCenter = { x: previousLink.center.x + xStep, y: previousLink.center.y + yStep };
        var currentLink = this.createLink(linkCenter, linkLength, angle);
        var jointPosition = {
          x: previousLink.center.x + xStep / 2,
          y: previousLink.center.y + yStep / 2
        };

        this.game.physics.createRevoluteJoint(previousLink, currentLink, jointPosition);

				previousLink = currentLink;
			}

      this.game.physics.createRevoluteJoint(previousLink,
                                            endBlock,
                                            endBlockJointCenter);
    },

    update: function(delta) {
      this.entities.forEach(function(entity) {
        entity.update();
      });
    },

    createLink: function(center, length, angle) {
      var size = { x: 1, y: length };
      var link = this.game.c.entities.create(ChainBlock, {
        center: center,
        size: size
      });

      link.body.SetTransform({
        position: link.body.GetPosition(),
        GetAngle: function() { return Maths.degToRad(angle) }
      });

      this.entities.push(link);
      return link;
    },

    destroy: function() {
      var self = this;
      this.entities.forEach(function(entity) {
        self.game.physics.destroyBody(entity.body);
        this.game.c.entities.destroy(entity);
      });
    }
  };
})(this);
