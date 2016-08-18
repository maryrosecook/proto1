;(function(exports) {
  exports.Player = function(game, settings) {
    this.game = game;
    this.zindex = 0;
    this.color = "#000";
    this.angle = 180;

    var size = { x: 20, y: 20 };
    this.body = game.physics.createBody(this, {
      type: Box2D.Dynamics.b2Body.b2_dynamicBody,
      center: settings.center,
      size: size,
      fixedRotation: true
    }, {
      shape: "rectangle",
      size: size,
      density: 0.4,
      restitution: 0,
      friction: 0.2
    });

    this.game.physics.addRectangleSensor(this.body, {
      shape: "rectangle",
      size: { x: this.size.x, y: 1 },
      offset: { x: 0, y: (this.size.y / 2) - 2 },
      userData: {
        id: "bottomSensor"
      }
    });

    var self = this;
    this.reticule = this.game.c.entities.create(Reticule, {
      center: { x: this.center.x, y: this.center.y - 30 },
      getPlayerCenter: function () {
        return Maths.copyPoint(self.center);
      }
    });
  };

  exports.Player.prototype = {
    GROUND_SPEED: 0.0002,
    ROPE_SPEED: 0.0004,
    SPEED_LIMIT: 0.1,
    DRAG_RATIO: 0.005,

    update: function(delta) {
      this.handleMovingHorizontally();
      this.handleJumping();
      this.handleRoping();
      this.body.update();
      this.body.drag(this.DRAG_RATIO);
    },

    handleMovingHorizontally: function() {
      var inputter = this.game.c.inputter;
      var vec = { x: inputter.getControllerLeftHorizontal(), y: 0 };

      var unitVec = Maths.unitVector(vec);
      var speed = this.rope ? this.ROPE_SPEED : this.GROUND_SPEED;
      var pushVec = {
        x: unitVec.x * speed * Math.abs(inputter.getControllerLeftHorizontal()),
        y: unitVec.y * speed
      };

      this.body.push(pushVec);
    },

    jumpState: "not-jumping",
    handleJumping: function() {
      var inputter = this.game.c.inputter;
      if (inputter.isPressed(inputter.CONTROLLER_X) &&
          (this.rope ||
           (this.body.m_linearVelocity.y >= -0.01 &&
            this.hasFooting()))) {
		    this.body.ApplyForce(new Physics.Vec(0, -0.01), this.body.GetPosition());
        this.jumpState = "jumping";
        this.destroyRope();
      } else if (inputter.isDown(inputter.CONTROLLER_X)) {
        this.body.ApplyForce(new Physics.Vec(0, -0.0001), this.body.GetPosition());
      } else if (!inputter.isDown(inputter.CONTROLLER_X)) {
        if (this.jumpState === "jumping") {
          this.jumpState = "stopping-jumping";
        } else if (this.jumpState === "stopping-jumping" && this.body.m_linearVelocity.y >= 0) {
          this.jumpState = "not-jumping";
        } else if (this.jumpState === "stopping-jumping") {
          this.body.ApplyForce(new Physics.Vec(0, 0.0007), this.body.GetPosition());
        }
      }
    },

    handleRoping: function() {
      var inputter = this.game.c.inputter;
      if (inputter.isPressed(inputter.CONTROLLER_R1)) {
        var self = this;
        var ropeFastenPoint = lineRectanglesIntersectionPoints(this.ropableBlocks(), {
          start: this.center,
          end: this.reticule.getOffScreenLineEnd()
        }).sort(function(point1, point2) {
          return Maths.distance(point1, self.center) -
            Maths.distance(point2, self.center);
        })[0];

        if (ropeFastenPoint) {
          this.createRope(ropeFastenPoint);
        }
      }
    },

    ropableBlocks: function() {
      var self = this;
      return this.game.c.entities
        .all(StaticBlock)
        .filter(function(block) {
          return this.game.c.renderer.onScreen(block)
        });
    },

    createRope: function(position) {
      var inputter = this.game.c.inputter;
      this.destroyRope();
      this.rope = game.c.entities.create(Rope, {
        startPosition: position,
        endBlock: this
      });
    },

    destroyRope: function() {
      if (this.rope) {
        this.rope.destroy();
        this.rope = undefined;
      }
    },

    hasFooting: function() {
      return this.jumpableContactCount(this.body.m_contactList) > 0;
    },

    jumpableContactCount: function(contact) {
      if(contact === null) return 0;

      return this.isJumpableContact(contact) ? 1 : 0
        + this.jumpableContactCount(contact.next);
    },

    isJumpableContact: function(edge) {
      var sensorFixture = this.sensorSplitEdge(edge).sensorFixture;
      var otherEntity = edge.other.entity;

      // console.log(sensorFixture !== undefined,
      //             this.isBottomSensorTouching(), // don't auto allow slipping
      //             this.isASensor(sensorFixture))

      return sensorFixture !== undefined &&
        this.isASensor(sensorFixture);
    },

    draw: function(ctx) {
      this.game.drawer.rectangle(this.center, this.size, undefined, this.color);
    },

    // split edge into sensor and other shape
    sensorSplitEdge: function(edge) {
      var fixture1 = edge.contact.m_fixtureA;
      var fixture2 = edge.contact.m_fixtureB;
      var sensorFixture, otherFixture;

      if(fixture1 !== undefined
         && this.fixtureIdIsOneOf(fixture1, ["bottomSensor"])) {
        sensorFixture = fixture1;
        otherFixture = fixture2;
      }
      else if(fixture2 !== undefined
              && this.fixtureIdIsOneOf(fixture2, ["bottomSensor"])) {
        sensorFixture = fixture2;
        otherFixture = fixture1;
      }

      return { sensorFixture: sensorFixture, otherFixture: otherFixture };
    },

    isASensor: function(fixture) {
      return this.fixtureIdIsOneOf(fixture, ["bottomSensor"]);
    },

    fixtureIdIsOneOf: function(fixture, ids) {
      for(var i = 0; i < ids.length; i++) {
        if(this.fixtureIdIs(fixture, ids[i])) {
          return true;
        }
      }

      return false;
    },

    fixtureIdIs: function(fixture, id) {
      return fixture.m_userData && fixture.m_userData.id === id;
    },

    isBottomSensorTouching: function() {
      var edge = this.body.m_contactList;
      while(edge !== null) {
        var sensorSplitEdge = this.sensorSplitEdge(edge);
        if(sensorSplitEdge.sensorFixture !== undefined
           && this.fixtureIdIs(sensorSplitEdge.sensorFixture, "bottomSensor")) {
          return true;
        }

        edge = edge.next;
      }

      return false;
    }
  };
})(this);
