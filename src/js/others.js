import $ from 'jquery';
import {
  ACTION_MOVE,
  ACTION_SWITCH,
  ACTION_ZOOM,
  CLASS_HIDE,
  CLASS_OPEN,
  EVENT_HIDDEN,
  EVENT_SHOWN,
} from './constants';
import {
  getMaxZoomRatio,
} from './utilities';

export default {
  // A shortcut for triggering custom events
  trigger(type, data) {
    const e = $.Event(type, data);

    this.$element.trigger(e);

    return e;
  },

  open() {
    this.$body.addClass(CLASS_OPEN).css('paddingRight', this.scrollbarWidth);
  },

  close() {
    this.$body.removeClass(CLASS_OPEN).css('padding-right', 0);
  },

  shown() {
    const { options } = this;

    this.transitioning = false;
    this.fulled = true;
    this.visible = true;
    this.render();
    this.bind();

    if ($.isFunction(options.shown)) {
      this.$element.one(EVENT_SHOWN, options.shown);
    }

    this.trigger(EVENT_SHOWN);
  },

  hidden() {
    const { options } = this;

    this.transitioning = false;
    this.viewed = false;
    this.fulled = false;
    this.visible = false;
    this.unbind();
    this.close();
    this.$viewer.addClass(CLASS_HIDE);
    this.resetList();
    this.resetImage();

    if ($.isFunction(options.hidden)) {
      this.$element.one(EVENT_HIDDEN, options.hidden);
    }

    this.trigger(EVENT_HIDDEN);
  },

  requestFullscreen() {
    const { document } = window;

    if (this.fulled && !document.fullscreenElement && !document.mozFullScreenElement &&
      !document.webkitFullscreenElement && !document.msFullscreenElement) {
      const { documentElement } = document;

      if (documentElement.requestFullscreen) {
        documentElement.requestFullscreen();
      } else if (documentElement.msRequestFullscreen) {
        documentElement.msRequestFullscreen();
      } else if (documentElement.mozRequestFullScreen) {
        documentElement.mozRequestFullScreen();
      } else if (documentElement.webkitRequestFullscreen) {
        documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      }
    }
  },

  exitFullscreen() {
    if (this.fulled) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  },

  change(event) {
    const { pointers } = this;
    const pointer = pointers[Object.keys(pointers)[0]];
    const offsetX = pointer.endX - pointer.startX;
    const offsetY = pointer.endY - pointer.startY;

    switch (this.action) {
      // Move the current image
      case ACTION_MOVE:
        this.move(offsetX, offsetY);
        break;

      // Zoom the current image
      case ACTION_ZOOM:
        this.zoom(getMaxZoomRatio(pointers), false, event);

        this.startX2 = this.endX2;
        this.startY2 = this.endY2;
        break;

      case ACTION_SWITCH:
        this.action = 'switched';

        if (Math.abs(offsetX) > Math.abs(offsetY)) {
          if (offsetX > 1) {
            this.prev();
          } else if (offsetX < -1) {
            this.next();
          }
        }

        break;

      default:
    }

    // Override
    $.each(pointers, (i, p) => {
      p.startX = p.endX;
      p.startY = p.endY;
    });
  },

  isSwitchable() {
    const { image, viewer } = this;

    return (image.left >= 0 && image.top >= 0 && image.width <= viewer.width &&
      image.height <= viewer.height);
  },
};
