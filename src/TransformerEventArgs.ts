module Fayde.Transformer {
    import ScaleTransform = Fayde.Media.ScaleTransform;
    import TranslateTransform = Fayde.Media.TranslateTransform;

    export class TransformerEventArgs implements nullstone.IEventArgs {
        Scale: ScaleTransform;
        Translate: TranslateTransform;

        constructor (scale: ScaleTransform, translate: TranslateTransform) {
            Object.defineProperty(this, 'Scale', {value: scale, writable: false});
            Object.defineProperty(this, 'Translate', {value: translate, writable: false});
        }
    }
}