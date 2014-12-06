var Fayde;
(function (Fayde) {
    var Zoomer;
    (function (Zoomer) {
        Zoomer.Version = '0.2.2';
    })(Zoomer = Fayde.Zoomer || (Fayde.Zoomer = {}));
})(Fayde || (Fayde = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Fayde;
(function (Fayde) {
    var Zoomer;
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
        /*
        * Todo
        * You are manually trying to calculate positions and scales on the screen.
        * Instead, you could use RenderTransform and RenderTransformOrigin to intelligently align everything.
        * RenderTransform can be a ScaleTransform, RotateTransform, TranslateTransform, MatrixTransform, or even a TransformGroup (composite).
        * RenderTransformOrigin is a point in a relative coordinate system.
        * Specifying (1,1) will use the bottom right corner of the visual.
         */
        var Zoomer = (function (_super) {
            __extends(Zoomer, _super);
            function Zoomer() {
                _super.call(this);
                this.AnimationSpeed = 250;
                this.ZoomFactor = 2;
                this.ZoomContentOffset = new Vector(0, 0);
                this._LastVisualTick = new Date(0).getTime();
                this._Origin = 0 /* Center */;
                this._IsMouseDown = false;
                this._IsDragging = false;
                this._MouseDelta = new Vector(0, 0);
                this._DragVelocity = new Vector(0, 0);
                this._DragAcceleration = new Vector(0, 0);
                this._VelocityAccumulationTolerance = 10; // dragging faster than this builds velocity
                this._DragMinSpeed = 2;
                this._DragMaxSpeed = 30;
                this._DragFriction = 2;
                this.ZoomUpdated = new nullstone.Event();
                this.DefaultStyleKey = this.constructor;
                this._TweenEasing = TWEEN.Easing.Quadratic.InOut;
                this.MouseLeftButtonDown.on(this.Zoomer_MouseLeftButtonDown, this);
                this.MouseLeftButtonUp.on(this.Zoomer_MouseLeftButtonUp, this);
                this.MouseMove.on(this.Zoomer_MouseMove, this);
                this.SizeChanged.on(this.Zoomer_SizeChanged, this);
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
                    return new Size(this.ActualWidth, this.ActualHeight);
                },
                enumerable: true,
                configurable: true
            });
            // handle resizing - also intialise viewport size
            Zoomer.prototype.Zoomer_SizeChanged = function (sender, e) {
                this._ZoomTo(this.ZoomLevel, true);
            };
            Zoomer.prototype.OnTicked = function (lastTime, nowTime) {
                var now = new Date().getTime();
                if (now - this._LastVisualTick < MAX_MSPF)
                    return;
                this._LastVisualTick = now;
                TWEEN.update(nowTime);
                this._AddVelocity();
            };
            Zoomer.prototype._ZoomTo = function (level, instantly) {
                var _this = this;
                this._OnZoomUpdated();
                var newSize = this._GetZoomTargetSize(level);
                var newScroll = this._GetZoomTargetScroll(newSize);
                if (instantly) {
                    this.ZoomContentSize.Width = newSize.Width;
                    this.ZoomContentSize.Height = newSize.Height;
                    this._ScrollTo(newScroll, true);
                }
                else {
                    var zoomTween = new TWEEN.Tween(this.ZoomContentSize).to(newSize, this.AnimationSpeed).delay(0).easing(this._TweenEasing).onUpdate(function () {
                        _this._OnZoomUpdated();
                    }).onComplete(function () {
                        console.log("zoomLevel: " + _this.ZoomLevel);
                        console.log("width: " + _this.ZoomContentSize.Width);
                    });
                    zoomTween.start(this._LastVisualTick);
                    this._ScrollTo(newScroll);
                }
            };
            // todo: http://www.codeproject.com/Articles/535735/Implementing-a-Generic-Object-Pool-in-NET ?
            Zoomer.prototype._OnZoomUpdated = function () {
                this.ZoomUpdated.raise(this, new _Zoomer.ZoomerEventArgs(this.ZoomContentSize, this.ZoomContentOffset));
            };
            Zoomer.prototype._GetZoomTargetSize = function (level) {
                var newWidth = Math.pow(this.ZoomFactor, level) * this.ActualWidth;
                var newHeight = Math.pow(this.ZoomFactor, level) * this.ActualHeight;
                return new Size(newWidth, newHeight);
            };
            Zoomer.prototype._ScrollTo = function (newOffset, instantly) {
                var _this = this;
                if (instantly) {
                    this.ZoomContentOffset.X = newOffset.X;
                    this.ZoomContentOffset.Y = newOffset.Y;
                }
                else {
                    var scrollTween = new TWEEN.Tween(this.ZoomContentOffset).to(newOffset, this.AnimationSpeed).delay(0).easing(this._TweenEasing).onUpdate(function () {
                        _this._Constrain();
                    });
                    scrollTween.start(this._LastVisualTick);
                }
            };
            Zoomer.prototype._Constrain = function () {
                if (this.ConstrainToViewport) {
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
                        // mouse isn't moving. remove velocity
                        this._RemoveVelocity();
                    }
                    else {
                        // only add to velocity if dragging fast enough
                        if (this._MouseDelta.Mag() > this._VelocityAccumulationTolerance) {
                            // calculate acceleration
                            this._DragAcceleration.Add(this._MouseDelta);
                            // integrate acceleration
                            this._DragVelocity.Add(this._DragAcceleration);
                            this._DragVelocity.Limit(this._DragMaxSpeed);
                        }
                    }
                }
                else {
                    // decelerate if _DragVelocity is above minimum speed
                    if (this._DragVelocity.Mag() > this._DragMinSpeed) {
                        // calculate deceleration
                        var friction = this._DragVelocity.Get();
                        friction.Mult(-1);
                        friction.Normalise();
                        friction.Mult(this._DragFriction);
                        this._DragAcceleration.Add(friction);
                        // integrate deceleration
                        this._DragVelocity.Add(this._DragAcceleration);
                        this.ZoomContentOffset.Add(this._DragVelocity);
                    }
                }
                // reset acceleration
                this._DragAcceleration.Mult(0);
                this._Constrain();
            };
            Zoomer.prototype._RemoveVelocity = function () {
                this._DragVelocity.Mult(0);
            };
            Zoomer.prototype.Zoomer_MouseLeftButtonDown = function (sender, e) {
                if (e.Handled)
                    return;
                this._IsMouseDown = true;
                this._RemoveVelocity();
            };
            Zoomer.prototype.Zoomer_MouseLeftButtonUp = function (sender, e) {
                if (e.Handled)
                    return;
                this._IsMouseDown = false;
                this._IsDragging = false;
            };
            Zoomer.prototype.Zoomer_MouseMove = function (sender, e) {
                if (e.Handled)
                    return;
                if (this._IsMouseDown) {
                    this._IsDragging = true;
                }
                this._LastMousePosition = this._MousePosition || new Vector(0, 0);
                this._MousePosition = new Vector(e.AbsolutePos.x, e.AbsolutePos.y);
                this._MouseDelta = this._MousePosition.Get();
                this._MouseDelta.Sub(this._LastMousePosition);
                if (this._IsDragging) {
                    this.ZoomContentOffset.Add(this._MouseDelta);
                }
            };
            Zoomer.ZoomLevelProperty = DependencyProperty.RegisterFull("ZoomLevel", function () { return Number; }, Zoomer, 0, function (d, args) { return d.OnZoomLevelChanged(args); });
            Zoomer.ConstrainToViewportProperty = DependencyProperty.RegisterFull("ConstrainToViewport", function () { return Boolean; }, Zoomer, true);
            return Zoomer;
        })(Fayde.Controls.ContentControl);
        _Zoomer.Zoomer = Zoomer;
    })(Zoomer = Fayde.Zoomer || (Fayde.Zoomer = {}));
})(Fayde || (Fayde = {}));
var Fayde;
(function (Fayde) {
    var Zoomer;
    (function (Zoomer) {
        var ZoomerEventArgs = (function () {
            function ZoomerEventArgs(size, offset) {
                Object.defineProperty(this, 'Size', { value: size, writable: false });
                Object.defineProperty(this, 'Offset', { value: offset, writable: false });
            }
            return ZoomerEventArgs;
        })();
        Zoomer.ZoomerEventArgs = ZoomerEventArgs;
    })(Zoomer = Fayde.Zoomer || (Fayde.Zoomer = {}));
})(Fayde || (Fayde = {}));
//# sourceMappingURL=Fayde.Zoomer.js.map