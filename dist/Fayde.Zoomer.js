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
                this._ZoomContentOffset = new Point(0, 0);
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
                this.RenderTransformOrigin = new Point(0.5, 0.5);
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
                        //this._ZoomContentSize = this.ViewportSize;
                        return new Size(1, 1);
                    }
                    return this._ZoomContentSize;
                },
                set: function (value) {
                    this._ZoomContentSize = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Zoomer.prototype, "ZoomContentOffset", {
                get: function () {
                    return this._ZoomContentOffset;
                },
                set: function (value) {
                    this._ZoomContentOffset = value;
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
            Zoomer.prototype._UpdateTransform = function () {
                var transformGroup = new Fayde.Media.TransformGroup();
                // update translate transform.
                var translateTransform = new Fayde.Media.TranslateTransform();
                translateTransform.X = this.ZoomContentOffset.x;
                translateTransform.Y = this.ZoomContentOffset.y;
                transformGroup.Children.Add(translateTransform);
                // update scale transform.
                var transformGroup = new Fayde.Media.TransformGroup();
                var scaleTransform = new Fayde.Media.ScaleTransform();
                scaleTransform.ScaleX = this.ZoomContentSize.Width;
                scaleTransform.ScaleY = this.ZoomContentSize.Height;
                transformGroup.Children.Add(scaleTransform);
                this.RenderTransform = transformGroup;
            };
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
                this._OnZoomUpdated();
                var newSize = this._GetZoomTargetSize(level);
                var newScroll = this._GetZoomTargetOffset(newSize);
                if (instantly) {
                    //this.ZoomContentSize.Width = newSize.Width;
                    //this.ZoomContentSize.Height = newSize.Height;
                    this.ZoomContentSize = newSize;
                    this._ScrollTo(newScroll, true);
                }
                else {
                    this.ZoomContentSize = newSize;
                    //var zoomTween = new TWEEN.Tween(this.ZoomContentSize)
                    //    .to(newSize, this.AnimationSpeed)
                    //    .delay(0)
                    //    .easing(this._TweenEasing)
                    //    .onUpdate(() => {
                    //        this._OnZoomUpdated();
                    //    })
                    //    .onComplete(() => {
                    //        console.log("zoomLevel: " + this.ZoomLevel);
                    //        console.log("width: " + this.ZoomContentSize.Width);
                    //    });
                    //
                    //zoomTween.start(this._LastVisualTick);
                    this._ScrollTo(newScroll);
                    this._UpdateTransform();
                }
            };
            Zoomer.prototype._OnZoomUpdated = function () {
                this.ZoomUpdated.raise(this, new _Zoomer.ZoomerEventArgs(this.ZoomContentSize, this.ZoomContentOffset));
            };
            Zoomer.prototype._GetZoomTargetSize = function (level) {
                //var newWidth = Math.pow(this.ZoomFactor, level) * this.ActualWidth;
                //var newHeight = Math.pow(this.ZoomFactor, level) * this.ActualHeight;
                var newWidth = 1 * Math.pow(this.ZoomFactor, level);
                var newHeight = 1 * Math.pow(this.ZoomFactor, level);
                return new Size(newWidth, newHeight);
            };
            Zoomer.prototype._ScrollTo = function (newOffset, instantly) {
                if (instantly) {
                    this.ZoomContentOffset = newOffset;
                }
                else {
                    this.ZoomContentOffset = newOffset;
                }
            };
            Zoomer.prototype._GetZoomTargetOffset = function (targetSize) {
                var currentOrigin = this._GetZoomContentOrigin(this.ZoomContentSize);
                var nextOrigin = this._GetZoomContentOrigin(targetSize);
                var diff = new Point(nextOrigin.x - currentOrigin.x, nextOrigin.y - currentOrigin.y); //Vector.Sub(nextOrigin, currentOrigin);
                var targetScroll = new Point(this.ZoomContentOffset.x - diff.x, this.ZoomContentOffset.y - diff.y); // Vector.Sub(this.ZoomContentOffset., diff);
                return new Point(targetScroll.x, targetScroll.y);
            };
            Zoomer.prototype._Constrain = function () {
                if (this.ConstrainToViewport) {
                    if (this.ZoomContentOffset.x > 0) {
                        this.ZoomContentOffset.x = 0;
                    }
                    if (this.ZoomContentOffset.x < (this.ZoomContentSize.Width - this.ViewportSize.Width) * -1) {
                        this.ZoomContentOffset.x = (this.ZoomContentSize.Width - this.ViewportSize.Width) * -1;
                    }
                    if (this.ZoomContentOffset.y > 0) {
                        this.ZoomContentOffset.y = 0;
                    }
                    if (this.ZoomContentOffset.y < (this.ZoomContentSize.Height - this.ViewportSize.Height) * -1) {
                        this.ZoomContentOffset.y = (this.ZoomContentSize.Height - this.ViewportSize.Height) * -1;
                    }
                }
            };
            Zoomer.prototype._GetZoomContentOrigin = function (size) {
                return new Point(-0.5, -0.5);
                switch (this._Origin) {
                    case 0 /* Center */:
                        //return new Point(size.Width / 2, size.Height / 2);
                        return new Point(0.5, 0.5);
                        break;
                    case 1 /* TopLeft */:
                        return new Point(0, 0);
                        break;
                    case 2 /* BottomLeft */:
                        //return new Point(0, size.Height);
                        return new Point(0, 1);
                        break;
                    case 3 /* TopRight */:
                        //return new Point(size.Width, 0);
                        return new Point(1, 0);
                        break;
                    case 4 /* BottomRight */:
                        //return new Point(size.Width, size.Height);
                        return new Point(1, 1);
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
                        this.ZoomContentOffset = new Point(this.ZoomContentOffset.x + this._DragVelocity.X, this.ZoomContentOffset.y + this._DragVelocity.Y); //.Add(this._DragVelocity);
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
                //console.log("mouse down");
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
                //this._MousePosition = new Vector(e.AbsolutePos.x, e.AbsolutePos.y);
                this._MousePosition = new Vector(e.AbsolutePos.x, e.AbsolutePos.y);
                this._MouseDelta = this._MousePosition.Get();
                this._MouseDelta.Sub(this._LastMousePosition);
                if (this._IsDragging) {
                    //this.ZoomContentOffset.Add(this._MouseDelta);
                    this.ZoomContentOffset = new Point(this.ZoomContentOffset.x + this._MouseDelta.X, this.ZoomContentOffset.y + this._MouseDelta.Y);
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