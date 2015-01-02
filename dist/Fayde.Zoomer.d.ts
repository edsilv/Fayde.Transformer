declare module Fayde.Zoomer {
    var Version: string;
}
import Vector = Fayde.Utils.Vector;
declare module Fayde.Zoomer {
    class LogicalZoomer {
        private _TweenEasing;
        private _Timer;
        private _LastVisualTick;
        private _IsPointerDown;
        private _IsDragging;
        private _LastPointerPosition;
        private _LastDragAccelerationPointerPosition;
        private _PointerPosition;
        private _PointerDelta;
        private _DragVelocity;
        private _DragAcceleration;
        private _VelocityAccumulationTolerance;
        private _DragMinSpeed;
        private _DragMaxSpeed;
        private _DragFriction;
        private _TranslateTransform;
        private _ScaleTransform;
        ViewportSize: Size;
        AnimationSpeed: number;
        ZoomFactor: number;
        ZoomLevels: number;
        ZoomLevel: number;
        ConstrainToViewport: boolean;
        DragAccelerationEnabled: boolean;
        UpdateTransform: RoutedEvent<RoutedEventArgs>;
        ScaleTransform: ScaleTransform;
        TranslateTransform: TranslateTransform;
        constructor();
        OnTicked(lastTime: number, nowTime: number): void;
        SizeChanged(viewportSize: Size): void;
        ZoomTo(level: number): void;
        private _GetTargetScaleTransform(level);
        ScrollTo(newTransform: TranslateTransform): void;
        private _GetTargetTranslateTransform(targetScaleTransform);
        private _GetZoomOrigin(scaleTransform);
        private _Constrain();
        private _AddVelocity();
        private _RemoveVelocity();
        PointerDown(position: Point): void;
        PointerUp(): void;
        PointerMove(position: Point): void;
    }
}
import ScaleTransform = Fayde.Media.ScaleTransform;
import TranslateTransform = Fayde.Media.TranslateTransform;
import TransformGroup = Fayde.Media.TransformGroup;
declare module Fayde.Zoomer {
    class Zoomer extends Controls.ContentControl {
        static ZoomFactorProperty: DependencyProperty;
        static ZoomLevelsProperty: DependencyProperty;
        static ZoomLevelProperty: DependencyProperty;
        static ConstrainToViewportProperty: DependencyProperty;
        static AnimationSpeedProperty: DependencyProperty;
        static DragAccelerationEnabledProperty: DependencyProperty;
        private OnZoomFactorChanged(args);
        private OnZoomLevelsChanged(args);
        private OnZoomLevelChanged(args);
        private OnConstrainToViewportChanged(args);
        private OnAnimationSpeedChanged(args);
        private OnDragAccelerationEnabledChanged(args);
        AnimationSpeed: number;
        ZoomFactor: number;
        ZoomLevels: number;
        ZoomLevel: number;
        ConstrainToViewport: boolean;
        DragAccelerationEnabled: boolean;
        private _LogicalZoomer;
        TransformUpdated: nullstone.Event<ZoomerEventArgs>;
        ViewportSize: Size;
        constructor();
        private UpdateTransform();
        private Zoomer_SizeChanged(sender, e);
        private Zoomer_MouseLeftButtonDown(sender, e);
        private Zoomer_MouseLeftButtonUp(sender, e);
        private Zoomer_MouseMove(sender, e);
        private Zoomer_TouchDown(sender, e);
        private Zoomer_TouchUp(sender, e);
        private Zoomer_TouchMove(sender, e);
    }
}
declare module Fayde.Zoomer {
    import ScaleTransform = Fayde.Media.ScaleTransform;
    import TranslateTransform = Fayde.Media.TranslateTransform;
    class ZoomerEventArgs implements nullstone.IEventArgs {
        Scale: ScaleTransform;
        Translate: TranslateTransform;
        constructor(scale: ScaleTransform, translate: TranslateTransform);
    }
}
