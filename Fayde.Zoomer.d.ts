declare module Fayde.Zoomer {
    var Version: string;
}
declare module Fayde.Zoomer {
    class Zoomer extends Controls.ContentControl {
        static AnimationSpeedProperty: DependencyProperty;
        static ZoomLevelsProperty: DependencyProperty;
        static ZoomFactorProperty: DependencyProperty;
        static WidthProperty: DependencyProperty;
        static HeightProperty: DependencyProperty;
        static ZoomLevelProperty: DependencyProperty;
        private OnAnimationSpeedChanged(args);
        private OnZoomLevelsChanged(args);
        private OnZoomLevelChanged(args);
        private OnWidthChanged(args);
        private OnHeightChanged(args);
        private OnZoomFactorChanged(args);
        public ZoomLevel: number;
        public ZoomLevels: number;
        public ZoomFactor: number;
        public AnimationSpeed: number;
        private _TweenEasing;
        private _MinWidth;
        private _ViewportSize;
        private _ZoomContentSize;
        private _ZoomContentOffset;
        private _Origin;
        private _IsMouseDown;
        private _IsDragging;
        private _LastMousePosition;
        private _LastDragAccelerationMousePosition;
        private _MousePosition;
        private _MouseDelta;
        private _DragVelocity;
        private _DragAcceleration;
        private _VelocityAccumulationTolerance;
        private _DragMinSpeed;
        private _DragMaxSpeed;
        private _DragFriction;
        private _ConstrainToViewport;
        private _Timer;
        private _LastVisualTick;
        public ZoomUpdated: MulticastEvent<ZoomerEventArgs>;
        public MaxWidth : number;
        public MinWidth : number;
        public ViewportSize : Utils.Size;
        public ZoomContentSize : Utils.Size;
        public ZoomContentOffset : Utils.Vector;
        constructor();
        public OnTicked(lastTime: number, nowTime: number): void;
        public OnApplyTemplate(): void;
        private _ZoomTo(level);
        private _ScrollTo(newScroll);
        private _Constrain();
        private _GetZoomTargetSize(level);
        private _GetZoomTargetScroll(targetSize);
        private _GetZoomContentOrigin(size);
        private _AddVelocity();
        public _RemoveVelocity(): void;
        public Zoomer_MouseLeftButtonDown(e: any): void;
        public Zoomer_MouseLeftButtonUp(e: any): void;
        public Zoomer_MouseMove(e: any): void;
    }
}
declare module Fayde.Zoomer {
    class ZoomerEventArgs extends EventArgs {
        public Size: Utils.Size;
        public Offset: Utils.Vector;
        constructor(size: Utils.Size, offset: Utils.Vector);
    }
}
