declare module Fayde.Zoomer {
    var Version: string;
}
declare module Fayde.Zoomer {
    import Size = Fayde.Utils.Size;
    class Zoomer extends Controls.ContentControl {
        static ZoomLevelProperty: DependencyProperty;
        static ConstrainToViewportProperty: DependencyProperty;
        private OnZoomLevelChanged(args);
        AnimationSpeed: number;
        ZoomFactor: number;
        ZoomLevel: number;
        ConstrainToViewport: boolean;
        private _ZoomContentOffset;
        private _ZoomContentSize;
        private _TweenEasing;
        private _LastVisualTick;
        private _Timer;
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
        ZoomUpdated: nullstone.Event<ZoomerEventArgs>;
        ZoomContentSize: Size;
        ZoomContentOffset: Point;
        ViewportSize: Size;
        constructor();
        private _UpdateTransform();
        private Zoomer_SizeChanged(sender, e);
        OnTicked(lastTime: number, nowTime: number): void;
        private _ZoomTo(level, instantly?);
        private _OnZoomUpdated();
        private _GetZoomTargetSize(level);
        private _ScrollTo(newOffset, instantly?);
        private _GetZoomTargetOffset(targetSize);
        private _Constrain();
        private _GetZoomContentOrigin(size);
        private _AddVelocity();
        private _RemoveVelocity();
        private Zoomer_MouseLeftButtonDown(sender, e);
        private Zoomer_MouseLeftButtonUp(sender, e);
        private Zoomer_MouseMove(sender, e);
    }
}
declare module Fayde.Zoomer {
    import Size = Fayde.Utils.Size;
    class ZoomerEventArgs implements nullstone.IEventArgs {
        Size: Size;
        Offset: Point;
        constructor(size: Size, offset: Point);
    }
}
