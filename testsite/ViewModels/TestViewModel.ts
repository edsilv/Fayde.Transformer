import ScaleTransform = Fayde.Media.ScaleTransform;
import TranslateTransform = Fayde.Media.TranslateTransform;

class TestViewModel extends Fayde.MVVM.ViewModelBase {

    _ZoomFactor: number = 2;
    _ZoomLevels: number = 5;
    _ZoomLevel: number;
    _XPosition: number = 0;
    _YPosition: number = 0;
    _AnimationSpeed: number = 250;
    _VelocityTolerance: number = 15;
    _Transforms: TransformGroup;

    get ZoomFactor(): number {
        return this._ZoomFactor;
    }

    set ZoomFactor(value: number) {
        this._ZoomFactor = value;
        this.OnPropertyChanged("ZoomFactor");
    }

    get ZoomLevels(): number {
        return this._ZoomLevels;
    }

    set ZoomLevels(value: number) {
        this._ZoomLevels = value;
        this.OnPropertyChanged("ZoomLevels");
    }

    get ZoomLevel(): number {
        return this._ZoomLevel;
    }

    set ZoomLevel(value: number) {
        if (!(value >= 0) || !(value <= this.ZoomLevels)) return;
        this._ZoomLevel = value;
        this.OnPropertyChanged("ZoomLevel");
    }

    get XPosition(): number {
        return this._XPosition;
    }

    set XPosition(value: number) {
        this._XPosition = value;
        this.OnPropertyChanged("XPosition");
    }

    get YPosition(): number {
        return this._YPosition;
    }

    set YPosition(value: number) {
        this._YPosition = value;
        this.OnPropertyChanged("YPosition");
    }

    get AnimationSpeed(): number {
        return this._AnimationSpeed;
    }

    set AnimationSpeed(value: number) {
        this._AnimationSpeed = value;
        this.OnPropertyChanged("AnimationSpeed");
    }

    get VelocityTolerance(): number {
        return this._VelocityTolerance;
    }

    set VelocityTolerance(value: number) {
        this._VelocityTolerance = value;
        this.OnPropertyChanged("VelocityTolerance");
    }

    get Transforms(): TransformGroup {
        return this._Transforms;
    }

    set Transforms(value: TransformGroup) {
        this._Transforms = value;
        this.OnPropertyChanged("Transforms");
    }

    constructor() {
        super();

        this.ZoomLevel = 0;
    }

    TransformUpdated(e: Fayde.IEventBindingArgs<Fayde.Transformer.TransformerEventArgs>){
        this.Transforms = e.args.Transforms;
    }

    Background_MouseDown(e: Fayde.IEventBindingArgs<Fayde.Input.MouseButtonEventArgs>){
        var pos = e.args.GetPosition(e.sender);
    }

    Background_MouseMove(e: Fayde.IEventBindingArgs<Fayde.Input.MouseButtonEventArgs>){
        var pos = e.args.GetPosition(e.sender);
    }

    ZoomIn_Click(){
        this.ZoomLevel += 1;
    }

    ZoomOut_Click(){
        this.ZoomLevel -= 1;
    }

    ScrollLeft_Click(){
        this.XPosition = 0;
        this.XPosition += this.GetScrollAmount();
    }

    ScrollRight_Click(){
        this.XPosition = 0;
        this.XPosition -= this.GetScrollAmount();
    }

    ScrollUp_Click(){
        this.YPosition = 0;
        this.YPosition += this.GetScrollAmount();
    }

    ScrollDown_Click(){
        this.YPosition = 0;
        this.YPosition -= this.GetScrollAmount();
    }

    GetScrollAmount(): number {
        var scale = this.Transforms.Children.GetValueAt(0);
        return (<any>scale).ScaleX * 100;
    }

}

export = TestViewModel;