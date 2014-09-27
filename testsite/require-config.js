var require = {
    baseUrl: "./",
    paths: {
        "text": "lib/requirejs-text/text",
        "Fayde": "lib/Fayde/Fayde",
        "utils": "lib/fayde.utils/Fayde.Utils",
        "tween": "lib/tween.ts/build/tween.min"
    },
    deps: ["text", "Fayde", "utils", "tween"],
    callback: function (text, Fayde, utils, tween) {
        Fayde.LoadConfigJson(function (config, err) {
            if (err)
                console.warn('Could not load fayde configuration file.', err);
            Fayde.Run();
        });
    },
    shim: {
        "Fayde": {
            exports: "Fayde",
            deps: ["text"]
        },
        "utils": {
            deps: ["Fayde"]
        }
    }
};