import $ from 'jquery';
import {
  EVENT_CLICK,
  EVENT_DRAG_START,
  EVENT_KEY_DOWN,
  EVENT_POINTER_DOWN,
  EVENT_POINTER_MOVE,
  EVENT_POINTER_UP,
  EVENT_RESIZE,
  EVENT_VIEW,
  EVENT_VIEWED,
  EVENT_WHEEL,
} from './constants';
import {
  proxy,
} from './utilities';

export default {
  bind() {
    const { $element, options } = this;

    if ($.isFunction(options.view)) {
      $element.on(EVENT_VIEW, options.view);
    }

    if ($.isFunction(options.viewed)) {
      $element.on(EVENT_VIEWED, options.viewed);
    }

    this.$viewer
      .on(EVENT_CLICK, $.proxy(this.click, this))
      .on(EVENT_WHEEL, $.proxy(this.wheel, this))
      .on(EVENT_DRAG_START, $.proxy(this.dragstart, this));

    this.$canvas.on(EVENT_POINTER_DOWN, $.proxy(this.pointerdown, this));

    $(this.element.ownerDocument)
      .on(EVENT_POINTER_MOVE, (this.onPointerMove = proxy(this.pointermove, this)))
      .on(EVENT_POINTER_UP, (this.onPointerUp = proxy(this.pointerup, this)))
      .on(EVENT_KEY_DOWN, (this.onKeyDown = proxy(this.keydown, this)));

    $(window).on(EVENT_RESIZE, (this.onResize = proxy(this.resize, this)));
  },

  unbind() {
    const { $element, options } = this;

    if ($.isFunction(options.view)) {
      $element.off(EVENT_VIEW, options.view);
    }

    if ($.isFunction(options.viewed)) {
      $element.off(EVENT_VIEWED, options.viewed);
    }

    this.$viewer
      .off(EVENT_CLICK, this.click)
      .off(EVENT_WHEEL, this.wheel)
      .off(EVENT_DRAG_START, this.dragstart);

    this.$canvas.off(EVENT_POINTER_DOWN, this.pointerdown);

    $(this.element.ownerDocument)
      .off(EVENT_POINTER_MOVE, this.onPointerMove)
      .off(EVENT_POINTER_UP, this.onPointerUp)
      .off(EVENT_KEY_DOWN, this.onKeyDown);

    $(window).off(EVENT_RESIZE, this.onResize);
  },
};
