# [Image Viewer](https://github.com/fengyuanchen/viewer)

> A simple jQuery image viewing plugin.

- [Demo](http://fengyuanchen.github.io/viewer)



## Features

- Supports [options](#options)
- Supports [methods](#methods)
- Supports [events](#events)
- Supports touch
- Supports move
- Supports zoom
- Supports rotation
- Supports scale (flip)
- Supports keyboard
- Cross-browser support



## Main

```
dist/
├── viewer.css     ( 8 KB)
├── viewer.min.css ( 7 KB)
├── viewer.js      (44 KB)
└── viewer.min.js  (19 KB)
```



## Getting started

### Quick start

Four quick start options are available:

- [Download the latest release](https://github.com/fengyuanchen/viewer/archive/master.zip).
- Clone the repository: `git clone https://github.com/fengyuanchen/viewer.git`.
- Install with [NPM](http://npmjs.org): `npm install imageviewer`.
- Install with [Bower](http://bower.io): `bower install imageviewer`.



### Installation

Include files:

```html
<script src="/path/to/jquery.js"></script><!-- jQuery is required -->
<link  href="/path/to/viewer.css" rel="stylesheet">
<script src="/path/to/viewer.js"></script>
```



### Usage

Initialize with `$.fn.viewer` method.

```html
<!-- a block container is required -->

<div>
  <img class="image" src="picture.jpg" alt="Picture">
</div>

<div>
  <ul class="images">
    <li><img src="picture.jpg" alt="Picture"></li>
    <li><img src="picture-2.jpg" alt="Picture 2"></li>
    <li><img src="picture-3.jpg" alt="Picture 3"></li>
  </ul>
</div>
```

```js
// View one image
$('.image').viewer();

// View some images
$('.images').viewer();
```



## Keyboard support

> Only available in modal mode.

- `Esc`: Exit full screen or stop play.
- `←`: View the previous image.
- `→`: View the next image.
- `↑`: Zoom in the image.
- `↓`: Zoom out the image.
- `Ctrl + 0`: Zoom out to initial size.
- `Ctrl + 1`: Zoom in to natural size.



## Options

You may set viewer options with `$().viewer(options)`.
If you want to change the global default options, You may use `$.fn.viewer.setDefaults(options)`.


### inline

- Type: `Boolean`
- Default: `false`

Enable inline mode.


### button

- Type: `Boolean`
- Default: `true`

Show the button on the top-right of the viewer.


### navbar

- Type: `Boolean`
- Default: `true`

Show the navbar.


### title

- Type: `Boolean`
- Default: `true`

Show the title.

> The title comes from the `alt` attribute of an image element or the image name parsed from URL.


### toolbar

- Type: `Boolean`
- Default: `true`

Show the toolbar.


### tooltip

- Type: `Boolean`
- Default: `true`

Show the tooltip with image ratio (percentage) when zoom in or zoom out


### movable

- Type: `Boolean`
- Default: `true`

Enable to move the image.


### zoomable

- Type: `Boolean`
- Default: `true`

Enable to zoom the image.


### rotatable

- Type: `Boolean`
- Default: `true`

Enable to rotate the image.


### scalable

- Type: `Boolean`
- Default: `true`

Enable to scale the image.


### transition

- Type: `Boolean`
- Default: `true`

Enable CSS3 Transition for some special elements.


### fullscreen

- Type: `Boolean`
- Default: `true`

Enable to request full screen when play.

> Requires the browser supports [Full Screen API](http://caniuse.com/fullscreen).


### keyboard

- Type: `Boolean`
- Default: `true`

Enable keyboard support.


### interval

- Type: `Number`
- Default: `5000`

Define interval of each image when playing.


### zoomRatio

- Type: `Number`
- Default: `0.1`

Define the ratio when zoom the image by wheeling mouse.


### minZoomRatio

- Type: `Number`
- Default: `0.01`

Define the min ratio of the image when zoom out.


### maxZoomRatio

- Type: `Number`
- Default: `100`

Define the max ratio of the image when zoom in.


### zIndex

- Type: `Number`
- Default: `2015`

Define the CSS `z-index` value of viewer in modal mode.


### zIndexInline

- Type: `Number`
- Default: `0`

Define the CSS `z-index` value of viewer in inline mode.


### url

- Type: `String` or `Function`
- Default: `'src'`

Define where to get the original image URL for viewing.

> If it is a string, it should be one of the attributes of each image element.
> If it is a function, it will be called on each image and should return a valid image URL.


### build

- Type: `Function`
- Default: `null`

A shortcut of the "build.viewer" event.


### built

- Type: `Function`
- Default: `null`

A shortcut of the "built.viewer" event.


### show

- Type: `Function`
- Default: `null`

A shortcut of the "show.viewer" event.


### shown

- Type: `Function`
- Default: `null`

A shortcut of the "shown.viewer" event.


### hide

- Type: `Function`
- Default: `null`

A shortcut of the "hide.viewer" event.


### hidden

- Type: `Function`
- Default: `null`

A shortcut of the "hidden.viewer" event.



## Methods

As there is an **asynchronous** process when load the image(s), you **should call most of the methods after shown (modal mode) or built (inline mode)**, except "show" (modal mode) and "destroy".

```js
// Modal mode
$().viewer({
  shown: function () {
    $().viewer('method', argument1, , argument2, ..., argumentN);
  }
}

// Inline mode
$().viewer({
  built: function () {
    $().viewer('method', argument1, , argument2, ..., argumentN);
  }
}
```


### show()

Show the viewer.

> Only available in modal mode.



### hide()

hide the viewer.

> Only available in modal mode.



### view([index])

- **index** (optional):
  - Type: `Number`
  - Default: `0`
  - The index of the image for viewing

View one of the images with image's index.

```js
$().viewer('view', 1); // View the second image
```


### prev()

View the previous image.


### next()

View the next image.


### move(offsetX[, offsetY])

- **offsetX**:
  - Type: `Number`
  - Default: `0`
  - Moving size (px) in the horizontal direction

- **offsetY** (optional):
  - Type: `Number`
  - Moving size (px) in the vertical direction.
  - If not present, its default value is `offsetX`

Move the image.

```js
$().viewer('move', 1);
$().viewer('move', -1, 0); // Move left
$().viewer('move', 1, 0);  // Move right
$().viewer('move', 0, -1); // Move up
$().viewer('move', 0, 1);  // Move down
```


### zoom(ratio[, hasTooltip])

- **ratio**:
  - Type: `Number`
  - Zoom in: requires a positive number (ratio > 0)
  - Zoom out: requires a negative number (ratio < 0)

- **hasTooltip** (optional):
  - Type: `Boolean`
  - Default: `false`
  - Show tooltip

Zoom the image.

```js
$().viewer('zoom', 0.1);
$().viewer('zoom', -0.1);
```


### zoomTo(ratio[, hasTooltip])

- **ratio**:
  - Type: `Number`
  - Requires a positive number (ratio > 0)

- **hasTooltip** (optional):
  - Type: `Boolean`
  - Default: `false`
  - Show tooltip

Zoom the image to a special ratio.

```js
$().viewer('zoomTo', 0); // Zoom to zero size (0%)
$().viewer('zoomTo', 1); // Zoom to natural size (100%)
```


### rotate(degree)

- **degree**:
  - Type: `Number`
  - Rotate right: requires a positive number (degree > 0)
  - Rotate left: requires a negative number (degree < 0)

Rotate the image.

> Requires [CSS3 2D Transforms](http://caniuse.com/transforms2d) support (IE 9+).

```js
$().viewer('rotate', 90);
$().viewer('rotate', -90);
```


### rotateTo(degree)

- **degree**:
  - Type: `Number`

Rotate the image to a special angle.

> Requires [CSS3 2D Transforms](http://caniuse.com/transforms2d) support (IE 9+).

```js
$().viewer('rotateTo', 0); // Reset to zero degree
$().viewer('rotateTo', 360); // Rotate a full round
```


### scale(scaleX[, scaleY])

- **scaleX**:
  - Type: `Number`
  - Default: `1`
  - The scaling factor to apply on the abscissa of the image
  - When equal to `1` it does nothing.

- **scaleY** (optional):
  - Type: `Number`
  - The scaling factor to apply on the ordinate of the image
  - If not present, its default value is `scaleX`.

Scale the image.

> Requires [CSS3 2D Transforms](http://caniuse.com/transforms2d) support (IE 9+).

```js
$().viewer('scale', -1); // Flip both horizontal and vertical
$().viewer('scale', -1, 1); // Flip horizontal
$().viewer('scale', 1, -1); // Flip vertical
```

### scaleX(scaleX)

- **scaleX**:
  - Type: `Number`
  - Default: `1`
  - The scaling factor to apply on the abscissa of the image
  - When equal to `1` it does nothing

Scale the abscissa of the image.

> Requires [CSS3 2D Transforms](http://caniuse.com/transforms2d) support (IE 9+).

```js
$().viewer('scaleX', -1); // Flip horizontal
```


### scaleY(scaleY)

- **scaleY**:
  - Type: `Number`
  - Default: `1`
  - The scaling factor to apply on the ordinate of the image
  - When equal to `1` it does nothing

Scale the ordinate of the image.

> Requires [CSS3 2D Transforms](http://caniuse.com/transforms2d) support (IE 9+).

```js
$().viewer('scaleY', -1); // Flip vertical
```


### play()

Play the images.


### stop()

Stop play.


### full()

Enter modal mode.

> only available in inline mode.


### exit()

Exit  modal mode.

> only available in inline mode.


### tooltip()

Show the current ratio of the image with percentage.

> Requires the `tooltip` option set to `true`.


### toggle()

Toggle the image size between its natural size and initial size.


### reset()

Reset the image to its initial state.


### destroy()

Destroy the viewer and remove the instance.



## Events

### build.viewer

This event fires when a viewer instance start to build.


### built.viewer

This event fires when a viewer instance has built.


### show.viewer

This event fires when a viewer element start to show.

> only available in modal mode.


### shown.viewer

This event fires when a viewer element has shown.

> only available in modal mode.


### hide.viewer

This event fires when a viewer element start to hide.

> only available in modal mode.


### hidden.viewer

This event fires when a viewer element has hidden.

> only available in modal mode.



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

- Chrome (latest 2)
- Firefox (latest 2)
- Internet Explorer 8+
- Opera (latest 2)
- Safari (latest 2)

As a jQuery plugin, you also need to see the [jQuery Browser Support](http://jquery.com/browser-support/).



## Versioning

Maintained under the [Semantic Versioning guidelines](http://semver.org/).



## [License](LICENSE.md)

[MIT](http://opensource.org/licenses/MIT) © [Fengyuan Chen](http://github.com/fengyuanchen)
