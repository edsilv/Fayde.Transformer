
module Fayde.Zoomer {

    import Size = Fayde.Utils.Size;
    import Vector = Fayde.Utils.Vector;

    var MAX_FPS: number = 100;
    var MAX_MSPF: number = 1000 / MAX_FPS;

    enum Origin {
        Center = 0,
        TopLeft = 1,
        BottomLeft = 2,
        TopRight = 3,
        BottomRight = 4,
        Arbitrary = 5
    }

    /*
    * Todo
    * You are manually trying to calculate positions and scales on the screen.
    * Instead, you could use RenderTransform and RenderTransformOrigin to intelligently align everything.
    * RenderTransform can be a ScaleTransform, RotateTransform, TranslateTransform, MatrixTransform, or even a TransformGroup (composite).
    * RenderTransformOrigin is a point in a relative coordinate system.
    * Specifying (1,1) will use the bottom right corner of the visual.
     */

    export class Zoomer extends Fayde.Controls.ContentControl {

        static ZoomLevelProperty = DependencyProperty.RegisterFull("ZoomLevel", () => Number, Zoomer, 0, (d, args) => (<Zoomer>d).OnZoomLevelChanged(args));

        private OnZoomLevelChanged (args: IDependencyPropertyChangedEventArgs) {
            this._ZoomTo(this.ZoomLevel);
        }

        AnimationSpeed: number = 250;
        ZoomFactor: number = 2;
        ZoomContentOffset: Vector = new Vector(0, 0);
        ZoomLevel: number;

        private _ZoomContentSize: Size;
        private _TweenEasing: any;
        private _LastVisualTick: number = new Date(0).getTime();
        private _Timer: Fayde.ClockTimer;
        private _ConstrainToViewport: boolean = true;
        private _Origin: Origin = Origin.Center;
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

        ZoomUpdated = new MulticastEvent<ZoomerEventArgs>();

        get ZoomContentSize(): Size {
            if(!this._ZoomContentSize){
                this._ZoomContentSize = this.ViewportSize;
            }
            return this._ZoomContentSize;
        }

        set ZoomContentSize(value: Size) {
            this._ZoomContentSize = value;
        }

        get ViewportSize(): Size {
            return new Size(this.Width, this.Height);
        }

        constructor() {
            super();
            this.DefaultStyleKey = (<any>this).constructor;

            this._TweenEasing = TWEEN.Easing.Quadratic.InOut;

            this.MouseLeftButtonDown.Subscribe(this.Zoomer_MouseLeftButtonDown, this);
            this.MouseLeftButtonUp.Subscribe(this.Zoomer_MouseLeftButtonUp, this);
            this.MouseMove.Subscribe(this.Zoomer_MouseMove, this);

            this._Timer = new Fayde.ClockTimer();
            this._Timer.RegisterTimer(this);
        }

        OnTicked (lastTime: number, nowTime: number) {
            var now = new Date().getTime();
            if (now - this._LastVisualTick < MAX_MSPF)
                return;
            this._LastVisualTick = now;

            TWEEN.update(nowTime);
            this._AddVelocity();
        }

        OnApplyTemplate() {
            super.OnApplyTemplate();

            this._ZoomTo(this.ZoomLevel);
        }

        private _ZoomTo(level: number): void {

            this._OnZoomUpdated();

            var newSize = this._GetZoomTargetSize(level);

            var zoomTween = new TWEEN.Tween(this.ZoomContentSize)
                .to(newSize, this.AnimationSpeed)
                .delay(0)
                .easing(this._TweenEasing)
                .onUpdate(() => {
                    this._OnZoomUpdated();
                })
                .onComplete(() => {
                    console.log("zoomLevel: " + this.ZoomLevel);
                    console.log("width: " + this.ZoomContentSize.Width);
                });

            zoomTween.start(this._LastVisualTick);

            var newScroll = this._GetZoomTargetScroll(newSize);

            this._ScrollTo(newScroll);
        }

        // todo: http://www.codeproject.com/Articles/535735/Implementing-a-Generic-Object-Pool-in-NET ?
        private _OnZoomUpdated() {
            this.ZoomUpdated.Raise(this, new ZoomerEventArgs(this.ZoomContentSize, this.ZoomContentOffset));
        }

        private _GetZoomTargetSize(level: number): Size {

            var newWidth = Math.pow(this.ZoomFactor, level) * this.Width;
            var newHeight = this.ZoomContentSize.AspectRatio * newWidth;

            return new Size(newWidth, newHeight);
        }

        private _ScrollTo(newScroll: Vector) {
            var scrollTween = new TWEEN.Tween(this.ZoomContentOffset)
                .to(newScroll, this.AnimationSpeed)
                .delay(0)
                .easing(this._TweenEasing)
                .onUpdate(() => {
                    this._Constrain();
                });

            scrollTween.start(this._LastVisualTick);
        }

        private _Constrain(){

            if (this._ConstrainToViewport){

                if (this.ZoomContentOffset.X > 0){
                    this.ZoomContentOffset.X = 0;
                }

                if (this.ZoomContentOffset.X < (this.ZoomContentSize.Width - this.ViewportSize.Width) * -1){
                    this.ZoomContentOffset.X = (this.ZoomContentSize.Width - this.ViewportSize.Width) * -1;
                }

                if (this.ZoomContentOffset.Y > 0){
                    this.ZoomContentOffset.Y = 0;
                }

                if (this.ZoomContentOffset.Y < (this.ZoomContentSize.Height - this.ViewportSize.Height) * -1){
                    this.ZoomContentOffset.Y = (this.ZoomContentSize.Height - this.ViewportSize.Height) * -1;
                }
            }
        }

        private _GetZoomTargetScroll(targetSize: Size): Vector {

            var currentOrigin = this._GetZoomContentOrigin(this.ZoomContentSize);
            var nextOrigin = this._GetZoomContentOrigin(targetSize);
            var diff = Vector.Sub(nextOrigin, currentOrigin);
            var targetScroll = Vector.Sub(this.ZoomContentOffset, diff);

            return targetScroll;
        }

        private _GetZoomContentOrigin(size: Size): Vector{

            switch(this._Origin){
                case Origin.Center:
                    return new Vector(size.Width / 2, size.Height / 2);
                    break;
                case Origin.TopLeft:
                    return new Vector(0, 0);
                    break;
                case Origin.BottomLeft:
                    return new Vector(0, size.Height);
                    break;
                case Origin.TopRight:
                    return new Vector(size.Width, 0);
                    break;
                case Origin.BottomRight:
                    return new Vector(size.Width, size.Height);
                    break;
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

                    this.ZoomContentOffset.Add(this._DragVelocity);
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
//            if (e.Handled)
//                return;

            this._IsMouseDown = true;
            this._RemoveVelocity();
        }

        private Zoomer_MouseLeftButtonUp(sender: any, e: Fayde.Input.MouseButtonEventArgs) {
            this._IsMouseDown = false;
            this._IsDragging = false;
        }

        private Zoomer_MouseMove(sender: any, e: Fayde.Input.MouseEventArgs) {

            if (this._IsMouseDown){
                this._IsDragging = true;
            }

            this._LastMousePosition = this._MousePosition || new Vector(0, 0);
            this._MousePosition = new Vector(e.AbsolutePos.X, e.AbsolutePos.Y);

            this._MouseDelta = this._MousePosition.Get();
            this._MouseDelta.Sub(this._LastMousePosition);

            if (this._IsDragging){
                this.ZoomContentOffset.Add(this._MouseDelta);
            }
        }
    }

}