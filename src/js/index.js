import $ from 'jquery';
import Viewer from './viewer';
import {
  NAMESPACE,
} from './constants';
import {
  isString,
  isUndefined,
} from './utilities';

if ($.fn) {
  const AnotherViewer = $.fn.viewer;

  $.fn.viewer = function jQueryViewer(option, ...args) {
    let result;

    this.each((i, element) => {
      const $element = $(element);
      let data = $element.data(NAMESPACE);

      if (!data) {
        if (/destroy/.test(option)) {
          return;
        }

        const options = $.extend({}, $element.data(), $.isPlainObject(option) && option);

        data = new Viewer(element, options);
        $element.data(NAMESPACE, data);
      }

      if (isString(option)) {
        const fn = data[option];

        if ($.isFunction(fn)) {
          result = fn.apply(data, args);
        }
      }
    });

    return isUndefined(result) ? this : result;
  };

  $.fn.viewer.Constructor = Viewer;
  $.fn.viewer.setDefaults = Viewer.setDefaults;
  $.fn.viewer.noConflict = function noConflict() {
    $.fn.viewer = AnotherViewer;
    return this;
  };
};
