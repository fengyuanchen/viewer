import $ from 'jquery';
import Viewer from 'viewerjs/src';

if ($.fn) {
  const AnotherViewer = $.fn.viewer;
  const NAMESPACE = 'viewer';

  $.fn.viewer = function jQueryViewer(option, ...args) {
    let result;

    this.each((i, element) => {
      const $element = $(element);
      const isDestroy = option === 'destroy';
      let viewer = $element.data(NAMESPACE);

      if (!viewer) {
        if (isDestroy) {
          return;
        }

        const options = $.extend({}, $element.data(), $.isPlainObject(option) && option);

        viewer = new Viewer(element, options);
        $element.data(NAMESPACE, viewer);
      }

      if (typeof option === 'string') {
        const fn = viewer[option];

        if ($.isFunction(fn)) {
          result = fn.apply(viewer, args);

          if (result === viewer) {
            result = undefined;
          }

          if (isDestroy) {
            $element.removeData(NAMESPACE);
          }
        }
      }
    });

    return result !== undefined ? result : this;
  };

  $.fn.viewer.Constructor = Viewer;
  $.fn.viewer.setDefaults = Viewer.setDefaults;
  $.fn.viewer.noConflict = function noConflict() {
    $.fn.viewer = AnotherViewer;
    return this;
  };
}
