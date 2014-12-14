module Fayde.Zoomer {
    import Size = Fayde.Utils.Size;

    export class ZoomerEventArgs implements nullstone.IEventArgs {
        Size: Size;
        Offset: Point;

        constructor (size: Size, offset: Point) {
            Object.defineProperty(this, 'Size', { value: size, writable: false });
            Object.defineProperty(this, 'Offset', { value: offset, writable: false });
        }
    }
}