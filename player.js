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
      restitution: 0
    });

    this.game.physics.addRectangleSensor(this.body, {
      shape: "rectangle",
      size: { x: this.size.x, y: 1 },
      offset: { x: 0, y: (this.size.y / 2) - 2 },
      userData: {
        id: "bottomSensor"
      }
    });
  };

  exports.Player.prototype = {
    SPEED: 0.0002,
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
      var vec = { x: 0, y: 0 };

      if (inputter.isDown(inputter.A)) {
        vec.x = -this.SPEED;
      } else if (inputter.isDown(inputter.E)) {
        vec.x = this.SPEED
      }

      var unitVec = Maths.unitVector(vec);
      var pushVec = {
        x: unitVec.x * this.SPEED,
        y: unitVec.y * this.SPEED
      };

      this.body.push(pushVec);
    },

    handleJumping: function() {
      var inputter = this.game.c.inputter;
      if (inputter.isPressed(inputter.COMMA) &&
          this.canStartJump()) {
        this.startJump();
      } else {
        this.stopJump();
      }
    },

    handleRoping: function() {
      var inputter = this.game.c.inputter;
      if (inputter.isPressed(inputter.LEFT_MOUSE)) {
        this.createRope();
      }
    },

    jumping: false,
    startJump: function() {
		  this.body.ApplyForce(new Physics.Vec(0, this.jumpForce()), this.body.GetPosition());
      this.jumping = true;
      this.destroyRope();
    },

    createRope: function() {
      var inputter = this.game.c.inputter;
      this.destroyRope();
      this.rope = game.c.entities.create(Rope, {
        startPosition: inputter.getMousePosition(),
        endBlock: this
      });
    },

    destroyRope: function() {
      if (this.rope) {
        this.rope.destroy();
        this.rope = undefined;
      }
    },

    canStartJump: function() {
      return (this.body.m_linearVelocity.y >= -0.01 // stops v quick sequence jumps from
                                               // bottomSensor (not needed for side
                                               // sensors because they can't be used twice in
                                               // a row
                                               // can't be 0 because moving with skewered blk
                                               // gives little bumps upwards
              && this.hasFooting()) ||
        this.rope;
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

    jumpForce: function() {
      return -0.01;
    },

    stopJump: function() {
      if(this.jumping === true &&
         this.body.m_linearVelocity.y < 0) { // still going up
        // this.body.m_linearVelocity.y = 0;
        this.jumping = false;
      }
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
