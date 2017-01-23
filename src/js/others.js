    // A shortcut for triggering custom events
    trigger: function (type, data) {
      var e = $.Event(type, data);

      this.$element.trigger(e);

      return e;
    },

    shown: function () {
      var options = this.options;

      this.transitioning = false;
      this.isFulled = true;
      this.isShown = true;
      this.render();
      this.bind();

      if ($.isFunction(options.shown)) {
        this.$element.one(EVENT_SHOWN, options.shown);
      }

      this.trigger(EVENT_SHOWN);
    },

    hidden: function () {
      var options = this.options;

      this.transitioning = false;
      this.isViewed = false;
      this.isFulled = false;
      this.isShown = false;
      this.unbind();
      this.$body.removeClass(CLASS_OPEN);
      this.$viewer.addClass(CLASS_HIDE);
      this.resetList();
      this.resetImage();

      if ($.isFunction(options.hidden)) {
        this.$element.one(EVENT_HIDDEN, options.hidden);
      }

      this.trigger(EVENT_HIDDEN);
    },

    requestFullscreen: function () {
      var documentElement = document.documentElement;

      if (this.isFulled && !document.fullscreenElement && !document.mozFullScreenElement &&
        !document.webkitFullscreenElement && !document.msFullscreenElement) {

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

    exitFullscreen: function () {
      if (this.isFulled) {
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

    change: function (event) {
      var offsetX = this.endX - this.startX;
      var offsetY = this.endY - this.startY;

      switch (this.action) {

        // Move the current image
        case 'move':
          this.move(offsetX, offsetY);
          break;

        // Zoom the current image
        case 'zoom':
          this.zoom(function (x1, y1, x2, y2) {
            var z1 = sqrt(x1 * x1 + y1 * y1);
            var z2 = sqrt(x2 * x2 + y2 * y2);

            return (z2 - z1) / z1;
          }(
            abs(this.startX - this.startX2),
            abs(this.startY - this.startY2),
            abs(this.endX - this.endX2),
            abs(this.endY - this.endY2)
          ), false, event);

          this.startX2 = this.endX2;
          this.startY2 = this.endY2;
          break;

        case 'switch':
          this.action = 'switched';

          if (abs(offsetX) > abs(offsetY)) {
            if (offsetX > 1) {
              this.prev();
            } else if (offsetX < -1) {
              this.next();
            }
          }

          break;

        // No default
      }

      // Override
      this.startX = this.endX;
      this.startY = this.endY;
    },

    isSwitchable: function () {
      var image = this.image;
      var viewer = this.viewer;

      return (image.left >= 0 && image.top >= 0 && image.width <= viewer.width &&
        image.height <= viewer.height);
    }
  };
