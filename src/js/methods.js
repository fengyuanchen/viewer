import $ from 'jquery';
import {
  CLASS_ACTIVE,
  CLASS_FADE,
  CLASS_FIXED,
  CLASS_FULLSCREEN_EXIT,
  CLASS_HIDE,
  CLASS_IN,
  CLASS_INVISIBLE,
  CLASS_OPEN,
  CLASS_SHOW,
  CLASS_TRANSITION,
  EVENT_CLICK,
  EVENT_HIDE,
  EVENT_LOAD,
  EVENT_SHOW,
  EVENT_SHOWN,
  EVENT_TRANSITION_END,
  EVENT_VIEW,
  EVENT_VIEWED,
  NAMESPACE,
} from './constants';
import {
  getPointersCenter,
  isNumber,
  isUndefined,
  objectKeys,
} from './utilities';

export default {
  /**
   * Show the viewer (only available in modal mode).
   */
  show() {
    const { $element, options } = this;

    if (options.inline || this.transitioning || this.visible) {
      return;
    }

    if (!this.ready) {
      this.build();
    }

    const { $viewer } = this;

    if ($.isFunction(options.show)) {
      $element.one(EVENT_SHOW, options.show);
    }

    if (this.trigger(EVENT_SHOW).isDefaultPrevented()) {
      return;
    }

    this.open();
    $viewer.removeClass(CLASS_HIDE);
    $element.one(EVENT_SHOWN, () => {
      this.view(this.target ? this.$images.index(this.target) : this.index);
      this.target = false;
    });

    if (options.transition) {
      this.transitioning = true;
      $viewer.addClass(CLASS_TRANSITION);

      // Force reflow to enable CSS3 transition
      // eslint-disable-next-line
      $viewer[0].offsetWidth;
      $viewer.one(EVENT_TRANSITION_END, $.proxy(this.shown, this)).addClass(CLASS_IN);
    } else {
      $viewer.addClass(CLASS_IN);
      this.shown();
    }
  },

  /**
   * Hide the viewer (only available in modal mode).
   */
  hide() {
    const { options, $viewer } = this;

    if (options.inline || this.transitioning || !this.visible) {
      return;
    }

    if ($.isFunction(options.hide)) {
      this.$element.one(EVENT_HIDE, options.hide);
    }

    if (this.trigger(EVENT_HIDE).isDefaultPrevented()) {
      return;
    }

    if (this.viewed && options.transition) {
      this.transitioning = true;
      this.$image.one(EVENT_TRANSITION_END, () => {
        $viewer.one(EVENT_TRANSITION_END, $.proxy(this.hidden, this)).removeClass(CLASS_IN);
      });
      this.zoomTo(0, false, false, true);
    } else {
      $viewer.removeClass(CLASS_IN);
      this.hidden();
    }
  },

  /**
   * View one of the images with image's index.
   * @param {number} index - The image index.
   */
  view(index) {
    index = Number(index) || 0;

    if (!this.visible || this.played || index < 0 || index >= this.length ||
      (this.viewed && index === this.index)) {
      return;
    }

    if (this.trigger(EVENT_VIEW).isDefaultPrevented()) {
      return;
    }

    const $item = this.$items.eq(index);
    const $img = $item.find('img');
    const alt = $img.attr('alt');
    const $image = $(`<img src="${$img.data('originalUrl')}" alt="${alt}">`);

    this.$image = $image;
    this.$items.eq(this.index).removeClass(CLASS_ACTIVE);
    $item.addClass(CLASS_ACTIVE);
    this.viewed = false;
    this.index = index;
    this.image = null;
    this.$canvas.html($image.addClass(CLASS_INVISIBLE));

    // Center current item
    this.renderList();

    const { $title } = this;

    // Clear title
    $title.empty();

    // Generate title after viewed
    this.$element.one(EVENT_VIEWED, () => {
      const { naturalWidth, naturalHeight } = this.image;

      $title.html(`${alt} (${naturalWidth} &times; ${naturalHeight})`);
    });

    if ($image[0].complete) {
      this.load();
    } else {
      $image.one(EVENT_LOAD, $.proxy(this.load, this));

      if (this.timeout) {
        clearTimeout(this.timeout);
      }

      // Make the image visible if it fails to load within 1s
      this.timeout = setTimeout(() => {
        $image.removeClass(CLASS_INVISIBLE);
        this.timeout = false;
      }, 1000);
    }
  },

  /**
   * View the previous image.
   */
  prev() {
    this.view(Math.max(this.index - 1, 0));
  },

  /**
   * View the next image.
   */
  next() {
    this.view(Math.min(this.index + 1, this.length - 1));
  },

  /**
   * Move the image with relative offsets.
   * @param {number} offsetX - The relative offset distance on the x-axis.
   * @param {number} offsetY - The relative offset distance on the y-axis.
   */
  move(offsetX, offsetY) {
    const { left, top } = this.image;

    this.moveTo(
      isUndefined(offsetX) ? offsetX : left + Number(offsetX),
      isUndefined(offsetY) ? offsetY : top + Number(offsetY),
    );
  },

  /**
   * Move the image to an absolute point.
   * @param {number} x - The x-axis coordinate.
   * @param {number} [y=x] - The y-axis coordinate.
   */
  moveTo(x, y = x) {
    if (!this.viewed || this.played || !this.options.movable) {
      return;
    }

    const { image } = this;
    let changed = false;

    x = Number(x);
    y = Number(y);

    if (isNumber(x)) {
      image.left = x;
      changed = true;
    }

    if (isNumber(y)) {
      image.top = y;
      changed = true;
    }

    if (changed) {
      this.renderImage();
    }
  },

  /**
   * Zoom the image with a relative ratio.
   * @param {number} ratio - The target ratio.
   * @param {boolean} [hasTooltip=false] - Indicates if it has a tooltip or not.
   * @param {Event} [_event=null] - The related event if any.
   */
  zoom(ratio, hasTooltip = false, _event = null) {
    const { image } = this;

    ratio = Number(ratio);

    if (ratio < 0) {
      ratio = 1 / (1 - ratio);
    } else {
      ratio = 1 + ratio;
    }

    this.zoomTo((image.width * ratio) / image.naturalWidth, hasTooltip, _event);
  },

  /**
   * Zoom the image to an absolute ratio.
   * @param {number} ratio - The target ratio.
   * @param {boolean} [hasTooltip=false] - Indicates if it has a tooltip or not.
   * @param {Event} [_event=null] - The related event if any.
   * @param {Event} [_zoomable=false] - Indicates if the current zoom is available or not.
   */
  zoomTo(ratio, hasTooltip = false, _event = null, _zoomable = false) {
    const { options, image, pointers } = this;

    ratio = Math.max(0, ratio);

    if (isNumber(ratio) && this.viewed && !this.played && (_zoomable || options.zoomable)) {
      if (!_zoomable) {
        const minZoomRatio = Math.max(0.01, options.minZoomRatio);
        const maxZoomRatio = Math.min(100, options.maxZoomRatio);

        ratio = Math.min(Math.max(ratio, minZoomRatio), maxZoomRatio);
      }

      if (_event && ratio > 0.95 && ratio < 1.05) {
        ratio = 1;
      }

      const newWidth = image.naturalWidth * ratio;
      const newHeight = image.naturalHeight * ratio;

      if (_event && _event.originalEvent) {
        const offset = this.$viewer.offset();
        const center = pointers && objectKeys(pointers).length > 0 ? getPointersCenter(pointers) : {
          pageX: _event.pageX || _event.originalEvent.pageX || 0,
          pageY: _event.pageY || _event.originalEvent.pageY || 0,
        };

        // Zoom from the triggering point of the event
        image.left -= (newWidth - image.width) * (
          ((center.pageX - offset.left) - image.left) / image.width
        );
        image.top -= (newHeight - image.height) * (
          ((center.pageY - offset.top) - image.top) / image.height
        );
      } else {
        // Zoom from the center of the image
        image.left -= (newWidth - image.width) / 2;
        image.top -= (newHeight - image.height) / 2;
      }

      image.width = newWidth;
      image.height = newHeight;
      image.ratio = ratio;
      this.renderImage();

      if (hasTooltip) {
        this.tooltip();
      }
    }
  },

  /**
   * Rotate the image with a relative degree.
   * @param {number} degree - The rotate degree.
   */
  rotate(degree) {
    this.rotateTo((this.image.rotate || 0) + Number(degree));
  },

  /**
   * Rotate the image to an absolute degree.
   * @param {number} degree - The rotate degree.
   */
  rotateTo(degree) {
    const { image } = this;

    degree = Number(degree);

    if (isNumber(degree) && this.viewed && !this.played && this.options.rotatable) {
      image.rotate = degree;
      this.renderImage();
    }
  },

  /**
   * Scale the image on the x-axis.
   * @param {number} scaleX - The scale ratio on the x-axis.
   */
  scaleX(scaleX) {
    this.scale(scaleX, this.image.scaleY);
  },

  /**
   * Scale the image on the y-axis.
   * @param {number} scaleY - The scale ratio on the y-axis.
   */
  scaleY(scaleY) {
    this.scale(this.image.scaleX, scaleY);
  },

  /**
   * Scale the image.
   * @param {number} scaleX - The scale ratio on the x-axis.
   * @param {number} [scaleY=scaleX] - The scale ratio on the y-axis.
   */
  scale(scaleX, scaleY = scaleX) {
    if (!this.viewed || this.played || !this.options.scalable) {
      return;
    }

    const { image } = this;
    let changed = false;

    scaleX = Number(scaleX);
    scaleY = Number(scaleY);

    if (isNumber(scaleX)) {
      image.scaleX = scaleX;
      changed = true;
    }

    if (isNumber(scaleY)) {
      image.scaleY = scaleY;
      changed = true;
    }

    if (changed) {
      this.renderImage();
    }
  },

  /**
   * Play the images.
   */
  play() {
    if (!this.visible || this.played) {
      return;
    }

    const { options, $items, $player } = this;

    if (options.fullscreen) {
      this.requestFullscreen();
    }

    this.played = true;
    $player.addClass(CLASS_SHOW);

    const list = [];
    let index = 0;

    $items.each((i, item) => {
      const $item = $(item);
      const $img = $item.find('img');
      const $image = $(`<img src="${$img.data('originalUrl')}" alt="${$img.attr('alt')}">`);

      $image.addClass(CLASS_FADE).toggleClass(CLASS_TRANSITION, options.transition);

      if ($item.hasClass(CLASS_ACTIVE)) {
        $image.addClass(CLASS_IN);
        index = i;
      }

      list.push($image);
      $image.one(EVENT_LOAD, {
        filled: false,
      }, $.proxy(this.loadImage, this));
      $player.append($image);
    });

    if (isNumber(options.interval) && options.interval > 0) {
      const { length } = $items;
      const playing = () => {
        this.playing = setTimeout(() => {
          list[index].removeClass(CLASS_IN);
          index += 1;
          index = index < length ? index : 0;
          list[index].addClass(CLASS_IN);
          playing();
        }, options.interval);
      };

      if (length > 1) {
        playing();
      }
    }
  },

  /**
   * Stop play.
   */
  stop() {
    if (!this.played) {
      return;
    }

    if (this.options.fullscreen) {
      this.exitFullscreen();
    }

    this.played = false;
    clearTimeout(this.playing);
    this.$player.removeClass(CLASS_SHOW).empty();
  },

  /**
   * Enter modal mode (only available in inline mode).
   */
  full() {
    const { options, $image, $list } = this;

    if (!this.visible || this.played || this.fulled || !options.inline) {
      return;
    }

    this.fulled = true;
    this.open();
    this.$button.addClass(CLASS_FULLSCREEN_EXIT);

    if (options.transition) {
      $image.removeClass(CLASS_TRANSITION);
      $list.removeClass(CLASS_TRANSITION);
    }

    this.$viewer.addClass(CLASS_FIXED).removeAttr('style').css('z-index', options.zIndex);
    this.initContainer();
    this.viewer = $.extend({}, this.container);
    this.renderList();
    this.initImage(() => {
      this.renderImage(() => {
        if (options.transition) {
          setTimeout(() => {
            $image.addClass(CLASS_TRANSITION);
            $list.addClass(CLASS_TRANSITION);
          }, 0);
        }
      });
    });
  },

  /**
   * Exit modal mode (only available in inline mode).
   */
  exit() {
    if (!this.fulled) {
      return;
    }

    const { options, $image, $list } = this;

    this.fulled = false;
    this.close();
    this.$button.removeClass(CLASS_FULLSCREEN_EXIT);

    if (options.transition) {
      $image.removeClass(CLASS_TRANSITION);
      $list.removeClass(CLASS_TRANSITION);
    }

    this.$viewer.removeClass(CLASS_FIXED).css('z-index', options.zIndexInline);
    this.viewer = $.extend({}, this.parent);
    this.renderViewer();
    this.renderList();
    this.initImage(() => {
      this.renderImage(() => {
        if (options.transition) {
          setTimeout(() => {
            $image.addClass(CLASS_TRANSITION);
            $list.addClass(CLASS_TRANSITION);
          }, 0);
        }
      });
    });
  },

  /**
   * Show the current ratio of the image with percentage.
   */
  tooltip() {
    const { options, $tooltip, image } = this;
    const classes = [
      CLASS_SHOW,
      CLASS_FADE,
      CLASS_TRANSITION,
    ].join(' ');

    if (!this.viewed || this.played || !options.tooltip) {
      return;
    }

    $tooltip.text(`${Math.round(image.ratio * 100)}%`);

    if (!this.tooltiping) {
      if (options.transition) {
        if (this.fading) {
          $tooltip.trigger(EVENT_TRANSITION_END);
        }

        $tooltip.addClass(classes);

        // Force reflow to enable CSS3 transition
        // eslint-disable-next-line
        $tooltip[0].offsetWidth;
        $tooltip.addClass(CLASS_IN);
      } else {
        $tooltip.addClass(CLASS_SHOW);
      }
    } else {
      clearTimeout(this.tooltiping);
    }

    this.tooltiping = setTimeout(() => {
      if (options.transition) {
        $tooltip.one(EVENT_TRANSITION_END, () => {
          $tooltip.removeClass(classes);
          this.fading = false;
        }).removeClass(CLASS_IN);

        this.fading = true;
      } else {
        $tooltip.removeClass(CLASS_SHOW);
      }

      this.tooltiping = false;
    }, 1000);
  },

  /**
   * Toggle the image size between its natural size and initial size.
   */
  toggle() {
    if (this.image.ratio === 1) {
      this.zoomTo(this.initialImage.ratio, true);
    } else {
      this.zoomTo(1, true);
    }
  },

  /**
   * Reset the image to its initial state.
   */
  reset() {
    if (this.viewed && !this.played) {
      this.image = $.extend({}, this.initialImage);
      this.renderImage();
    }
  },

  /**
   * Update viewer when images changed.
   */
  update() {
    const { $element } = this;
    let { $images } = this;

    if (this.isImg) {
      // Destroy viewer if the target image was deleted
      if (!$element.parent().length) {
        this.destroy();
        return;
      }
    } else {
      $images = $element.find('img');
      this.$images = $images;
      this.length = $images.length;
    }

    if (this.ready) {
      const indexes = [];
      let index;

      $.each(this.$items, (i, item) => {
        const img = $(item).find('img')[0];
        const image = $images[i];

        if (image) {
          if (image.src !== img.src) {
            indexes.push(i);
          }
        } else {
          indexes.push(i);
        }
      });

      this.$list.width('auto');
      this.initList();

      if (this.visible) {
        if (this.length) {
          if (this.viewed) {
            index = $.inArray(this.index, indexes);

            if (index >= 0) {
              this.viewed = false;
              this.view(Math.max(this.index - (index + 1), 0));
            } else {
              this.$items.eq(this.index).addClass(CLASS_ACTIVE);
            }
          }
        } else {
          this.$image = null;
          this.viewed = false;
          this.index = 0;
          this.image = null;
          this.$canvas.empty();
          this.$title.empty();
        }
      }
    }
  },

  /**
   * Destroy the viewer instance.
   */
  destroy() {
    const { $element } = this;

    if (this.options.inline) {
      this.unbind();
    } else {
      if (this.visible) {
        this.unbind();
      }

      $element.off(EVENT_CLICK, this.start);
    }

    this.unbuild();
    $element.removeData(NAMESPACE);
  },
};
