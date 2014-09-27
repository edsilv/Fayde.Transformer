declare module Fayde.Zoomer {
    var Version: string;
}
declare module Fayde.Zoomer {
    class Zoomer extends Controls.ContentControl {
        static ZoomLevelsProperty: DependencyProperty;
        static ZoomLevelProperty: DependencyProperty;
        private OnZoomLevelsChanged(args);
        private OnZoomLevelChanged(args);
        private _TweenSpeed;
        private _TweenEasing;
        private _ZoomLevel;
        private _ZoomLevels;
        private _ZoomFactor;
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
        public ZoomChanged: MulticastEvent<ZoomerEventArgs>;
        public ZoomLevels : number;
        public ZoomFactor : number;
        public MaxWidth : number;
        public MinWidth : number;
        public ViewportSize : Utils.Size;
        public ZoomContentSize : Utils.Size;
        public ZoomContentOffset : Utils.Vector;
        public ZoomLevel : number;
        constructor();
        public OnTicked(lastTime: number, nowTime: number): void;
        public OnApplyTemplate(): void;
        public _ZoomTo(level: number, onUpdateCallback?: () => void, onCompleteCallback?: () => void): void;
        public _ScrollTo(newScroll: Utils.Vector): void;
        public _Constrain(): void;
        private _GetZoomTargetSize(level);
        private _GetZoomTargetScroll(targetSize);
        private _GetZoomContentOrigin(size);
        public _AddVelocity(): void;
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
