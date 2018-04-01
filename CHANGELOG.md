# Changelog

## 1.0.0 (Apr 1, 2018)

- Upgrade Viewer.js to 1.0.0.

## 1.0.0-beta (Mar 15, 2018)

- Upgrade Viewer.js to 1.0.0-rc.1.

## 1.0.0-alpha (Mar 11, 2018)

- The core code of Viewer is replaced with [Viewer.js](https://github.com/fengyuanchen/viewerjs) now.

## 0.7.0 (Mar 11, 2018)

- Emulate scroll bar width when modal opening.
- Disallow to show again if it had shown.

## 0.6.0 (Oct 7, 2017)

- Refactor in ES6.
- Build CSS code with PostCSS.
- Removed `build` event.
- Renamed `built` event to `ready`.
- Removed event namespace.

## 0.5.1 (Mar 11, 2016)

- Fixed the issue of the "button" option (#8).
- Fixed the issue of the "$.fn.viewer.setDefault" static method (#9).

## 0.5.0 (Jan 21, 2016)

- Add more available values to the "title", "toolbar" and "navbar" options.
- Support to toggle the visibility of title, toolbar and navbar between different screen widths.
- Exit fullscreen when stop playing.
- Fixed title not generated bug (#6).

## 0.4.0 (Jan 1, 2016)

- Added "update" method for update image dynamically.
- Hides title and toolbar on small screen (width < 768px).

## 0.3.1 (Dec 28, 2015)

- Supports to zoom from event triggering point.
- Fix a bug of the index of viewing image.

## 0.3.0 (Dec 24, 2015)

- Add 2 new options: "view" and "viewed"
- Add 2 new events: "view" and "viewed"
- Add keyboard support: stop playing when tap the `Space` key
- Fix lost transition after call full method in inline mode
- Fix incorrect tooltip after switch image quickly

## 0.2.0 (Oct 18, 2015)

- Added one new method: "moveTo"
- Improved the image loading and showing

## 0.1.1 (Oct 7, 2015)

- Fixed the issue of modal closing after zoomed in and zoomed out

## 0.1.0 (Sep 2, 2015)

- Supports 2 modes: "modal" (default), "inline"
- Supports 28 options: "inline", "button", "navbar", "title", "toolbar", "tooltip", "movable", "zoomable", "rotatable", "scalable", "transition", "fullscreen", "keyboard", "interval", "minWidth", "minHeight", "zoomRatio", "minZoomRatio", "maxZoomRatio", "zIndex", "zIndexInline", "url", "build", "built", "show", "shown", "hide", "hidden"
- Supports 21 methods: "show", "hide", "view", "prev", "next", "move", "zoom", "zoomTo", "rotate", "rotateTo", "scale", "scaleX", "scaleY", "play", "stop", "full", "exit", "tooltip", "toggle", "reset", "destroy"
- Supports 6 events: "build.viewer", "built.viewer", "show.viewer", "shown.viewer", "hide.viewer", "hidden.viewer"

## 0.0.1 (Apr 19, 2015)

- Improve UI
- Develop a alpha version

## 0.0.0 (Apr 19, 2014)

- Design UI
- Develop a draft version
