declare module Fayde.Zoomer {
    var Version: string;
}
import ScaleTransform = Fayde.Media.ScaleTransform;
import TranslateTransform = Fayde.Media.TranslateTransform;
import TransformGroup = Fayde.Media.TransformGroup;
import Size = minerva.Size;
import Vector = Fayde.Utils.Vector;
declare module Fayde.Zoomer {
    class Zoomer extends Controls.ContentControl {
        static ZoomFactorProperty: DependencyProperty;
        static ZoomLevelsProperty: DependencyProperty;
        static ZoomLevelProperty: DependencyProperty;
        static ConstrainToViewportProperty: DependencyProperty;
        static AnimationSpeedProperty: DependencyProperty;
        private OnZoomFactorChanged(args);
        private OnZoomLevelsChanged(args);
        private OnZoomLevelChanged(args);
        AnimationSpeed: number;
        ZoomFactor: number;
        ZoomLevels: number;
        ZoomLevel: number;
        ConstrainToViewport: boolean;
        private _TranslateTransform;
        private _ScaleTransform;
        private _TweenEasing;
        private _LastVisualTick;
        private _Timer;
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
        TransformUpdated: nullstone.Event<ZoomerEventArgs>;
        ScaleTransform: ScaleTransform;
        TranslateTransform: TranslateTransform;
        ViewportSize: Size;
        constructor();
        private _UpdateTransform();
        private Zoomer_SizeChanged(sender, e);
        OnTicked(lastTime: number, nowTime: number): void;
        private _ZoomTo(level);
        private _GetTargetScaleTransform(level);
        private _ScrollTo(newTransform);
        private _GetTargetTranslateTransform(targetScaleTransform);
        private _GetZoomOrigin(scaleTransform);
        private _Constrain();
        private _AddVelocity();
        private _RemoveVelocity();
        private Zoomer_MouseLeftButtonDown(sender, e);
        private Zoomer_MouseLeftButtonUp(sender, e);
        private Zoomer_MouseMove(sender, e);
    }
}
declare module Fayde.Zoomer {
    class ZoomerEventArgs implements nullstone.IEventArgs {
        Scale: ScaleTransform;
        Translate: TranslateTransform;
        constructor(scale: ScaleTransform, translate: TranslateTransform);
    }
}
