module Fayde.Zoomer {

    import Size = Fayde.Utils.Size;
    import Vector = Fayde.Utils.Vector;

    export class ZoomerEventArgs extends EventArgs {
        Size: Size;
        Offset: Vector;

        constructor (size: Size, offset: Vector) {
            super();
            Object.defineProperty(this, 'Size', { value: size, writable: false });
            Object.defineProperty(this, 'Offset', { value: offset, writable: false });
        }
    }
}