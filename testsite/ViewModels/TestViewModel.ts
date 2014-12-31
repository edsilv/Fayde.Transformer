/// <amd-dependency path="Fayde.Utils" />

//import Size = Fayde.Utils.Size;
//import Vector = Fayde.Utils.Vector;
import ScaleTransform = Fayde.Media.ScaleTransform;
import TranslateTransform = Fayde.Media.TranslateTransform;

class TestViewModel extends Fayde.MVVM.ViewModelBase {


    _ZoomFactor: number = 2;
    _ZoomLevels: number = 5;
    _ZoomLevel: number;
    _AnimationSpeed: number = 250;
    _TranslateTransform: TranslateTransform;
    _ScaleTransform: ScaleTransform;

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

    get AnimationSpeed(): number {
        return this._AnimationSpeed;
    }

    set AnimationSpeed(value: number) {
        this._AnimationSpeed = value;
        this.OnPropertyChanged("AnimationSpeed");
    }

    get ScaleTransform(): ScaleTransform {
        return this._ScaleTransform;
    }

    set ScaleTransform(value: ScaleTransform) {
        this._ScaleTransform = value;
        this.OnPropertyChanged("ScaleTransform");
    }

    get TranslateTransform(): TranslateTransform {
        return this._TranslateTransform;
    }

    set TranslateTransform(value: TranslateTransform) {
        this._TranslateTransform = value;
        this.OnPropertyChanged("TranslateTransform");
    }

    constructor() {
        super();

        this.ZoomLevel = 0;
    }

    TransformUpdated(e: Fayde.IEventBindingArgs<Fayde.Zoomer.ZoomerEventArgs>){
        this.ScaleTransform = e.args.Scale;
        this.TranslateTransform = e.args.Translate;
    }

    Background_MouseDown(e: Fayde.IEventBindingArgs<Fayde.Input.MouseButtonEventArgs>){
        var pos = e.args.GetPosition(e.sender);
        console.log(pos.x);
    }

    Background_MouseMove(e: Fayde.IEventBindingArgs<Fayde.Input.MouseButtonEventArgs>){
        var pos = e.args.GetPosition(e.sender);
        console.log(pos.x);
    }

    ZoomIn_Click(){
        this.ZoomLevel += 1;
    }

    ZoomOut_Click(){
        this.ZoomLevel -= 1;
    }

    ScrollLeft_Click(){
        //this._ScrollTo(new Vector(this.ZoomContentOffset.X - 100, this.ZoomContentOffset.Y));
    }

    ScrollRight_Click(){
        //this._ScrollTo(new Vector(this.ZoomContentOffset.X + 100, this.ZoomContentOffset.Y));
    }

    ScrollUp_Click(){
        //this._ScrollTo(new Vector(this.ZoomContentOffset.X, this.ZoomContentOffset.Y - 100));
    }

    ScrollDown_Click(){
        //this._ScrollTo(new Vector(this.ZoomContentOffset.X, this.ZoomContentOffset.Y + 100));
    }

}

export = TestViewModel;