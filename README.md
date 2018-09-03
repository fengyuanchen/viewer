# Viewer

[![Build Status](https://travis-ci.org/fengyuanchen/viewer.svg)](https://travis-ci.org/fengyuanchen/viewer) [![Downloads](https://img.shields.io/npm/dm/imageviewer.svg)](https://www.npmjs.com/package/imageviewer) [![Version](https://img.shields.io/npm/v/imageviewer.svg)](https://www.npmjs.com/package/imageviewer)

> A simple jQuery image viewing plugin. As of v1.0.0, the core code of Viewer is replaced with [Viewer.js](https://github.com/fengyuanchen/viewerjs).

- [Demo](https://fengyuanchen.github.io/viewer)
- [Viewer.js](https://github.com/fengyuanchen/viewerjs) - JavaScript image viewer (**recommended**)
- [jquery-viewer](https://github.com/fengyuanchen/jquery-viewer) - A jQuery plugin wrapper for Viewer.js (**recommended** for jQuery users to use this instead of Viewer)

## Main

```text
dist/
├── viewer.css
├── viewer.min.css   (compressed)
├── viewer.js        (UMD)
├── viewer.min.js    (UMD, compressed)
├── viewer.common.js (CommonJS, default)
└── viewer.esm.js    (ES Module)
```

## Getting started

### Installation

```shell
npm install imageviewer jquery
```

Include files:

```html
<script src="/path/to/jquery.js"></script><!-- jQuery is required -->
<script src="/path/to/viewer.js"></script>
<link  href="/path/to/viewer.css" rel="stylesheet">
```

### Usage

Initialize with `$.fn.viewer` method.

```html
<!-- a block container is required -->
<div>
  <img id="image" src="picture.jpg" alt="Picture">
</div>

<div>
  <ul id="images">
    <li><img src="picture-1.jpg" alt="Picture 1"></li>
    <li><img src="picture-2.jpg" alt="Picture 2"></li>
    <li><img src="picture-3.jpg" alt="Picture 3"></li>
  </ul>
</div>
```

```js
var $image = $('#image');

$image.viewer({
  inline: true,
  viewed: function() {
    $image.viewer('zoomTo', 1);
  }
});

// Get the Viewer.js instance after initialized
var viewer = $image.data('viewer');

// View a list of images
$('#images').viewer();
```

## Options

See the available [options](https://github.com/fengyuanchen/viewerjs#options) of Viewer.js.

```js
$().viewer(options);
```

## Methods

See the available [methods](https://github.com/fengyuanchen/viewerjs#methods) of Viewer.js.

```js
$().viewer('method', argument1, , argument2, ..., argumentN);
```

## Events

See the available [events](https://github.com/fengyuanchen/viewerjs#events) of Viewer.js.

```js
$().on('event', handler);
```

## No conflict

If you have to use other plugin with the same namespace, just call the `$.fn.viewer.noConflict` method to revert to it.

```html
<script src="other-plugin.js"></script>
<script src="viewer.js"></script>
<script>
  $.fn.viewer.noConflict();
  // Code that uses other plugin's "$().viewer" can follow here.
</script>
```

## Browser support

It is the same as the [browser support of Viewer.js](https://github.com/fengyuanchen/viewerjs#browser-support). As a jQuery plugin, you also need to see the [jQuery Browser Support](http://jquery.com/browser-support/).

## Contributing

Please read through our [contributing guidelines](.github/CONTRIBUTING.md).

## Versioning

Maintained under the [Semantic Versioning guidelines](https://semver.org/).

## License

[MIT](https://opensource.org/licenses/MIT) © [Chen Fengyuan](https://chenfengyuan.com)
