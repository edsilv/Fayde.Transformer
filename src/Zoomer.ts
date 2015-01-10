import ScaleTransform = Fayde.Media.ScaleTransform;
import TranslateTransform = Fayde.Media.TranslateTransform;
import TransformGroup = Fayde.Media.TransformGroup;
import Vector = Fayde.Utils.Vector;

module Fayde.Transformer {

    var MAX_FPS: number = 100;
    var MAX_MSPF: number = 1000 / MAX_FPS;

    //enum Origin {
    //    Center = 0,
    //    TopLeft = 1,
    //    BottomLeft = 2,
    //    TopRight = 3,
    //    BottomRight = 4,
    //    Arbitrary = 5
    //}

    // todo: use minerva vector struct
    export class Zoomer extends Fayde.Controls.ContentControl {

        static ZoomFactorProperty = DependencyProperty.RegisterFull("ZoomFactor", () => Number, Zoomer, 2, (d, args) => (<Zoomer>d).OnZoomFactorChanged(args));
        static ZoomLevelsProperty = DependencyProperty.RegisterFull("ZoomLevels", () => Number, Zoomer, 0, (d, args) => (<Zoomer>d).OnZoomLevelsChanged(args));
        static ZoomLevelProperty = DependencyProperty.RegisterFull("ZoomLevel", () => Number, Zoomer, 0, (d, args) => (<Zoomer>d).OnZoomLevelChanged(args));
        static ConstrainToViewportProperty = DependencyProperty.RegisterFull("ConstrainToViewport", () => Boolean, Zoomer, true);
        static AnimationSpeedProperty = DependencyProperty.RegisterFull("AnimationSpeed", () => Number, Zoomer, 250);

        private OnZoomFactorChanged (args: IDependencyPropertyChangedEventArgs) {
            this._ZoomTo(this.ZoomLevel);
        }

        private OnZoomLevelsChanged (args: IDependencyPropertyChangedEventArgs) {
            this._ZoomTo(this.ZoomLevel);
        }

        private OnZoomLevelChanged (args: IDependencyPropertyChangedEventArgs) {
            this._ZoomTo(this.ZoomLevel);
        }

        AnimationSpeed: number;
        ZoomFactor: number;
        ZoomLevels: number;
        ZoomLevel: number;
        ConstrainToViewport: boolean;

        private _TranslateTransform: TranslateTransform;
        private _ScaleTransform: ScaleTransform;
        private _TweenEasing: any;
        private _LastVisualTick: number = new Date(0).getTime();
        private _Timer: Fayde.ClockTimer;
        private _IsMouseDown: boolean = false;
        private _IsDragging: boolean = false;
        private _LastMousePosition: Vector;
        private _LastDragAccelerationMousePosition: Vector;
        private _MousePosition: Vector;
        private _MouseDelta: Vector = new Vector(0, 0);
        private _DragVelocity: Vector = new Vector(0, 0);
        private _DragAcceleration: Vector = new Vector(0, 0);
        private _VelocityAccumulationTolerance: number = 10; // dragging faster than this builds velocity
        private _DragMinSpeed: number = 2;
        private _DragMaxSpeed: number = 30;
        private _DragFriction: number = 2;

        TransformUpdated = new nullstone.Event<ZoomerEventArgs>();

        get ScaleTransform(): ScaleTransform {
            if (!this._ScaleTransform){
                var scaleTransform = new ScaleTransform();
                scaleTransform.ScaleX = 1;
                scaleTransform.ScaleY = 1;
                return scaleTransform;
            }
            return this._ScaleTransform;
        }

        set ScaleTransform(value: ScaleTransform) {
            this._ScaleTransform = value;
        }

        get TranslateTransform(): TranslateTransform {
            if (!this._TranslateTransform){
                var translateTransform = new TranslateTransform();
                translateTransform.X = 0;
                translateTransform.Y = 0;
                return translateTransform;
            }

            return this._TranslateTransform;
        }

        set TranslateTransform(value: TranslateTransform){
            this._TranslateTransform = value;
        }

        get ViewportSize(): Size {
            return new Size(this.ActualWidth, this.ActualHeight);
        }

        constructor() {
            super();
            this.DefaultStyleKey = Zoomer;

            this._TweenEasing = TWEEN.Easing.Quadratic.InOut;

            this.MouseLeftButtonDown.on(this.Zoomer_MouseLeftButtonDown, this);
            this.MouseLeftButtonUp.on(this.Zoomer_MouseLeftButtonUp, this);
            this.MouseMove.on(this.Zoomer_MouseMove, this);
            this.SizeChanged.on(this.Zoomer_SizeChanged, this);

            this._Timer = new Fayde.ClockTimer();
            this._Timer.RegisterTimer(this);
        }

        private _UpdateTransform() : void {

            var transformGroup = new TransformGroup();

            transformGroup.Children.Add(this.ScaleTransform);
            transformGroup.Children.Add(this.TranslateTransform);

            this.RenderTransform = transformGroup;

            this.TransformUpdated.raise(this, new ZoomerEventArgs(this.ScaleTransform, this.TranslateTransform));
        }

        // intialise viewport size and handle resizing
        private Zoomer_SizeChanged (sender: any, e: Fayde.SizeChangedEventArgs) {
            var scale = this._GetTargetScaleTransform(this.ZoomLevel);
            var translate = this._GetTargetTranslateTransform(scale);
            this.ScaleTransform = scale;
            this.TranslateTransform = translate;
            this._UpdateTransform();
        }

        OnTicked (lastTime: number, nowTime: number) {
            var now = new Date().getTime();
            if (now - this._LastVisualTick < MAX_MSPF) return;
            this._LastVisualTick = now;

            TWEEN.update(nowTime);
            this._AddVelocity();
        }

        private _ZoomTo(level: number): void {

            if (!(level >= 0) || !(level <= this.ZoomLevels)) return;

            var scale = this._GetTargetScaleTransform(level);
            var translate = this._GetTargetTranslateTransform(scale);

            var currentSize: Size = new Size(this.ScaleTransform.ScaleX, this.ScaleTransform.ScaleY);
            var newSize: Size = new Size(scale.ScaleX, scale.ScaleY);

            var zoomTween = new TWEEN.Tween(currentSize)
                .to(newSize, this.AnimationSpeed)
                .delay(0)
                .easing(this._TweenEasing)
                .onUpdate(() => {
                    this.ScaleTransform.ScaleX = currentSize.width;
                    this.ScaleTransform.ScaleY = currentSize.height;
                    this._UpdateTransform();
                })
                .onComplete(() => {
                    //console.log("zoomLevel: " + this.ZoomLevel);
                });

            zoomTween.start(this._LastVisualTick);

            this._ScrollTo(translate);
        }

        private _GetTargetScaleTransform(level: number): ScaleTransform {
            var transform = new ScaleTransform();

            transform.ScaleX = Math.pow(this.ZoomFactor, level);
            transform.ScaleY = Math.pow(this.ZoomFactor, level);

            return transform;
        }

        private _ScrollTo(newTransform: TranslateTransform) {

            var currentOffset: Size = new Size(this.TranslateTransform.X, this.TranslateTransform.Y);
            var newOffset: Size = new Size(newTransform.X, newTransform.Y);

            var scrollTween = new TWEEN.Tween(currentOffset)
                .to(newOffset, this.AnimationSpeed)
                .delay(0)
                .easing(this._TweenEasing)
                .onUpdate(() => {
                    this.TranslateTransform.X = currentOffset.width;
                    this.TranslateTransform.Y = currentOffset.height;
                    this._Constrain();
                    this._UpdateTransform();
                });

            scrollTween.start(this._LastVisualTick);
        }

        private _GetTargetTranslateTransform(targetScaleTransform: ScaleTransform): TranslateTransform {

            var currentCenter = this._GetZoomOrigin(this.ScaleTransform);
            var targetCenter = this._GetZoomOrigin(targetScaleTransform);
            var diff: Point = new Point(targetCenter.x - currentCenter.x, targetCenter.y - currentCenter.y);

            var translateTransform = new TranslateTransform();
            translateTransform.X = this.TranslateTransform.X - diff.x;
            translateTransform.Y = this.TranslateTransform.Y - diff.y;

            return translateTransform;
        }

        private _GetZoomOrigin(scaleTransform: ScaleTransform) {
            // todo: use this.RenderTransformOrigin instead of halving width

            var width = scaleTransform.ScaleX * this.ViewportSize.width;
            var height = scaleTransform.ScaleY * this.ViewportSize.height;

            return new Point(width * 0.5, height * 0.5);
        }

        private _Constrain(){

            if (this.ConstrainToViewport){

                if (this.TranslateTransform.X > 0){
                    this.TranslateTransform.X = 0;
                }

                if (this.TranslateTransform.X < ((this.ScaleTransform.ScaleX * this.ViewportSize.width) - this.ViewportSize.width) * -1){
                    this.TranslateTransform.X = ((this.ScaleTransform.ScaleX * this.ViewportSize.width) - this.ViewportSize.width) * -1;
                }

                if (this.TranslateTransform.Y > 0){
                    this.TranslateTransform.Y = 0;
                }

                if (this.TranslateTransform.Y < ((this.ScaleTransform.ScaleY * this.ViewportSize.height) - this.ViewportSize.height) * -1){
                    this.TranslateTransform.Y = ((this.ScaleTransform.ScaleY * this.ViewportSize.height) - this.ViewportSize.height) * -1;
                }
            }
        }

        private _AddVelocity(){

            var mouseStopped = false;

            if (this._LastDragAccelerationMousePosition && this._LastDragAccelerationMousePosition.Equals(this._MousePosition)){
                mouseStopped = true;
            }

            this._LastDragAccelerationMousePosition = this._MousePosition;

            if (this._IsDragging) {
                if (mouseStopped){
                    // mouse isn't moving. remove velocity
                    this._RemoveVelocity();
                } else {
                    // only add to velocity if dragging fast enough
                    if (this._MouseDelta.Mag() > this._VelocityAccumulationTolerance) {
                        // calculate acceleration
                        this._DragAcceleration.Add(this._MouseDelta);

                        // integrate acceleration
                        this._DragVelocity.Add(this._DragAcceleration);
                        this._DragVelocity.Limit(this._DragMaxSpeed);
                    }
                }
            } else {
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

            this._Constrain();
        }

        private _RemoveVelocity(){
            this._DragVelocity.Mult(0);
        }

        private Zoomer_MouseLeftButtonDown (sender: any, e: Fayde.Input.MouseButtonEventArgs) {
            if (e.Handled)
                return;

            this._IsMouseDown = true;
            this._RemoveVelocity();
        }

        private Zoomer_MouseLeftButtonUp(sender: any, e: Fayde.Input.MouseButtonEventArgs) {
            if (e.Handled)
                return;

            this._IsMouseDown = false;
            this._IsDragging = false;
        }

        private Zoomer_MouseMove(sender: any, e: Fayde.Input.MouseEventArgs) {
            if (e.Handled)
                return;

            if (this._IsMouseDown){
                this._IsDragging = true;
            }

            this._LastMousePosition = this._MousePosition || new Vector(0, 0);
            this._MousePosition = new Vector(e.AbsolutePos.x, e.AbsolutePos.y);

            this._MouseDelta = this._MousePosition.Get();
            this._MouseDelta.Sub(this._LastMousePosition);

            if (this._IsDragging){
                this.TranslateTransform.X += this._MouseDelta.X;
                this.TranslateTransform.Y += this._MouseDelta.Y;

                this._UpdateTransform();
            }
        }
    }

}