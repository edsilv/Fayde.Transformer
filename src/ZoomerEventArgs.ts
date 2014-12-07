module Fayde.Zoomer {
    import Size = Fayde.Utils.Size;
    import Vector = Fayde.Utils.Vector;

    export class ZoomerEventArgs implements nullstone.IEventArgs {
        Size: Size;
        Offset: Vector;

        constructor (size: Size, offset: Vector) {
            Object.defineProperty(this, 'Size', { value: size, writable: false });
            Object.defineProperty(this, 'Offset', { value: offset, writable: false });
        }
    }
}