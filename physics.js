;(function(exports) {
  var Physics = exports.Physics = function (game, gravity) {
    this.game = game;
		this.world = new Box2D.Dynamics.b2World(new Physics.Vec(gravity.x, gravity.y),
                                            true);
    setupContactListener(this.world);
    this.debugDrawer = new DebugDrawer(game.c.renderer.getCtx(), this.world);
    this.bodies = [];
    this.debug = false;
  };

  Physics.Vec = Box2D.Common.Math.b2Vec2;
  Physics.BOX_2D_SCALE = 0.1;
  Physics.scale = function(vector) {
    return {
      x: vector.x / Physics.BOX_2D_SCALE,
      y: vector.y / Physics.BOX_2D_SCALE
    };
  };

  Physics.prototype = {
    update: function(delta) {
      this.world.Step(delta, WORLD_VELOCITY_ITERATIONS, WORLD_POSITION_ITERATIONS);
		  this.world.ClearForces();
    },

    draw: function() {
      if (this.debug === true) {
        this.debugDrawer.draw();
      }
    },

    createBody: function(entity, bodySettings, shapeSettings) {
      var shape = this.createFixture(shapeSettings.shape, shapeSettings);
      var body = makeBody(this.world, entity, shape, bodySettings);
      this.bodies.push(body);
      return body;
    },

    createFixture: function(shapeName, settings) {
      settings.offset = settings.offset || { x: 0, y: 0 };
		  var fixtureDef = new Box2D.Dynamics.b2FixtureDef();
		  fixtureDef.density = settings.density !== undefined ? settings.density : 0.8;
		  fixtureDef.friction = settings.friction !== undefined ? settings.friction : 0;
		  fixtureDef.restitution = settings.restitution !== undefined ? settings.restitution : 0.5;
      fixtureDef.isSensor = settings.isSensor || false;
      fixtureDef.userData = settings.userData;
		  fixtureDef.shape = shapes[shapeName].create(settings.size, settings.offset);
      return fixtureDef;
    },

    destroyBody: function(body) {
      for (var i = 0; i < this.bodies.length; i++) {
        if (body === this.bodies[i]) {
          this.bodies.splice(i, 1);
          var self = this;
          this.game.c.runner.add(undefined, function() {
            self.world.DestroyBody(body);
          });
          return;
        }
      }
    },

    addRectangleSensor: function(body, settings) {
      settings = _.extend(settings, {
        density: 0,
        friction: 0,
        restitution: 0,
        isSensor: true
      });

		  var fixtureDef = this.createFixture("rectangle", settings);
	    body.CreateFixture(fixtureDef);
    },

    createRevoluteJoint: function(entity1, entity2, jointPosition) {
      var scaledJointPosition = new Physics.Vec(jointPosition.x * Physics.BOX_2D_SCALE,
                                            jointPosition.y * Physics.BOX_2D_SCALE);

      var jointDef = new Box2D.Dynamics.Joints.b2RevoluteJointDef();
      jointDef.Initialize(entity1.body, entity2.body, scaledJointPosition);
      return this.world.CreateJoint(jointDef);
    },

    destroyJoint: function(joint) {
      this.world.DestroyJoint(joint);
    },

    freeSpace: function(entity) {
      for (var i = 0; i < this.bodies.length; i++) {
        if (this.bodies[i].entity !== entity) {
          if (isIntersecting(entity, this.bodies[i].entity) === true) {
            return false;
          }
        }
      }

      return true;
    }
  };

  var shapes = {
    circle: {
      create: function(size, offset) {
        var shape = new Box2D.Collision.Shapes.b2CircleShape();
        this.setSize.call(shape, size, offset);
        return shape;
      },

      setSize: function(size, offset) {
		    this.SetRadius(size.x / 2 * Physics.BOX_2D_SCALE);
        if (offset !== undefined) {
          this.SetLocalPosition(new Physics.Vec(offset.x * Physics.BOX_2D_SCALE,
                                                offset.y * Physics.BOX_2D_SCALE));
        }
      }
    },

    rectangle: {
      create: function(size, offset) {
        var shape = new Box2D.Collision.Shapes.b2PolygonShape();
        this.setSize.call(shape, size, offset);
        return shape;
      },

      setSize: function(size, offset) {
        offset = offset || { x: 0, y: 0 };
        this.SetAsOrientedBox(size.x / 2 * Physics.BOX_2D_SCALE,
                              size.y / 2 * Physics.BOX_2D_SCALE,
                              new Physics.Vec(offset.x * Physics.BOX_2D_SCALE,
                                              offset.y * Physics.BOX_2D_SCALE));
      }
    },

    triangle: {
      create: function(size, offset) {
        var shape = new Box2D.Collision.Shapes.b2PolygonShape();
        this.setSize.call(shape, size, offset);
        return shape;
      },

      setSize: function(size, offset) {
        offset = offset || { x: 0, y: 0 };
        var shapeSizeScale = size.x * Physics.BOX_2D_SCALE;
        var box2dScaledOffset = Physics.scale(offset);

        // pointing down
 	      this.SetAsArray([
          new Physics.Vec(-shapeSizeScale * 0.5 + box2dScaledOffset.x,
                          shapeSizeScale * 0.5 + box2dScaledOffset.y), // left top
          new Physics.Vec( shapeSizeScale * 0.0 + box2dScaledOffset.x,
                           -shapeSizeScale * 0.5 + box2dScaledOffset.y), // bottom middle
          new Physics.Vec( shapeSizeScale * 0.5 + box2dScaledOffset.x,
                           shapeSizeScale * 0.5 + box2dScaledOffset.y) // right top
	      ]);
      }
    }
  };

  var setupContactListener = function(world) {
    var contactHandler = function(fixture1, fixture2, contactType) {
      if(fixture1.GetBody().entity !== undefined) {
        if(fixture1.GetBody().entity.collision !== undefined) {
          fixture1.GetBody().entity.collision(fixture2.GetBody().entity, contactType);
        }
      }

      if(fixture2.GetBody().entity !== undefined) {
        if(fixture2.GetBody().entity.collision !== undefined) {
          fixture2.GetBody().entity.collision(fixture1.GetBody().entity, contactType);
        }
      }
    };

    var WorldContactListener = function(){};
    WorldContactListener.prototype = new Box2D.Dynamics.b2ContactListener();
    WorldContactListener.prototype.BeginContact = function(contact) {
      contactHandler(contact.GetFixtureA(), contact.GetFixtureB(), "add");
    };

    WorldContactListener.prototype.EndContact = function(contact) {
      contactHandler(contact.GetFixtureA(), contact.GetFixtureB(), "remove");
    };

    world.SetContactListener(new WorldContactListener());
  };

  var isIntersecting = function(entity1, entity2) {
    return Coquette.Collider.Maths.rectanglesIntersecting(entity1, entity2);
  };

  var makeBody = function(world, entity, shape, settings) {
		var bodyDef = new Box2D.Dynamics.b2BodyDef();
		bodyDef.type = settings.type;
    bodyDef.bullet = settings.bullet || false;
    bodyDef.fixedRotation = settings.fixedRotation || false;
		bodyDef.position = new Physics.Vec(settings.center.x * Physics.BOX_2D_SCALE,
			                                 settings.center.y * Physics.BOX_2D_SCALE);

		var body = world.CreateBody(bodyDef);
    body.entity = entity;

    // mixin handy fns
    _.extend(body, physicalBodyFns);

    if (settings.bodyType !== undefined) {
      body.SetType(settings.bodyType);
    }

		body.CreateFixture(shape);

    if (settings.vec !== undefined) {
      body.setLinearVelocity(settings.vec);
    }

    entity.center = body.center();
    entity.vec = body.vec();
    entity.size = { x: settings.size.x, y: settings.size.y };
    entity.shape = settings.shape;

    return body;
  };

  var WORLD_VELOCITY_ITERATIONS = 6;
  var WORLD_POSITION_ITERATIONS = 6;

  var physicalBodyFns = {
    update: function() {
      this.entity.center = this.center();
      this.entity.vec = this.vec();
      this.entity.angle = this.angle();
    },

    setLinearVelocity: function(v) {
      this.m_linearVelocity.x = v.x;
      this.m_linearVelocity.y = v.y;
    },

    center: function() {
		  return Physics.scale(this.GetPosition());
    },

    push: function(vec, limit) {
      if (limit === undefined || Maths.magnitude(this.vec()) < limit) {
	      this.ApplyForce(new Physics.Vec(vec.x, vec.y), this.GetPosition());
      }
    },

    move: function(newCenter) {
      this.SetPosition(Physics.scale(newCenter))
      this.update();
    },

    rotateTo: function(dAngle) {
      this.SetAngle(Maths.degToRad(dAngle));
    },

    drag: function(ratio) {
	    this.ApplyForce(new Physics.Vec(-this.m_linearVelocity.x * ratio,
                              -this.m_linearVelocity.y * ratio),
                      this.GetPosition());
    },

    setSize: function(size) {
      var shape = this.GetFixtureList().GetShape(); // assumes only one shape on entity
      shapes[this.entity.shape].setSize.call(shape, size);
      this.entity.size = Maths.copyPoint(size);
    },

    vec: function() {
      return {
        x: this.m_linearVelocity.x,
        y: this.m_linearVelocity.y
      };
    },

    angle: function() {
      return Maths.radToDeg(this.GetAngle());
    },

    mass: function() {
      return this.GetMass();
    }
  };

  var DebugDrawer = function(ctx, world) {
    this.ctx = ctx;
    this.world = world;
    this.canvas = ctx.canvas;
		this.drawer = new Box2D.Dynamics.b2DebugDraw();
		this.drawer.SetSprite(this);
		this.drawer.SetDrawScale(1 / Physics.BOX_2D_SCALE);
		this.drawer.SetFillAlpha(0.5);
		this.drawer.SetLineThickness(1.0);
		this.drawer.SetFlags(Box2D.Dynamics.b2DebugDraw.e_shapeBit |
                         Box2D.Dynamics.b2DebugDraw.e_jointBit);
		this.world.SetDebugDraw(this.drawer);
  };

  DebugDrawer.prototype = {
	  draw: function() {
		  this.world.DrawDebugData();
	  },

	  clearRect: function() {},

	  beginPath: function() {
		  this.ctx.lineWidth = this.strokeWidth;
		  this.ctx.fillStyle = this.fillStyle;
		  this.ctx.strokeStyle = this.strokeSyle;
		  this.ctx.beginPath();
	  },

	  arc: function(x, y, radius, startAngle, endAngle, counterClockwise) {
		  this.ctx.arc(x, y, radius, startAngle, endAngle, counterClockwise);
	  },

	  closePath: function() {
		  this.ctx.closePath();
	  },

	  fill: function() {
		  this.ctx.fillStyle = this.fillStyle;
		  this.ctx.fill();
	  },

	  stroke: function() {
		  this.ctx.stroke();
	  },

	  moveTo: function(x, y) {
		  this.ctx.moveTo(x, y);
	  },

	  lineTo: function(x, y) {
		  this.ctx.lineTo(x, y);
		  this.ctx.stroke();
	  }
  };

  var isOpposite = function(a, b) {
    return (a <= 0 && b > 0) || (a >= 0 && b < 0);
  };
})(this);
