var Fayde;
(function (Fayde) {
    (function (Zoomer) {
        Zoomer.Version = '0.1.0';
    })(Fayde.Zoomer || (Fayde.Zoomer = {}));
    var Zoomer = Fayde.Zoomer;
})(Fayde || (Fayde = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Fayde;
(function (Fayde) {
    (function (_Zoomer) {
        var Size = Fayde.Utils.Size;
        var Vector = Fayde.Utils.Vector;

        var MAX_FPS = 100;
        var MAX_MSPF = 1000 / MAX_FPS;

        var Origin;
        (function (Origin) {
            Origin[Origin["Center"] = 0] = "Center";
            Origin[Origin["TopLeft"] = 1] = "TopLeft";
            Origin[Origin["BottomLeft"] = 2] = "BottomLeft";
            Origin[Origin["TopRight"] = 3] = "TopRight";
            Origin[Origin["BottomRight"] = 4] = "BottomRight";
            Origin[Origin["Arbitrary"] = 5] = "Arbitrary";
        })(Origin || (Origin = {}));

        var Zoomer = (function (_super) {
            __extends(Zoomer, _super);
            function Zoomer() {
                _super.call(this);
                this.AnimationSpeed = 250;
                this.ZoomFactor = 2;
                this.ZoomContentOffset = new Vector(0, 0);
                this._LastVisualTick = new Date(0).getTime();
                this._ConstrainToViewport = true;
                this._Origin = 0 /* Center */;
                this._IsMouseDown = false;
                this._IsDragging = false;
                this._MouseDelta = new Vector(0, 0);
                this._DragVelocity = new Vector(0, 0);
                this._DragAcceleration = new Vector(0, 0);
                this._VelocityAccumulationTolerance = 10;
                this._DragMinSpeed = 2;
                this._DragMaxSpeed = 30;
                this._DragFriction = 2;
                this.ZoomUpdated = new MulticastEvent();
                this.DefaultStyleKey = this.constructor;

                this._TweenEasing = TWEEN.Easing.Quadratic.InOut;

                this.MouseLeftButtonDown.Subscribe(this.Zoomer_MouseLeftButtonDown, this);
                this.MouseLeftButtonUp.Subscribe(this.Zoomer_MouseLeftButtonUp, this);
                this.MouseMove.Subscribe(this.Zoomer_MouseMove, this);

                this._Timer = new Fayde.ClockTimer();
                this._Timer.RegisterTimer(this);
            }
            Zoomer.prototype.OnZoomLevelChanged = function (args) {
                this._ZoomTo(this.ZoomLevel);
            };

            Object.defineProperty(Zoomer.prototype, "ZoomContentSize", {
                get: function () {
                    if (!this._ZoomContentSize) {
                        this._ZoomContentSize = this.ViewportSize;
                    }
                    return this._ZoomContentSize;
                },
                set: function (value) {
                    this._ZoomContentSize = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Zoomer.prototype, "ViewportSize", {
                get: function () {
                    return new Size(this.Width, this.Height);
                },
                enumerable: true,
                configurable: true
            });

            Zoomer.prototype.OnTicked = function (lastTime, nowTime) {
                var now = new Date().getTime();
                if (now - this._LastVisualTick < MAX_MSPF)
                    return;
                this._LastVisualTick = now;

                TWEEN.update(nowTime);
                this._AddVelocity();
            };

            Zoomer.prototype.OnApplyTemplate = function () {
                _super.prototype.OnApplyTemplate.call(this);

                this._ZoomTo(this.ZoomLevel);
            };

            Zoomer.prototype._ZoomTo = function (level) {
                var _this = this;
                this._OnZoomUpdated();

                var newSize = this._GetZoomTargetSize(level);

                var zoomTween = new TWEEN.Tween(this.ZoomContentSize).to(newSize, this.AnimationSpeed).delay(0).easing(this._TweenEasing).onUpdate(function () {
                    _this._OnZoomUpdated();
                }).onComplete(function () {
                    console.log("zoomLevel: " + _this.ZoomLevel);
                    console.log("width: " + _this.ZoomContentSize.Width);
                });

                zoomTween.start(this._LastVisualTick);

                var newScroll = this._GetZoomTargetScroll(newSize);

                this._ScrollTo(newScroll);
            };

            Zoomer.prototype._OnZoomUpdated = function () {
                this.ZoomUpdated.Raise(this, new _Zoomer.ZoomerEventArgs(this.ZoomContentSize, this.ZoomContentOffset));
            };

            Zoomer.prototype._GetZoomTargetSize = function (level) {
                var newWidth = Math.pow(this.ZoomFactor, level) * this.Width;
                var newHeight = this.ZoomContentSize.AspectRatio * newWidth;

                return new Size(newWidth, newHeight);
            };

            Zoomer.prototype._ScrollTo = function (newScroll) {
                var _this = this;
                var scrollTween = new TWEEN.Tween(this.ZoomContentOffset).to(newScroll, this.AnimationSpeed).delay(0).easing(this._TweenEasing).onUpdate(function () {
                    _this._Constrain();
                });

                scrollTween.start(this._LastVisualTick);
            };

            Zoomer.prototype._Constrain = function () {
                if (this._ConstrainToViewport) {
                    if (this.ZoomContentOffset.X > 0) {
                        this.ZoomContentOffset.X = 0;
                    }

                    if (this.ZoomContentOffset.X < (this.ZoomContentSize.Width - this.ViewportSize.Width) * -1) {
                        this.ZoomContentOffset.X = (this.ZoomContentSize.Width - this.ViewportSize.Width) * -1;
                    }

                    if (this.ZoomContentOffset.Y > 0) {
                        this.ZoomContentOffset.Y = 0;
                    }

                    if (this.ZoomContentOffset.Y < (this.ZoomContentSize.Height - this.ViewportSize.Height) * -1) {
                        this.ZoomContentOffset.Y = (this.ZoomContentSize.Height - this.ViewportSize.Height) * -1;
                    }
                }
            };

            Zoomer.prototype._GetZoomTargetScroll = function (targetSize) {
                var currentOrigin = this._GetZoomContentOrigin(this.ZoomContentSize);
                var nextOrigin = this._GetZoomContentOrigin(targetSize);
                var diff = Vector.Sub(nextOrigin, currentOrigin);
                var targetScroll = Vector.Sub(this.ZoomContentOffset, diff);

                return targetScroll;
            };

            Zoomer.prototype._GetZoomContentOrigin = function (size) {
                switch (this._Origin) {
                    case 0 /* Center */:
                        return new Vector(size.Width / 2, size.Height / 2);
                        break;
                    case 1 /* TopLeft */:
                        return new Vector(0, 0);
                        break;
                    case 2 /* BottomLeft */:
                        return new Vector(0, size.Height);
                        break;
                    case 3 /* TopRight */:
                        return new Vector(size.Width, 0);
                        break;
                    case 4 /* BottomRight */:
                        return new Vector(size.Width, size.Height);
                        break;
                }
            };

            Zoomer.prototype._AddVelocity = function () {
                var mouseStopped = false;

                if (this._LastDragAccelerationMousePosition && this._LastDragAccelerationMousePosition.Equals(this._MousePosition)) {
                    mouseStopped = true;
                }

                this._LastDragAccelerationMousePosition = this._MousePosition;

                if (this._IsDragging) {
                    if (mouseStopped) {
                        this._RemoveVelocity();
                    } else {
                        if (this._MouseDelta.Mag() > this._VelocityAccumulationTolerance) {
                            this._DragAcceleration.Add(this._MouseDelta);

                            this._DragVelocity.Add(this._DragAcceleration);
                            this._DragVelocity.Limit(this._DragMaxSpeed);
                        }
                    }
                } else {
                    if (this._DragVelocity.Mag() > this._DragMinSpeed) {
                        var friction = this._DragVelocity.Get();
                        friction.Mult(-1);
                        friction.Normalise();
                        friction.Mult(this._DragFriction);
                        this._DragAcceleration.Add(friction);

                        this._DragVelocity.Add(this._DragAcceleration);

                        this.ZoomContentOffset.Add(this._DragVelocity);
                    }
                }

                this._DragAcceleration.Mult(0);

                this._Constrain();
            };

            Zoomer.prototype._RemoveVelocity = function () {
                this._DragVelocity.Mult(0);
            };

            Zoomer.prototype.Zoomer_MouseLeftButtonDown = function (sender, e) {
                this._IsMouseDown = true;
                this._RemoveVelocity();
            };

            Zoomer.prototype.Zoomer_MouseLeftButtonUp = function (sender, e) {
                this._IsMouseDown = false;
                this._IsDragging = false;
            };

            Zoomer.prototype.Zoomer_MouseMove = function (sender, e) {
                if (this._IsMouseDown) {
                    this._IsDragging = true;
                }

                this._LastMousePosition = this._MousePosition || new Vector(0, 0);
                this._MousePosition = new Vector(e.AbsolutePos.X, e.AbsolutePos.Y);

                this._MouseDelta = this._MousePosition.Get();
                this._MouseDelta.Sub(this._LastMousePosition);

                if (this._IsDragging) {
                    this.ZoomContentOffset.Add(this._MouseDelta);
                }
            };
            Zoomer.ZoomLevelProperty = DependencyProperty.RegisterFull("ZoomLevel", function () {
                return Number;
            }, Zoomer, 0, function (d, args) {
                return d.OnZoomLevelChanged(args);
            });
            return Zoomer;
        })(Fayde.Controls.ContentControl);
        _Zoomer.Zoomer = Zoomer;
    })(Fayde.Zoomer || (Fayde.Zoomer = {}));
    var Zoomer = Fayde.Zoomer;
})(Fayde || (Fayde = {}));
var Fayde;
(function (Fayde) {
    (function (Zoomer) {
        var ZoomerEventArgs = (function (_super) {
            __extends(ZoomerEventArgs, _super);
            function ZoomerEventArgs(size, offset) {
                _super.call(this);
                Object.defineProperty(this, 'Size', { value: size, writable: false });
                Object.defineProperty(this, 'Offset', { value: offset, writable: false });
            }
            return ZoomerEventArgs;
        })(EventArgs);
        Zoomer.ZoomerEventArgs = ZoomerEventArgs;
    })(Fayde.Zoomer || (Fayde.Zoomer = {}));
    var Zoomer = Fayde.Zoomer;
})(Fayde || (Fayde = {}));
//# sourceMappingURL=Fayde.Zoomer.js.map
