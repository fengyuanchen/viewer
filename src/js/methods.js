    // Show the viewer (only available in modal mode)
    show: function () {
      var options = this.options;
      var $viewer;

      if (options.inline || this.transitioning) {
        return;
      }

      if (!this.isBuilt) {
        this.build();
      }

      if ($.isFunction(options.show)) {
        this.$element.one(EVENT_SHOW, options.show);
      }

      if (this.trigger(EVENT_SHOW).isDefaultPrevented()) {
        return;
      }

      this.$body.addClass(CLASS_OPEN);
      $viewer = this.$viewer.removeClass(CLASS_HIDE);

      this.$element.one(EVENT_SHOWN, $.proxy(function () {
        this.view(this.target ? this.$images.index(this.target) : this.index);
        this.target = false;
      }, this));

      if (options.transition) {
        this.transitioning = true;
        $viewer.addClass(CLASS_TRANSITION);
        forceReflow($viewer[0]);
        $viewer.one(EVENT_TRANSITIONEND, $.proxy(this.shown, this)).addClass(CLASS_IN);
      } else {
        $viewer.addClass(CLASS_IN);
        this.shown();
      }
    },

    // Hide the viewer (only available in modal mode)
    hide: function () {
      var options = this.options;
      var $viewer = this.$viewer;

      if (options.inline || this.transitioning || !this.isShown) {
        return;
      }

      if ($.isFunction(options.hide)) {
        this.$element.one(EVENT_HIDE, options.hide);
      }

      if (this.trigger(EVENT_HIDE).isDefaultPrevented()) {
        return;
      }

      if (this.isViewed && options.transition) {
        this.transitioning = true;
        this.$image.one(EVENT_TRANSITIONEND, $.proxy(function () {
          $viewer.one(EVENT_TRANSITIONEND, $.proxy(this.hidden, this)).removeClass(CLASS_IN);
        }, this));
        this.zoomTo(0, false, false, true);
      } else {
        $viewer.removeClass(CLASS_IN);
        this.hidden();
      }
    },

    /**
     * View one of the images with image's index
     *
     * @param {Number} index
     */
    view: function (index) {
      var $title = this.$title;
      var $image;
      var $item;
      var $img;
      var url;
      var alt;

      index = Number(index) || 0;

      if (!this.isShown || this.isPlayed || index < 0 || index >= this.length ||
        this.isViewed && index === this.index) {
        return;
      }

      if (this.trigger(EVENT_VIEW).isDefaultPrevented()) {
        return;
      }

      $item = this.$items.eq(index);
      $img = $item.find(SELECTOR_IMG);
      url = $img.data('originalUrl');
      alt = $img.attr('alt');

      this.$image = $image = $('<img src="' + url + '" alt="' + alt + '">');

      if (this.isViewed) {
        this.$items.eq(this.index).removeClass(CLASS_ACTIVE);
      }

      $item.addClass(CLASS_ACTIVE);

      this.isViewed = false;
      this.index = index;
      this.image = null;
      this.$canvas.html($image.addClass(CLASS_INVISIBLE));

      // Center current item
      this.renderList();

      // Clear title
      $title.empty();

      // Generate title after viewed
      this.$element.one(EVENT_VIEWED, $.proxy(function () {
        var image = this.image;
        var width = image.naturalWidth;
        var height = image.naturalHeight;

        $title.html(alt + ' (' + width + ' &times; ' + height + ')');
      }, this));

      if ($image[0].complete) {
        this.load();
      } else {
        $image.one(EVENT_LOAD, $.proxy(this.load, this));

        if (this.timeout) {
          clearTimeout(this.timeout);
        }

        // Make the image visible if it fails to load within 1s
        this.timeout = setTimeout($.proxy(function () {
          $image.removeClass(CLASS_INVISIBLE);
          this.timeout = false;
        }, this), 1000);
      }
    },

    // View the previous image
    prev: function () {
      this.view(max(this.index - 1, 0));
    },

    // View the next image
    next: function () {
      this.view(min(this.index + 1, this.length - 1));
    },

    /**
     * Move the image with relative offsets
     *
     * @param {Number} offsetX
     * @param {Number} offsetY (optional)
     */
    move: function (offsetX, offsetY) {
      var image = this.image;

      this.moveTo(
        isUndefined(offsetX) ? offsetX : image.left + num(offsetX),
        isUndefined(offsetY) ? offsetY : image.top + num(offsetY)
      );
    },

    /**
     * Move the image to an absolute point
     *
     * @param {Number} x
     * @param {Number} y (optional)
     */
    moveTo: function (x, y) {
      var image = this.image;
      var changed = false;

      // If "y" is not present, its default value is "x"
      if (isUndefined(y)) {
        y = x;
      }

      x = num(x);
      y = num(y);

      if (this.isViewed && !this.isPlayed && this.options.movable) {
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
      }
    },

    /**
     * Zoom the image with a relative ratio
     *
     * @param {Number} ratio
     * @param {Boolean} hasTooltip (optional)
     * @param {jQuery Event} _event (private)
     */
    zoom: function (ratio, hasTooltip, _event) {
      var image = this.image;

      ratio = num(ratio);

      if (ratio < 0) {
        ratio =  1 / (1 - ratio);
      } else {
        ratio = 1 + ratio;
      }

      this.zoomTo(image.width * ratio / image.naturalWidth, hasTooltip, _event);
    },

    /**
     * Zoom the image to an absolute ratio
     *
     * @param {Number} ratio
     * @param {Boolean} hasTooltip (optional)
     * @param {jQuery Event} _event (private)
     * @param {Boolean} _zoomable (private)
     */
    zoomTo: function (ratio, hasTooltip, _event, _zoomable) {
      var options = this.options;
      var minZoomRatio = 0.01;
      var maxZoomRatio = 100;
      var image = this.image;
      var width = image.width;
      var height = image.height;
      var originalEvent;
      var newWidth;
      var newHeight;
      var offset;
      var center;

      ratio = max(0, ratio);

      if (isNumber(ratio) && this.isViewed && !this.isPlayed && (_zoomable || options.zoomable)) {
        if (!_zoomable) {
          minZoomRatio = max(minZoomRatio, options.minZoomRatio);
          maxZoomRatio = min(maxZoomRatio, options.maxZoomRatio);
          ratio = min(max(ratio, minZoomRatio), maxZoomRatio);
        }

        if (ratio > 0.95 && ratio < 1.05) {
          ratio = 1;
        }

        newWidth = image.naturalWidth * ratio;
        newHeight = image.naturalHeight * ratio;

        if (_event && (originalEvent = _event.originalEvent)) {
          offset = this.$viewer.offset();
          center = originalEvent.touches ? getTouchesCenter(originalEvent.touches) : {
            pageX: _event.pageX || originalEvent.pageX || 0,
            pageY: _event.pageY || originalEvent.pageY || 0
          };

          // Zoom from the triggering point of the event
          image.left -= (newWidth - width) * (
            ((center.pageX - offset.left) - image.left) / width
          );
          image.top -= (newHeight - height) * (
            ((center.pageY - offset.top) - image.top) / height
          );
        } else {

          // Zoom from the center of the image
          image.left -= (newWidth - width) / 2;
          image.top -= (newHeight - height) / 2;
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
     * Rotate the image with a relative degree
     *
     * @param {Number} degree
     */
    rotate: function (degree) {
      this.rotateTo((this.image.rotate || 0) + num(degree));
    },

    /**
     * Rotate the image to an absolute degree
     * https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function#rotate()
     *
     * @param {Number} degree
     */
    rotateTo: function (degree) {
      var image = this.image;

      degree = num(degree);

      if (isNumber(degree) && this.isViewed && !this.isPlayed && this.options.rotatable) {
        image.rotate = degree;
        this.renderImage();
      }
    },

    /**
     * Scale the image
     * https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function#scale()
     *
     * @param {Number} scaleX
     * @param {Number} scaleY (optional)
     */
    scale: function (scaleX, scaleY) {
      var image = this.image;
      var changed = false;

      // If "scaleY" is not present, its default value is "scaleX"
      if (isUndefined(scaleY)) {
        scaleY = scaleX;
      }

      scaleX = num(scaleX);
      scaleY = num(scaleY);

      if (this.isViewed && !this.isPlayed && this.options.scalable) {
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
      }
    },

    /**
     * Scale the abscissa of the image
     *
     * @param {Number} scaleX
     */
    scaleX: function (scaleX) {
      this.scale(scaleX, this.image.scaleY);
    },

    /**
     * Scale the ordinate of the image
     *
     * @param {Number} scaleY
     */
    scaleY: function (scaleY) {
      this.scale(this.image.scaleX, scaleY);
    },

    // Play the images
    play: function () {
      var options = this.options;
      var $player = this.$player;
      var load = $.proxy(this.loadImage, this);
      var list = [];
      var total = 0;
      var index = 0;
      var playing;

      if (!this.isShown || this.isPlayed) {
        return;
      }

      if (options.fullscreen) {
        this.requestFullscreen();
      }

      this.isPlayed = true;
      $player.addClass(CLASS_SHOW);

      this.$items.each(function (i) {
        var $this = $(this);
        var $img = $this.find(SELECTOR_IMG);
        var $image = $('<img src="' + $img.data('originalUrl') + '" alt="' + $img.attr('alt') + '">');

        total++;

        $image.addClass(CLASS_FADE).toggleClass(CLASS_TRANSITION, options.transition);

        if ($this.hasClass(CLASS_ACTIVE)) {
          $image.addClass(CLASS_IN);
          index = i;
        }

        list.push($image);
        $image.one(EVENT_LOAD, {
          filled: false
        }, load);
        $player.append($image);
      });

      if (isNumber(options.interval) && options.interval > 0) {
        playing = $.proxy(function () {
          this.playing = setTimeout(function () {
            list[index].removeClass(CLASS_IN);
            index++;
            index = index < total ? index : 0;
            list[index].addClass(CLASS_IN);

            playing();
          }, options.interval);
        }, this);

        if (total > 1) {
          playing();
        }
      }
    },

    // Stop play
    stop: function () {
      if (!this.isPlayed) {
        return;
      }

      if (this.options.fullscreen) {
        this.exitFullscreen();
      }

      this.isPlayed = false;
      clearTimeout(this.playing);
      this.$player.removeClass(CLASS_SHOW).empty();
    },

    // Enter modal mode (only available in inline mode)
    full: function () {
      var options = this.options;
      var $image = this.$image;
      var $list = this.$list;

      if (!this.isShown || this.isPlayed || this.isFulled || !options.inline) {
        return;
      }

      this.isFulled = true;
      this.$body.addClass(CLASS_OPEN);
      this.$button.addClass(CLASS_FULLSCREEN_EXIT);

      if (options.transition) {
        $image.removeClass(CLASS_TRANSITION);
        $list.removeClass(CLASS_TRANSITION);
      }

      this.$viewer.addClass(CLASS_FIXED).removeAttr('style').css('z-index', options.zIndex);
      this.initContainer();
      this.viewer = $.extend({}, this.container);
      this.renderList();
      this.initImage($.proxy(function () {
        this.renderImage(function () {
          if (options.transition) {
            setTimeout(function () {
              $image.addClass(CLASS_TRANSITION);
              $list.addClass(CLASS_TRANSITION);
            }, 0);
          }
        });
      }, this));
    },

    // Exit modal mode (only available in inline mode)
    exit: function () {
      var options = this.options;
      var $image = this.$image;
      var $list = this.$list;

      if (!this.isFulled) {
        return;
      }

      this.isFulled = false;
      this.$body.removeClass(CLASS_OPEN);
      this.$button.removeClass(CLASS_FULLSCREEN_EXIT);

      if (options.transition) {
        $image.removeClass(CLASS_TRANSITION);
        $list.removeClass(CLASS_TRANSITION);
      }

      this.$viewer.removeClass(CLASS_FIXED).css('z-index', options.zIndexInline);
      this.viewer = $.extend({}, this.parent);
      this.renderViewer();
      this.renderList();
      this.initImage($.proxy(function () {
        this.renderImage(function () {
          if (options.transition) {
            setTimeout(function () {
              $image.addClass(CLASS_TRANSITION);
              $list.addClass(CLASS_TRANSITION);
            }, 0);
          }
        });
      }, this));
    },

    // Show the current ratio of the image with percentage
    tooltip: function () {
      var options = this.options;
      var $tooltip = this.$tooltip;
      var image = this.image;
      var classes = [
            CLASS_SHOW,
            CLASS_FADE,
            CLASS_TRANSITION
          ].join(' ');

      if (!this.isViewed || this.isPlayed || !options.tooltip) {
        return;
      }

      $tooltip.text(round(image.ratio * 100) + '%');

      if (!this.tooltiping) {
        if (options.transition) {
          if (this.fading) {
            $tooltip.trigger(EVENT_TRANSITIONEND);
          }

          $tooltip.addClass(classes);
          forceReflow($tooltip[0]);
          $tooltip.addClass(CLASS_IN);
        } else {
          $tooltip.addClass(CLASS_SHOW);
        }
      } else {
        clearTimeout(this.tooltiping);
      }

      this.tooltiping = setTimeout($.proxy(function () {
        if (options.transition) {
          $tooltip.one(EVENT_TRANSITIONEND, $.proxy(function () {
            $tooltip.removeClass(classes);
            this.fading = false;
          }, this)).removeClass(CLASS_IN);

          this.fading = true;
        } else {
          $tooltip.removeClass(CLASS_SHOW);
        }

        this.tooltiping = false;
      }, this), 1000);
    },

    // Toggle the image size between its natural size and initial size
    toggle: function () {
      if (this.image.ratio === 1) {
        this.zoomTo(this.initialImage.ratio, true);
      } else {
        this.zoomTo(1, true);
      }
    },

    // Reset the image to its initial state
    reset: function () {
      if (this.isViewed && !this.isPlayed) {
        this.image = $.extend({}, this.initialImage);
        this.renderImage();
      }
    },

    // Update viewer when images changed
    update: function () {
      var $this = this.$element;
      var $images = this.$images;
      var indexes = [];
      var index;

      if (this.isImg) {

        // Destroy viewer if the target image was deleted
        if (!$this.parent().length) {
          return this.destroy();
        }
      } else {
        this.$images = $images = $this.find(SELECTOR_IMG);
        this.length = $images.length;
      }

      if (this.isBuilt) {
        $.each(this.$items, function (i) {
          var img = $(this).find('img')[0];
          var image = $images[i];

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

        if (this.isShown) {
          if (this.length) {
            if (this.isViewed) {
              index = $.inArray(this.index, indexes);

              if (index >= 0) {
                this.isViewed = false;
                this.view(max(this.index - (index + 1), 0));
              } else {
                this.$items.eq(this.index).addClass(CLASS_ACTIVE);
              }
            }
          } else {
            this.$image = null;
            this.isViewed = false;
            this.index = 0;
            this.image = null;
            this.$canvas.empty();
            this.$title.empty();
          }
        }
      }
    },

    // Destroy the viewer
    destroy: function () {
      var $this = this.$element;

      if (this.options.inline) {
        this.unbind();
      } else {
        if (this.isShown) {
          this.unbind();
        }

        $this.off(EVENT_CLICK, this.start);
      }

      this.unbuild();
      $this.removeData(NAMESPACE);
    },
