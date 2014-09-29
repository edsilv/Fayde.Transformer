declare module Fayde.Zoomer {
    var Version: string;
}
declare module Fayde.Zoomer {
    class Zoomer extends Controls.ContentControl {
        static ZoomLevelProperty: DependencyProperty;
        private OnZoomLevelChanged(args);
        public AnimationSpeed: number;
        public ZoomFactor: number;
        public ZoomContentOffset: Utils.Vector;
        public ZoomLevel: number;
        private _ZoomContentSize;
        private _TweenEasing;
        private _LastVisualTick;
        private _Timer;
        private _ConstrainToViewport;
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
        public ZoomUpdated: MulticastEvent<ZoomerEventArgs>;
        public ZoomContentSize : Utils.Size;
        public ViewportSize : Utils.Size;
        constructor();
        public OnTicked(lastTime: number, nowTime: number): void;
        public OnApplyTemplate(): void;
        private _ZoomTo(level);
        private _GetZoomTargetSize(level);
        private _ScrollTo(newScroll);
        private _Constrain();
        private _GetZoomTargetScroll(targetSize);
        private _GetZoomContentOrigin(size);
        private _AddVelocity();
        private _RemoveVelocity();
        private Zoomer_MouseLeftButtonDown(sender, e);
        private Zoomer_MouseLeftButtonUp(sender, e);
        private Zoomer_MouseMove(sender, e);
    }
}
declare module Fayde.Zoomer {
    class ZoomerEventArgs extends EventArgs {
        public Size: Utils.Size;
        public Offset: Utils.Vector;
        constructor(size: Utils.Size, offset: Utils.Vector);
    }
}
