import ScaleTransform = Fayde.Media.ScaleTransform;
import TranslateTransform = Fayde.Media.TranslateTransform;
import TransformGroup = Fayde.Media.TransformGroup;

module Fayde.Zoomer {

    // todo: use minerva vector struct
    export class Zoomer extends Fayde.Controls.ContentControl {

        static ZoomFactorProperty = DependencyProperty.RegisterFull("ZoomFactor", () => Number, Zoomer, 2, (d, args) => (<Zoomer>d).OnZoomFactorChanged(args));
        static ZoomLevelsProperty = DependencyProperty.RegisterFull("ZoomLevels", () => Number, Zoomer, 0, (d, args) => (<Zoomer>d).OnZoomLevelsChanged(args));
        static ZoomLevelProperty = DependencyProperty.RegisterFull("ZoomLevel", () => Number, Zoomer, 0, (d, args) => (<Zoomer>d).OnZoomLevelChanged(args));
        static ConstrainToViewportProperty = DependencyProperty.RegisterFull("ConstrainToViewport", () => Boolean, Zoomer, true);
        static AnimationSpeedProperty = DependencyProperty.RegisterFull("AnimationSpeed", () => Number, Zoomer, 250);
        static DragAccelerationEnabledProperty = DependencyProperty.RegisterFull("DragAccelerationEnabled", () => Boolean, Zoomer, true);

        private OnZoomFactorChanged (args: IDependencyPropertyChangedEventArgs) {
            this._LogicalZoomer.ZoomFactor = this.ZoomFactor;
            this._LogicalZoomer.ZoomTo(this.ZoomLevel);
        }

        private OnZoomLevelsChanged (args: IDependencyPropertyChangedEventArgs) {
            this._LogicalZoomer.ZoomLevels = this.ZoomLevels;
            this._LogicalZoomer.ZoomTo(this.ZoomLevel);
        }

        private OnZoomLevelChanged (args: IDependencyPropertyChangedEventArgs) {
            this._LogicalZoomer.ZoomLevel = this.ZoomLevel;
            this._LogicalZoomer.ZoomTo(this.ZoomLevel);
        }

        AnimationSpeed: number;
        ZoomFactor: number;
        ZoomLevels: number;
        ZoomLevel: number;
        ConstrainToViewport: boolean;
        DragAccelerationEnabled: boolean;

        //get AnimationSpeed(): number {
        //    return this._LogicalZoomer.AnimationSpeed;
        //}
        //
        //set AnimationSpeed(value: number) {
        //    this._LogicalZoomer.AnimationSpeed = value;
        //}
        //
        //get ZoomFactor(): number {
        //    return this._LogicalZoomer.ZoomFactor;
        //}
        //
        //set ZoomFactor(value: number) {
        //    this._LogicalZoomer.ZoomFactor = value;
        //}
        //
        //get ZoomLevels(): number {
        //    return this._LogicalZoomer.ZoomLevels;
        //}
        //
        //set ZoomLevels(value: number) {
        //    this._LogicalZoomer.ZoomLevels = value;
        //}
        //
        //get ZoomLevel(): number {
        //    return this._LogicalZoomer.ZoomLevel;
        //}
        //
        //set ZoomLevel(value: number) {
        //    this._LogicalZoomer.ZoomLevel = value;
        //}
        //
        //get ConstrainToViewport(): boolean {
        //    return this._LogicalZoomer.ConstrainToViewport;
        //}
        //
        //set ConstrainToViewport(value: boolean) {
        //    this._LogicalZoomer.ConstrainToViewport = value;
        //}
        //
        //get DragAccelerationEnabled(): boolean {
        //    return this._LogicalZoomer.DragAccelerationEnabled;
        //}
        //
        //set DragAccelerationEnabled(value: boolean) {
        //    this._LogicalZoomer.DragAccelerationEnabled = value;
        //}

        private _LogicalZoomer: LogicalZoomer;

        TransformUpdated = new nullstone.Event<ZoomerEventArgs>();

        get ViewportSize(): Size {
            return new Size(this.ActualWidth, this.ActualHeight);
        }

        constructor() {
            super();
            this.DefaultStyleKey = Zoomer;

            this.MouseLeftButtonDown.on(this.Zoomer_MouseLeftButtonDown, this);
            this.MouseLeftButtonUp.on(this.Zoomer_MouseLeftButtonUp, this);
            this.MouseMove.on(this.Zoomer_MouseMove, this);
            this.TouchDown.on(this.Zoomer_TouchDown, this);
            this.TouchUp.on(this.Zoomer_TouchUp, this);
            this.TouchMove.on(this.Zoomer_TouchMove, this);
            this.SizeChanged.on(this.Zoomer_SizeChanged, this);

            this._LogicalZoomer = new LogicalZoomer();

            //this._LogicalZoomer.AnimationSpeed = this.AnimationSpeed;
            //this._LogicalZoomer.ZoomFactor = this.ZoomFactor;
            //this._LogicalZoomer.ZoomLevels = this.ZoomLevels;
            //this._LogicalZoomer.ZoomLevel = this.ZoomLevel;
            //this._LogicalZoomer.ConstrainToViewport = this.ConstrainToViewport;
            //this._LogicalZoomer.DragAccelerationEnabled =this.DragAccelerationEnabled;
            this._LogicalZoomer.ViewportSize = this.ViewportSize;

            this._LogicalZoomer.UpdateTransform.on(this.UpdateTransform, this);
        }

        private UpdateTransform() : void {

            var transformGroup = new TransformGroup();

            transformGroup.Children.Add(this._LogicalZoomer.ScaleTransform);
            transformGroup.Children.Add(this._LogicalZoomer.TranslateTransform);

            this.RenderTransform = transformGroup;

            //this.TransformUpdated.raise(this, new ZoomerEventArgs(this._LogicalZoomer.ScaleTransform, this._LogicalZoomer.TranslateTransform));
        }

        // intialise viewport size and handle resizing
        private Zoomer_SizeChanged (sender: any, e: Fayde.SizeChangedEventArgs) {
            this._LogicalZoomer.SizeChanged(this.ViewportSize);
        }

        private Zoomer_MouseLeftButtonDown (sender: any, e: Fayde.Input.MouseButtonEventArgs) {
            if (e.Handled)
                return;

            this.CaptureMouse();

            this._LogicalZoomer.MouseDown();
        }

        private Zoomer_MouseLeftButtonUp(sender: any, e: Fayde.Input.MouseButtonEventArgs) {
            if (e.Handled)
                return;

            this._LogicalZoomer.MouseUp();

            this.ReleaseMouseCapture();
        }

        private Zoomer_MouseMove(sender: any, e: Fayde.Input.MouseEventArgs) {
            if (e.Handled)
                return;

            this._LogicalZoomer.MouseMove(e.AbsolutePos);
        }

        private Zoomer_TouchDown(sender: any, e: Fayde.Input.TouchEventArgs) {
            if (e.Handled)
                return;

            this.CaptureMouse();

            var pos: Fayde.Input.TouchPoint = e.GetTouchPoint(null);
            this._LogicalZoomer.TouchDown(new Point(pos.Position.x, pos.Position.y));
        }

        private Zoomer_TouchUp(sender: any, e: Fayde.Input.TouchEventArgs) {
            if (e.Handled)
                return;

            this.ReleaseMouseCapture();
            this._LogicalZoomer.TouchUp();
        }

        private Zoomer_TouchMove(sender: any, e: Fayde.Input.TouchEventArgs) {
            if (e.Handled)
                return;

            var pos: Fayde.Input.TouchPoint = e.GetTouchPoint(null);

            this._LogicalZoomer.TouchMove(new Point(pos.Position.x, pos.Position.y));
        }
    }

}