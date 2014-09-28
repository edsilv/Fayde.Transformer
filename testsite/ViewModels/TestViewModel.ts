/// <reference path="../lib/Fayde/Fayde.d.ts" />
/// <reference path="../lib/fayde.utils/Fayde.Utils.d.ts" />
/// <reference path="../../Fayde.Zoomer.d.ts" />

import Size = Fayde.Utils.Size;
import Vector = Fayde.Utils.Vector;

class TestViewModel extends Fayde.MVVM.ViewModelBase {

    _ZoomLevel: number;
    _ZoomContentOffset: Vector;
    _ZoomContentSize: Size;

    get ZoomLevel(): number {
        return this._ZoomLevel;
    }

    set ZoomLevel(value: number) {

        this._ZoomLevel = value;

        this.OnPropertyChanged("ZoomLevel");
    }

    get ZoomContentSize(): Size {
        return this._ZoomContentSize;
    }

    set ZoomContentSize(value: Size) {
        this._ZoomContentSize = value;
        this.OnPropertyChanged("ZoomContentSize");
    }

    get ZoomContentOffset(): Vector {
        if(!this._ZoomContentOffset){
            this._ZoomContentOffset = new Vector(0, 0);
        }
        return this._ZoomContentOffset;
    }

    set ZoomContentOffset(value: Vector) {
        this._ZoomContentOffset = value;
        this.OnPropertyChanged("ZoomContentOffset");
    }

    constructor() {
        super();

        this.ZoomLevel = 0;
    }

    ZoomChanged(e: Fayde.IEventBindingArgs<Fayde.Zoomer.ZoomerEventArgs>){
        this.ZoomContentSize = e.args.Size;
        this.ZoomContentOffset = e.args.Offset;
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