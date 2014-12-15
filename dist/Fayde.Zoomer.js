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
var Size = minerva.Size;
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
                this.ZoomUpdated = new nullstone.Event();
                this.DefaultStyleKey = this.constructor;
                this._TweenEasing = TWEEN.Easing.Quadratic.InOut;
                // todo: remove?
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
            Object.defineProperty(Zoomer.prototype, "ScaleTransform", {
                get: function () {
                    //if(!this._ScaleTransform){
                    //    return new ScaleTransform(1, 1);
                    //}
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
                    return new minerva.Size(this.ActualWidth, this.ActualHeight);
                },
                enumerable: true,
                configurable: true
            });
            Zoomer.prototype._UpdateTransform = function () {
                var transformGroup = new TransformGroup();
                // update translate transform.
                //var translateTransform = new TranslateTransform();
                //translateTransform.X = this.TranslateTransform.x;
                //translateTransform.Y = this.TranslateTransform.y;
                transformGroup.Children.Add(this.TranslateTransform);
                // update scale transform.
                //var transformGroup = new Fayde.Media.TransformGroup();
                //var scaleTransform = new ScaleTransform();
                //scaleTransform.ScaleX = this.ScaleTransform.Width;
                //scaleTransform.ScaleY = this.ScaleTransform.Height;
                transformGroup.Children.Add(this.ScaleTransform);
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
                var scale = this._GetTargetScaleTransform(level);
                var translate = this._GetTargetTranslateTransform(scale);
                if (instantly) {
                    //this.ZoomContentSize.Width = newSize.Width;
                    //this.ZoomContentSize.Height = newSize.Height;
                    this.ScaleTransform = scale;
                    this._ScrollTo(translate, true);
                }
                else {
                    this.ScaleTransform = scale;
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
                    this._ScrollTo(translate);
                    this._UpdateTransform();
                }
            };
            Zoomer.prototype._OnZoomUpdated = function () {
                this.ZoomUpdated.raise(this, new _Zoomer.ZoomerEventArgs(this.ViewportSize, this.TranslateTransform));
            };
            Zoomer.prototype._GetTargetScaleTransform = function (level) {
                //var newWidth = Math.pow(this.ZoomFactor, level) * this.ActualWidth;
                //var newHeight = Math.pow(this.ZoomFactor, level) * this.ActualHeight;
                var transform = new ScaleTransform();
                transform.ScaleX = Math.pow(this.ZoomFactor, level);
                transform.ScaleY = Math.pow(this.ZoomFactor, level);
                return transform;
            };
            Zoomer.prototype._ScrollTo = function (newOffset, instantly) {
                if (instantly) {
                    this.TranslateTransform = newOffset;
                }
                else {
                    this.TranslateTransform = newOffset;
                }
            };
            Zoomer.prototype._GetTargetTranslateTransform = function (scaleTransform) {
                // get the current translate
                // get the next translate
                //var currentOrigin: Point = this._GetZoomContentOrigin(this.ScaleTransform);
                //var nextOrigin: Point = this._GetZoomContentOrigin(targetSize);
                //var diff: Point = new Point(nextOrigin.x - currentOrigin.x, nextOrigin.y - currentOrigin.y); //Vector.Sub(nextOrigin, currentOrigin);
                //var targetScroll = new Point(this.TranslateTransform.x - diff.x, this.TranslateTransform.y - diff.y); // Vector.Sub(this.ZoomContentOffset., diff);
                //
                //return new Point(targetScroll.x, targetScroll.y);
                var width = scaleTransform.ScaleX * this.ViewportSize.width;
                var height = scaleTransform.ScaleY * this.ViewportSize.height;
                var targetTranslate = new Point(width * 0.5, height * 0.5);
                var diff = new Point(targetTranslate.x - this.TranslateTransform.X, targetTranslate.y - this.TranslateTransform.Y); //Vector.Sub(nextOrigin, currentOrigin);
                var translateTransform = new TranslateTransform();
                translateTransform.X = this.TranslateTransform.X + diff.x;
                translateTransform.Y = this.TranslateTransform.Y + diff.y;
                return translateTransform;
            };
            Zoomer.prototype._Constrain = function () {
                if (this.ConstrainToViewport) {
                    if (this.TranslateTransform.X > 0) {
                        this.TranslateTransform.X = 0;
                    }
                    if (this.TranslateTransform.X < (this.ScaleTransform.ScaleX - this.ViewportSize.width) * -1) {
                        this.TranslateTransform.X = (this.ScaleTransform.ScaleX - this.ViewportSize.width) * -1;
                    }
                    if (this.TranslateTransform.Y > 0) {
                        this.TranslateTransform.Y = 0;
                    }
                    if (this.TranslateTransform.Y < (this.ScaleTransform.ScaleY - this.ViewportSize.height) * -1) {
                        this.TranslateTransform.Y = (this.ScaleTransform.ScaleY - this.ViewportSize.height) * -1;
                    }
                }
            };
            // takes a normalised size and returns an absolute X and Y
            //private _GetZoomContentOrigin(transform: ScaleTransform): Point {
            //    var width = transform.ScaleX * this.ViewportSize.width;
            //    var height = transform.ScaleY * this.ViewportSize.height;
            //
            //    return new Point(width * 0.5, height * 0.5);
            //}
            //private _GetZoomContentOrigin(size: Size): Point{
            //
            //    return new Point(-0.5, -0.5);
            //
            //    switch(this._Origin){
            //        case Origin.Center:
            //            //return new Point(size.Width / 2, size.Height / 2);
            //            return new Point(0.5, 0.5);
            //            break;
            //        case Origin.TopLeft:
            //            return new Point(0, 0);
            //            break;
            //        case Origin.BottomLeft:
            //            //return new Point(0, size.Height);
            //            return new Point(0, 1);
            //            break;
            //        case Origin.TopRight:
            //            //return new Point(size.Width, 0);
            //            return new Point(1, 0);
            //            break;
            //        case Origin.BottomRight:
            //            //return new Point(size.Width, size.Height);
            //            return new Point(1, 1);
            //            break;
            //    }
            //}
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
                        var translateTransform = new TranslateTransform();
                        translateTransform.X = this.TranslateTransform.X + this._DragVelocity.X;
                        translateTransform.Y = this.TranslateTransform.Y + this._DragVelocity.Y;
                        this.TranslateTransform = translateTransform;
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
                    var translateTransform = new TranslateTransform();
                    translateTransform.X = this._MouseDelta.X;
                    translateTransform.Y = this.TranslateTransform.Y + this._MouseDelta.Y;
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