import $ from 'jquery';
import DEFAULTS from './defaults';
import TEMPLATE from './template';
import render from './render';
import events from './events';
import handlers from './handlers';
import methods from './methods';
import others from './others';
import {
  CLASS_CLOSE,
  CLASS_FADE,
  CLASS_FIXED,
  CLASS_FULLSCREEN,
  CLASS_HIDE,
  CLASS_INVISIBLE,
  EVENT_CLICK,
  EVENT_LOAD,
  EVENT_READY,
  NAMESPACE,
} from './constants';
import {
  getResponsiveClass,
  isUndefined,
} from './utilities';

class Viewer {
  /**
   * Create a new Viewer.
   * @param {Element} element - The target element for viewing.
   * @param {Object} [options={}] - The configuration options.
   */
  constructor(element, options = {}) {
    if (!element || element.nodeType !== 1) {
      throw new Error('The first argument is required and must be an element.');
    }

    this.element = element;
    this.$element = $(element);
    this.options = $.extend({}, DEFAULTS, $.isPlainObject(options) && options);
    this.action = '';
    this.target = null;
    this.timeout = null;
    this.index = 0;
    this.length = 0;
    this.ready = false;
    this.fading = false;
    this.fulled = false;
    this.isImg = false;
    this.played = false;
    this.playing = false;
    this.tooltiping = false;
    this.transitioning = false;
    this.viewed = false;
    this.visible = false;
    this.wheeling = false;
    this.pointers = {};
    this.init();
  }

  init() {
    const { $element, options } = this;
    const isImg = $element.is('img');
    const $images = isImg ? $element : $element.find('img');
    const { length } = $images;

    if (!length) {
      return;
    }

    // Override `transition` option if it is not supported
    if (isUndefined(document.createElement(NAMESPACE).style.transition)) {
      options.transition = false;
    }

    this.isImg = isImg;
    this.length = length;
    this.count = 0;
    this.$images = $images;
    this.$body = $('body');
    this.scrollbarWidth = window.innerWidth - document.body.clientWidth;

    if (options.inline) {
      $element.one(EVENT_READY, () => {
        this.view();
      });

      $images.each((i, image) => {
        if (image.complete) {
          this.progress();
        } else {
          $(image).one(EVENT_LOAD, $.proxy(this.progress, this));
        }
      });
    } else {
      $element.on(EVENT_CLICK, $.proxy(this.start, this));
    }
  }

  progress() {
    this.count += 1;

    if (this.count === this.length) {
      this.build();
    }
  }

  build() {
    const { $element, options } = this;

    if (this.ready) {
      return;
    }

    const $parent = $element.parent();
    const $viewer = $(TEMPLATE);
    const $button = $viewer.find(`.${NAMESPACE}-button`);
    const $navbar = $viewer.find(`.${NAMESPACE}-navbar`);
    const $title = $viewer.find(`.${NAMESPACE}-title`);
    const $toolbar = $viewer.find(`.${NAMESPACE}-toolbar`);

    this.$parent = $parent;
    this.$viewer = $viewer;
    this.$button = $button;
    this.$navbar = $navbar;
    this.$title = $title;
    this.$toolbar = $toolbar;
    this.$canvas = $viewer.find(`.${NAMESPACE}-canvas`);
    this.$footer = $viewer.find(`.${NAMESPACE}-footer`);
    this.$list = $viewer.find(`.${NAMESPACE}-list`);
    this.$player = $viewer.find(`.${NAMESPACE}-player`);
    this.$tooltip = $viewer.find(`.${NAMESPACE}-tooltip`);

    $title.addClass(!options.title ? CLASS_HIDE : getResponsiveClass(options.title));
    $toolbar.addClass(!options.toolbar ? CLASS_HIDE : getResponsiveClass(options.toolbar));
    $toolbar.find('li[class*=zoom]').toggleClass(CLASS_INVISIBLE, !options.zoomable);
    $toolbar.find('li[class*=flip]').toggleClass(CLASS_INVISIBLE, !options.scalable);

    if (!options.rotatable) {
      $toolbar.find('li[class*=rotate]').addClass(CLASS_INVISIBLE).appendTo($toolbar);
    }

    $navbar.addClass(!options.navbar ? CLASS_HIDE : getResponsiveClass(options.navbar));
    $button.toggleClass(CLASS_HIDE, !options.button);

    if (options.inline) {
      $button.addClass(CLASS_FULLSCREEN);
      $viewer.css('z-index', options.zIndexInline);

      if ($parent.css('position') === 'static') {
        $parent.css('position', 'relative');
      }

      $element.after($viewer);
    } else {
      $button.addClass(CLASS_CLOSE);
      $viewer
        .css('z-index', options.zIndex)
        .addClass([CLASS_FIXED, CLASS_FADE, CLASS_HIDE].join(' '))
        .appendTo('body');
    }

    if (options.inline) {
      this.render();
      this.bind();
      this.visible = true;
    }

    this.ready = true;

    if ($.isFunction(options.ready)) {
      $element.one(EVENT_READY, options.ready);
    }

    this.trigger(EVENT_READY);
  }

  unbuild() {
    if (!this.ready) {
      return;
    }

    this.ready = false;
    this.$viewer.remove();
  }

  /**
   * Change the default options.
   * @param {Object} options - The new default options.
   */
  static setDefaults(options) {
    $.extend(DEFAULTS, options);
  }
}

if ($.extend) {
  $.extend(Viewer.prototype, render, events, handlers, methods, others);
}

export default Viewer;
