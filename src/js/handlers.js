import $ from 'jquery';
import {
  ACTION_MOVE,
  ACTION_SWITCH,
  ACTION_ZOOM,
  CLASS_INVISIBLE,
  CLASS_MOVE,
  CLASS_TRANSITION,
  EVENT_LOAD,
  EVENT_VIEWED,
} from './constants';
import {
  getImageNaturalSizes,
  getPointer,
  objectKeys,
} from './utilities';

export default {
  click(e) {
    const $target = $(e.target);
    const action = $target.data('action');
    const { image } = this;

    switch (action) {
      case 'mix':
        if (this.played) {
          this.stop();
        } else if (this.options.inline) {
          if (this.fulled) {
            this.exit();
          } else {
            this.full();
          }
        } else {
          this.hide();
        }

        break;

      case 'view':
        this.view($target.data('index'));
        break;

      case 'zoom-in':
        this.zoom(0.1, true);
        break;

      case 'zoom-out':
        this.zoom(-0.1, true);
        break;

      case 'one-to-one':
        this.toggle();
        break;

      case 'reset':
        this.reset();
        break;

      case 'prev':
        this.prev();
        break;

      case 'play':
        this.play();
        break;

      case 'next':
        this.next();
        break;

      case 'rotate-left':
        this.rotate(-90);
        break;

      case 'rotate-right':
        this.rotate(90);
        break;

      case 'flip-horizontal':
        this.scaleX(-image.scaleX || -1);
        break;

      case 'flip-vertical':
        this.scaleY(-image.scaleY || -1);
        break;

      default:
        if (this.played) {
          this.stop();
        }
    }
  },

  dragstart(e) {
    if ($(e.target).is('img')) {
      e.preventDefault();
    }
  },

  keydown(e) {
    const { options } = this;

    if (!this.fulled || !options.keyboard) {
      return;
    }

    switch (e.which) {
      // (Key: Esc)
      case 27:
        if (this.played) {
          this.stop();
        } else if (options.inline) {
          if (this.fulled) {
            this.exit();
          }
        } else {
          this.hide();
        }

        break;

      // (Key: Space)
      case 32:
        if (this.played) {
          this.stop();
        }

        break;

      // View previous (Key: ←)
      case 37:
        this.prev();
        break;

      // Zoom in (Key: ↑)
      case 38:
        // Prevent scroll on Firefox
        e.preventDefault();

        this.zoom(options.zoomRatio, true);
        break;

      // View next (Key: →)
      case 39:
        this.next();
        break;

      // Zoom out (Key: ↓)
      case 40:
        // Prevent scroll on Firefox
        e.preventDefault();

        this.zoom(-options.zoomRatio, true);
        break;

      // 48: Zoom out to initial size (Key: Ctrl + 0)
      // 49: Zoom in to natural size (Key: Ctrl + 1)
      case 48:
      case 49:
        if (e.ctrlKey || e.shiftKey) {
          e.preventDefault();
          this.toggle();
        }

        break;

      default:
    }
  },

  load() {
    const { options, viewer, $image } = this;

    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = false;
    }

    if (!$image) {
      return;
    }

    $image.removeClass(CLASS_INVISIBLE).css(
      'cssText', (
        `${'width:0;' +
      'height:0;' +
      'margin-left:'}${viewer.width / 2}px;` +
      `margin-top:${viewer.height / 2}px;` +
      'max-width:none!important;' +
      'visibility:visible;'
      ),
    );

    this.initImage(() => {
      $image
        .toggleClass(CLASS_TRANSITION, options.transition)
        .toggleClass(CLASS_MOVE, options.movable);

      this.renderImage(() => {
        this.viewed = true;
        this.trigger(EVENT_VIEWED);
      });
    });
  },

  loadImage(e) {
    const image = e.target;
    const $image = $(image);
    const $parent = $image.parent();
    const parentWidth = $parent.width();
    const parentHeight = $parent.height();
    const filled = e.data && e.data.filled;

    getImageNaturalSizes(image, (naturalWidth, naturalHeight) => {
      const aspectRatio = naturalWidth / naturalHeight;
      let width = parentWidth;
      let height = parentHeight;

      if (parentHeight * aspectRatio > parentWidth) {
        if (filled) {
          width = parentHeight * aspectRatio;
        } else {
          height = parentWidth / aspectRatio;
        }
      } else if (filled) {
        height = parentWidth / aspectRatio;
      } else {
        width = parentHeight * aspectRatio;
      }

      $image.css({
        width,
        height,
        marginLeft: (parentWidth - width) / 2,
        marginTop: (parentHeight - height) / 2,
      });
    });
  },

  pointerdown(e) {
    if (!this.viewed || this.transitioning) {
      return;
    }

    const { options, pointers } = this;
    const { originalEvent } = e;

    if (originalEvent && originalEvent.changedTouches) {
      $.each(originalEvent.changedTouches, (i, touch) => {
        pointers[touch.identifier] = getPointer(touch);
      });
    } else {
      pointers[(originalEvent && originalEvent.pointerId) || 0] = getPointer(originalEvent || e);
    }

    let action = options.movable ? ACTION_MOVE : false;

    if (objectKeys(pointers).length > 1) {
      action = ACTION_ZOOM;
    } else if ((e.pointerType === 'touch' || e.type === 'touchstart') && this.isSwitchable()) {
      action = ACTION_SWITCH;
    }

    this.action = action;
  },

  pointermove(e) {
    const {
      $image,
      action,
      pointers,
    } = this;

    if (!this.viewed || !action) {
      return;
    }

    e.preventDefault();

    const { originalEvent } = e;

    if (originalEvent && originalEvent.changedTouches) {
      $.each(originalEvent.changedTouches, (i, touch) => {
        $.extend(pointers[touch.identifier], getPointer(touch, true));
      });
    } else {
      $.extend(
        pointers[(originalEvent && originalEvent.pointerId) || 0],
        getPointer(e, true),
      );
    }

    if (action === ACTION_MOVE && this.options.transition && $image.hasClass(CLASS_TRANSITION)) {
      $image.removeClass(CLASS_TRANSITION);
    }

    this.change(e);
  },

  pointerup(e) {
    const { action, pointers } = this;
    const { originalEvent } = e;

    if (originalEvent && originalEvent.changedTouches) {
      $.each(originalEvent.changedTouches, (i, touch) => {
        delete pointers[touch.identifier];
      });
    } else {
      delete pointers[(originalEvent && originalEvent.pointerId) || 0];
    }

    if (!action) {
      return;
    }

    if (action === ACTION_MOVE && this.options.transition) {
      this.$image.addClass(CLASS_TRANSITION);
    }

    this.action = false;
  },

  resize() {
    this.initContainer();
    this.initViewer();
    this.renderViewer();
    this.renderList();

    if (this.viewed) {
      this.initImage(() => {
        this.renderImage();
      });
    }

    if (this.played) {
      if (this.options.fullscreen && this.fulled &&
        !document.fullscreenElement &&
        !document.mozFullScreenElement &&
        !document.webkitFullscreenElement &&
        !document.msFullscreenElement) {
        this.stop();
        return;
      }

      this.$player
        .find('img')
        .one(EVENT_LOAD, $.proxy(this.loadImage, this))
        .trigger(EVENT_LOAD);
    }
  },

  start({ target }) {
    if ($(target).is('img')) {
      this.target = target;
      this.show();
    }
  },

  wheel(e) {
    if (!this.viewed) {
      return;
    }

    e.preventDefault();

    // Limit wheel speed to prevent zoom too fast
    if (this.wheeling) {
      return;
    }

    this.wheeling = true;

    setTimeout(() => {
      this.wheeling = false;
    }, 50);

    const originalEvent = e.originalEvent || e;
    let delta = 1;

    if (originalEvent.deltaY) {
      delta = originalEvent.deltaY > 0 ? 1 : -1;
    } else if (originalEvent.wheelDelta) {
      delta = -originalEvent.wheelDelta / 120;
    } else if (originalEvent.detail) {
      delta = originalEvent.detail > 0 ? 1 : -1;
    }

    this.zoom(-delta * (Number(this.options.zoomRatio) || 0.1), true, e);
  },
};
