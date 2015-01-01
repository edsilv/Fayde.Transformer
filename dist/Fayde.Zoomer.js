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
var ScaleTransform = Fayde.Media.ScaleTransform;
var TranslateTransform = Fayde.Media.TranslateTransform;
var TransformGroup = Fayde.Media.TransformGroup;
var Vector = Fayde.Utils.Vector;
var Fayde;
(function (Fayde) {
    var Zoomer;
    (function (_Zoomer) {
        var MAX_FPS = 100;
        var MAX_MSPF = 1000 / MAX_FPS;
        //enum Origin {
        //    Center = 0,
        //    TopLeft = 1,
        //    BottomLeft = 2,
        //    TopRight = 3,
        //    BottomRight = 4,
        //    Arbitrary = 5
        //}
        // todo: use minerva vector struct
        var Zoomer = (function (_super) {
            __extends(Zoomer, _super);
            function Zoomer() {
                _super.call(this);
                this._LastVisualTick = new Date(0).getTime();
                this._IsMouseDown = false;
                this._IsDragging = false;
                this._MouseDelta = new Vector(0, 0);
                this._DragVelocity = new Vector(0, 0);
                this._DragAcceleration = new Vector(0, 0);
                this._VelocityAccumulationTolerance = 10; // dragging faster than this builds velocity
                this._DragMinSpeed = 2;
                this._DragMaxSpeed = 30;
                this._DragFriction = 2;
                this.TransformUpdated = new nullstone.Event();
                this.DefaultStyleKey = Zoomer;
                this._TweenEasing = TWEEN.Easing.Quadratic.InOut;
                this.MouseLeftButtonDown.on(this.Zoomer_MouseLeftButtonDown, this);
                this.MouseLeftButtonUp.on(this.Zoomer_MouseLeftButtonUp, this);
                this.MouseMove.on(this.Zoomer_MouseMove, this);
                this.TouchDown.on(this.Zoomer_TouchDown, this);
                this.TouchUp.on(this.Zoomer_TouchUp, this);
                this.TouchMove.on(this.Zoomer_TouchMove, this);
                this.SizeChanged.on(this.Zoomer_SizeChanged, this);
                this._Timer = new Fayde.ClockTimer();
                this._Timer.RegisterTimer(this);
            }
            Zoomer.prototype.OnZoomFactorChanged = function (args) {
                this._ZoomTo(this.ZoomLevel);
            };
            Zoomer.prototype.OnZoomLevelsChanged = function (args) {
                this._ZoomTo(this.ZoomLevel);
            };
            Zoomer.prototype.OnZoomLevelChanged = function (args) {
                this._ZoomTo(this.ZoomLevel);
            };
            Object.defineProperty(Zoomer.prototype, "ScaleTransform", {
                get: function () {
                    if (!this._ScaleTransform) {
                        var scaleTransform = new ScaleTransform();
                        scaleTransform.ScaleX = 1;
                        scaleTransform.ScaleY = 1;
                        return scaleTransform;
                    }
                    return this._ScaleTransform;
                },
                set: function (value) {
                    this._ScaleTransform = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Zoomer.prototype, "TranslateTransform", {
                get: function () {
                    if (!this._TranslateTransform) {
                        var translateTransform = new TranslateTransform();
                        translateTransform.X = 0;
                        translateTransform.Y = 0;
                        return translateTransform;
                    }
                    return this._TranslateTransform;
                },
                set: function (value) {
                    this._TranslateTransform = value;
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
            Zoomer.prototype.OnTicked = function (lastTime, nowTime) {
                var now = new Date().getTime();
                if (now - this._LastVisualTick < MAX_MSPF)
                    return;
                this._LastVisualTick = now;
                TWEEN.update(nowTime);
                if (this.DragAccelerationEnabled) {
                    this._AddVelocity();
                }
                if (this.ConstrainToViewport) {
                    this._Constrain();
                }
                this._UpdateTransform();
            };
            Zoomer.prototype._UpdateTransform = function () {
                var transformGroup = new TransformGroup();
                transformGroup.Children.Add(this.ScaleTransform);
                transformGroup.Children.Add(this.TranslateTransform);
                this.RenderTransform = transformGroup;
                this.TransformUpdated.raise(this, new _Zoomer.ZoomerEventArgs(this.ScaleTransform, this.TranslateTransform));
            };
            // intialise viewport size and handle resizing
            Zoomer.prototype.Zoomer_SizeChanged = function (sender, e) {
                this.ScaleTransform = this._GetTargetScaleTransform(this.ZoomLevel);
                this.TranslateTransform = this._GetTargetTranslateTransform(this.ScaleTransform);
            };
            Zoomer.prototype._ZoomTo = function (level) {
                var _this = this;
                if (!(level >= 0) || !(level <= this.ZoomLevels))
                    return;
                var scale = this._GetTargetScaleTransform(level);
                var translate = this._GetTargetTranslateTransform(scale);
                var currentSize = new Size(this.ScaleTransform.ScaleX, this.ScaleTransform.ScaleY);
                var newSize = new Size(scale.ScaleX, scale.ScaleY);
                var zoomTween = new TWEEN.Tween(currentSize).to(newSize, this.AnimationSpeed).delay(0).easing(this._TweenEasing).onUpdate(function () {
                    _this.ScaleTransform.ScaleX = currentSize.width;
                    _this.ScaleTransform.ScaleY = currentSize.height;
                }).onComplete(function () {
                    //console.log("zoomLevel: " + this.ZoomLevel);
                });
                zoomTween.start(this._LastVisualTick);
                this._ScrollTo(translate);
            };
            Zoomer.prototype._GetTargetScaleTransform = function (level) {
                var transform = new ScaleTransform();
                transform.ScaleX = Math.pow(this.ZoomFactor, level);
                transform.ScaleY = Math.pow(this.ZoomFactor, level);
                return transform;
            };
            Zoomer.prototype._ScrollTo = function (newTransform) {
                var _this = this;
                var currentOffset = new Size(this.TranslateTransform.X, this.TranslateTransform.Y);
                var newOffset = new Size(newTransform.X, newTransform.Y);
                var scrollTween = new TWEEN.Tween(currentOffset).to(newOffset, this.AnimationSpeed).delay(0).easing(this._TweenEasing).onUpdate(function () {
                    _this.TranslateTransform.X = currentOffset.width;
                    _this.TranslateTransform.Y = currentOffset.height;
                });
                scrollTween.start(this._LastVisualTick);
            };
            Zoomer.prototype._GetTargetTranslateTransform = function (targetScaleTransform) {
                var currentCenter = this._GetZoomOrigin(this.ScaleTransform);
                var targetCenter = this._GetZoomOrigin(targetScaleTransform);
                var diff = new Point(targetCenter.x - currentCenter.x, targetCenter.y - currentCenter.y);
                var translateTransform = new TranslateTransform();
                translateTransform.X = this.TranslateTransform.X - diff.x;
                translateTransform.Y = this.TranslateTransform.Y - diff.y;
                return translateTransform;
            };
            Zoomer.prototype._GetZoomOrigin = function (scaleTransform) {
                // todo: use this.RenderTransformOrigin instead of halving width
                var width = scaleTransform.ScaleX * this.ViewportSize.width;
                var height = scaleTransform.ScaleY * this.ViewportSize.height;
                return new Point(width * 0.5, height * 0.5);
            };
            Zoomer.prototype._Constrain = function () {
                if (this.TranslateTransform.X > 0) {
                    this.TranslateTransform.X = 0;
                }
                var width = this.ScaleTransform.ScaleX * this.ViewportSize.width;
                if (this.TranslateTransform.X < (width - this.ViewportSize.width) * -1) {
                    this.TranslateTransform.X = (width - this.ViewportSize.width) * -1;
                }
                if (this.TranslateTransform.Y > 0) {
                    this.TranslateTransform.Y = 0;
                }
                var height = this.ScaleTransform.ScaleY * this.ViewportSize.height;
                if (this.TranslateTransform.Y < (height - this.ViewportSize.height) * -1) {
                    this.TranslateTransform.Y = (height - this.ViewportSize.height) * -1;
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
                        this.TranslateTransform.X += this._DragVelocity.X;
                        this.TranslateTransform.Y += this._DragVelocity.Y;
                        this._UpdateTransform();
                    }
                }
                // reset acceleration
                this._DragAcceleration.Mult(0);
            };
            Zoomer.prototype._RemoveVelocity = function () {
                this._DragVelocity.Mult(0);
            };
            Zoomer.prototype.Zoomer_MouseLeftButtonDown = function (sender, e) {
                if (e.Handled)
                    return;
                this.CaptureMouse();
                this._IsMouseDown = true;
                this._RemoveVelocity();
            };
            Zoomer.prototype.Zoomer_MouseLeftButtonUp = function (sender, e) {
                if (e.Handled)
                    return;
                this.ReleaseMouseCapture();
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
                    this.TranslateTransform.X += this._MouseDelta.X;
                    this.TranslateTransform.Y += this._MouseDelta.Y;
                    this._UpdateTransform();
                }
            };
            Zoomer.prototype.Zoomer_TouchDown = function (sender, e) {
                if (e.Handled)
                    return;
                this.CaptureMouse();
                this._IsMouseDown = true;
                var pos = e.GetTouchPoint(null);
                this._LastMousePosition = this._MousePosition || new Vector(0, 0);
                this._MousePosition = new Vector(pos.Position.x, pos.Position.y);
                this._RemoveVelocity();
            };
            Zoomer.prototype.Zoomer_TouchUp = function (sender, e) {
                if (e.Handled)
                    return;
                this.ReleaseMouseCapture();
                this._IsMouseDown = false;
                this._IsDragging = false;
            };
            Zoomer.prototype.Zoomer_TouchMove = function (sender, e) {
                if (e.Handled)
                    return;
                if (this._IsMouseDown) {
                    this._IsDragging = true;
                }
                var pos = e.GetTouchPoint(null);
                this._LastMousePosition = this._MousePosition || new Vector(0, 0);
                this._MousePosition = new Vector(pos.Position.x, pos.Position.y);
                this._MouseDelta = this._MousePosition.Get();
                this._MouseDelta.Sub(this._LastMousePosition);
                if (this._IsDragging) {
                    this.TranslateTransform.X += this._MouseDelta.X;
                    this.TranslateTransform.Y += this._MouseDelta.Y;
                    this._UpdateTransform();
                }
            };
            Zoomer.ZoomFactorProperty = DependencyProperty.RegisterFull("ZoomFactor", function () { return Number; }, Zoomer, 2, function (d, args) { return d.OnZoomFactorChanged(args); });
            Zoomer.ZoomLevelsProperty = DependencyProperty.RegisterFull("ZoomLevels", function () { return Number; }, Zoomer, 0, function (d, args) { return d.OnZoomLevelsChanged(args); });
            Zoomer.ZoomLevelProperty = DependencyProperty.RegisterFull("ZoomLevel", function () { return Number; }, Zoomer, 0, function (d, args) { return d.OnZoomLevelChanged(args); });
            Zoomer.ConstrainToViewportProperty = DependencyProperty.RegisterFull("ConstrainToViewport", function () { return Boolean; }, Zoomer, true);
            Zoomer.AnimationSpeedProperty = DependencyProperty.RegisterFull("AnimationSpeed", function () { return Number; }, Zoomer, 250);
            Zoomer.DragAccelerationEnabledProperty = DependencyProperty.RegisterFull("DragAccelerationEnabled", function () { return Boolean; }, Zoomer, true);
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
            function ZoomerEventArgs(scale, translate) {
                Object.defineProperty(this, 'Scale', { value: scale, writable: false });
                Object.defineProperty(this, 'Translate', { value: translate, writable: false });
            }
            return ZoomerEventArgs;
        })();
        Zoomer.ZoomerEventArgs = ZoomerEventArgs;
    })(Zoomer = Fayde.Zoomer || (Fayde.Zoomer = {}));
})(Fayde || (Fayde = {}));
//# sourceMappingURL=Fayde.Zoomer.js.map