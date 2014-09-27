
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

    export class Zoomer extends Fayde.Controls.ContentControl {

        static ZoomLevelsProperty = DependencyProperty.Register("ZoomLevels", () => Number, Zoomer, 10, (d, args) => (<Zoomer>d).OnZoomLevelsChanged(args));
        static ZoomLevelProperty = DependencyProperty.Register("ZoomLevel", () => Number, Zoomer, 0, (d, args) => (<Zoomer>d).OnZoomLevelChanged(args));

        private OnZoomLevelsChanged (args: IDependencyPropertyChangedEventArgs) {
            this.ZoomLevels = args.NewValue;
        }

        private OnZoomLevelChanged (args: IDependencyPropertyChangedEventArgs) {
            var value = Math.floor(args.NewValue);

            //if (value == this.ZoomLevel) return;

            if (value < 0 || value > this.ZoomLevels) return;

            this._ZoomLevel = value;
    
            this._ZoomTo(value, () => {
                this.ZoomChanged.Raise(this, new ZoomerEventArgs(this.ZoomContentSize, this.ZoomContentOffset))
            }, () => {
                console.log("zoomLevel: " + this.ZoomLevel);
                console.log("width: " + this.ZoomContentSize.Width);
            });
        }

        private _TweenSpeed: number = 250;
        private _TweenEasing: any;

        private _ZoomLevel: number;
        private _ZoomLevels: number = 10;
        private _ZoomFactor: number = 2;
        private _MinWidth: number;

        private _ViewportSize: Size;
        private _ZoomContentSize: Size;
        private _ZoomContentOffset: Vector;

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

        private _ConstrainToViewport: boolean = true;

        private _Timer: Fayde.ClockTimer;
        private _LastVisualTick: number = new Date(0).getTime();

        ZoomChanged = new MulticastEvent<ZoomerEventArgs>();

        get ZoomLevels(): number {
            return this._ZoomLevels;
        }

        set ZoomLevels(value: number) {
            this._ZoomLevels = value;
        }

        get ZoomFactor(): number {
            return this._ZoomFactor;
        }

        set ZoomFactor(value: number) {
            this._ZoomFactor = value;
        }

        get MaxWidth(): number {
            return Math.pow(this.ZoomFactor, this.ZoomLevels) * this.MinWidth;
        }

        get MinWidth(): number {
            return this._MinWidth;
        }

        set MinWidth(value: number) {
            this._MinWidth = value;
        }

        get ViewportSize(): Size {
            return this._ViewportSize;
        }

        set ViewportSize(value: Size) {
            // The MinWidth determines all zoom sizes.
            // If initial ZoomLevel is 0, the minwidth becomes the ViewPort width
            // (1 * ViewPort width)
            this.MinWidth = Math.pow(this.ZoomFactor, this.ZoomLevel * -1) * value.Width;
            this._ViewportSize = value;
        }

        get ZoomContentSize(): Size {
            if(!this._ZoomContentSize){
                this._ZoomContentSize = new Size(this._ViewportSize.Width, this._ViewportSize.Height);;
            }
            return this._ZoomContentSize;
        }

        set ZoomContentSize(value: Size) {
            this._ZoomContentSize = value;
        }

        get ZoomContentOffset(): Vector {
            if(!this._ZoomContentOffset){
                this._ZoomContentOffset = new Vector(0, 0);
            }
            return this._ZoomContentOffset;
        }

        set ZoomContentOffset(value: Vector) {
            this._ZoomContentOffset = value;
        }

        get ZoomLevel(): number {
            return this._ZoomLevel;
        }

        constructor() {
            super();
            this.DefaultStyleKey = (<any>this).constructor;

            this._TweenEasing = TWEEN.Easing.Quadratic.InOut;

            //this.ViewportSize = new Size(this.Width, this.Height);
            this.ViewportSize = new Size(320, 240);
//            this.ZoomLevel = this.InitialZoomLevel; // trigger initial sizing

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

        }

        /**
         * Zoom in or out (invoked by ZoomLevel setter)
         *
         * @method ZoomTo
         * @param {Number} level An integer in the range 0 to ZoomLevels (inclusive)
         * @param {Function} onUpdateCallback An optional callback function for every zoom animation frame
         * @param {Function} onCompleteCallback An optional callback function for when the zoom completes
         * @return {Void}
         */
        _ZoomTo(level: number, onUpdateCallback?: () => void, onCompleteCallback?: () => void): void {

            var newSize = this._GetZoomTargetSize(level);

            var zoomTween = new TWEEN.Tween(this.ZoomContentSize)
                .to(newSize, this._TweenSpeed)
                .delay(0)
                .easing(this._TweenEasing)
                .onUpdate(() => {
                    if (onUpdateCallback) onUpdateCallback();
                })
                .onComplete(() => {
                    if (onCompleteCallback) onCompleteCallback();
                });

            zoomTween.start(this._LastVisualTick);

            var newScroll = this._GetZoomTargetScroll(newSize);

            this._ScrollTo(newScroll);
        }

        _ScrollTo(newScroll: Vector) {
            var scrollTween = new TWEEN.Tween(this.ZoomContentOffset)
                .to(newScroll, this._TweenSpeed)
                .delay(0)
                .easing(this._TweenEasing)
                .onUpdate(() => {
                    this._Constrain();
                });

            scrollTween.start(this._LastVisualTick);
        }

        _Constrain(){

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

        private _GetZoomTargetSize(level: number): Size {

            var newWidth = Math.pow(this.ZoomFactor, level) * this.MinWidth;
            var newHeight = this.ZoomContentSize.AspectRatio * newWidth;

            return new Size(newWidth, newHeight);
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

        _AddVelocity(){

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

        _RemoveVelocity(){
            this._DragVelocity.Mult(0);
        }

        Zoomer_MouseLeftButtonDown(e: any) {
            this._IsMouseDown = true;
            this._RemoveVelocity();
        }

        Zoomer_MouseLeftButtonUp(e: any) {
            this._IsMouseDown = false;
            this._IsDragging = false;
        }

        Zoomer_MouseMove(e: any) {

            if (this._IsMouseDown){
                this._IsDragging = true;
            }

            this._LastMousePosition = this._MousePosition || new Vector(0, 0);
            this._MousePosition = new Vector(e.args.AbsolutePos.X, e.args.AbsolutePos.Y);

            this._MouseDelta = this._MousePosition.Get();
            this._MouseDelta.Sub(this._LastMousePosition);

            if (this._IsDragging){
                this.ZoomContentOffset.Add(this._MouseDelta);
            }
        }
    }

}