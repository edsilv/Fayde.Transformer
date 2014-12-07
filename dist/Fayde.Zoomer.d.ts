declare module Fayde.Zoomer {
    var Version: string;
}
declare module Fayde.Zoomer {
    import Size = Fayde.Utils.Size;
    import Vector = Fayde.Utils.Vector;
    class Zoomer extends Controls.ContentControl {
        static ZoomLevelProperty: DependencyProperty;
        static ConstrainToViewportProperty: DependencyProperty;
        private OnZoomLevelChanged(args);
        AnimationSpeed: number;
        ZoomFactor: number;
        ZoomContentOffset: Vector;
        ZoomLevel: number;
        ConstrainToViewport: boolean;
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
        ViewportSize: Size;
        constructor();
        private Zoomer_SizeChanged(sender, e);
        OnTicked(lastTime: number, nowTime: number): void;
        private _ZoomTo(level, instantly?);
        private _OnZoomUpdated();
        private _GetZoomTargetSize(level);
        private _ScrollTo(newOffset, instantly?);
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
    import Size = Fayde.Utils.Size;
    import Vector = Fayde.Utils.Vector;
    class ZoomerEventArgs implements nullstone.IEventArgs {
        Size: Size;
        Offset: Vector;
        constructor(size: Size, offset: Vector);
    }
}
