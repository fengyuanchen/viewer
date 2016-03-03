    build: function () {
      var options = this.options;
      var $this = this.$element;
      var $parent;
      var $viewer;
      var $title;
      var $toolbar;
      var $navbar;
      var $button;

      if (this.isBuilt) {
        return;
      }

      this.$parent = $parent = $this.parent();
      this.$viewer = $viewer = $(Viewer.TEMPLATE);
      this.$canvas = $viewer.find('.viewer-canvas');
      this.$footer = $viewer.find('.viewer-footer');
      this.$title = $title = $viewer.find('.viewer-title');
      this.$toolbar = $toolbar = $viewer.find('.viewer-toolbar');
      this.$navbar = $navbar = $viewer.find('.viewer-navbar');
      this.$button = $button = $viewer.find('.viewer-button');
      this.$tooltip = $viewer.find('.viewer-tooltip');
      this.$player = $viewer.find('.viewer-player');
      this.$list = $viewer.find('.viewer-list');

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
      } else {
        $button.addClass(CLASS_CLOSE);
        $viewer.
          css('z-index', options.zIndex).
          addClass([CLASS_FIXED, CLASS_FADE, CLASS_HIDE].join(' '));
      }

      $this.after($viewer);

      if (options.inline) {
        this.render();
        this.bind();
        this.isShown = true;
      }

      this.isBuilt = true;

      if ($.isFunction(options.built)) {
        $this.one(EVENT_BUILT, options.built);
      }

      this.trigger(EVENT_BUILT);
    },

    unbuild: function () {
      if (!this.isBuilt) {
        return;
      }

      this.isBuilt = false;
      this.$viewer.remove();
    },
