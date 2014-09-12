/// <reference path="Fayde.d.ts" />

module Fayde.Zoomer {
    import Controls = Fayde.Controls;

    export class Zoomer extends Controls.Control {

        constructor() {
            super();
            this.DefaultStyleKey = (<any>this).constructor;
        }

        OnApplyTemplate() {
            super.OnApplyTemplate();

        }
    }

}