import $ from 'jquery';
import {
  CLASS_TRANSITION,
  EVENT_LOAD,
  EVENT_TRANSITION_END,
  EVENT_VIEWED,
} from './constants';
import {
  getImageNameFromURL,
  getImageNaturalSizes,
  getTransformValues,
  isString,
} from './utilities';

export default {
  render() {
    this.initContainer();
    this.initViewer();
    this.initList();
    this.renderViewer();
  },

  initContainer() {
    const $window = $(window);

    this.container = {
      width: $window.innerWidth(),
      height: $window.innerHeight(),
    };
  },

  initViewer() {
    const { options, $parent } = this;
    let viewer;

    if (options.inline) {
      viewer = {
        width: Math.max($parent.width(), options.minWidth),
        height: Math.max($parent.height(), options.minHeight),
      };
      this.parent = viewer;
    }

    if (this.fulled || !viewer) {
      viewer = this.container;
    }

    this.viewer = $.extend({}, viewer);
  },

  renderViewer() {
    if (this.options.inline && !this.fulled) {
      this.$viewer.css(this.viewer);
    }
  },

  initList() {
    const { $element, options, $list } = this;
    const list = [];

    this.$images.each((i, image) => {
      const alt = image.alt || getImageNameFromURL(image);
      const { src } = image;
      let { url } = options;

      if (isString(url)) {
        url = image.getAttribute(url);
      } else if ($.isFunction(url)) {
        url = url.call(image, image);
      }

      if (src || url) {
        list.push('<li>' +
          '<img' +
            ` src="${src || url}"` +
            ' data-action="view"' +
            ` data-index="${i}"` +
            ` data-original-url="${url || src}"` +
            ` alt="${alt}"` +
          '>' +
        '</li>');
      }
    });

    $list.html(list.join('')).find('img').one(EVENT_LOAD, {
      filled: true,
    }, $.proxy(this.loadImage, this));

    this.$items = $list.children();

    if (options.transition) {
      $element.one(EVENT_VIEWED, () => {
        $list.addClass(CLASS_TRANSITION);
      });
    }
  },

  renderList(index) {
    const i = index || this.index;
    const width = this.$items.eq(i).width();

    // 1 pixel of `margin-left` width
    const outerWidth = width + 1;

    // Place the active item in the center of the screen
    this.$list.css({
      width: outerWidth * this.length,
      marginLeft: ((this.viewer.width - width) / 2) - (outerWidth * i),
    });
  },

  resetList() {
    this.$list.empty().removeClass(CLASS_TRANSITION).css('margin-left', 0);
  },

  initImage(callback) {
    const { options, $image, viewer } = this;
    const footerHeight = this.$footer.height();
    const viewerWidth = viewer.width;
    const viewerHeight = Math.max(viewer.height - footerHeight, footerHeight);
    const oldImage = this.image || {};

    getImageNaturalSizes($image[0], (naturalWidth, naturalHeight) => {
      const aspectRatio = naturalWidth / naturalHeight;
      let width = viewerWidth;
      let height = viewerHeight;

      if (viewerHeight * aspectRatio > viewerWidth) {
        height = viewerWidth / aspectRatio;
      } else {
        width = viewerHeight * aspectRatio;
      }

      width = Math.min(width * 0.9, naturalWidth);
      height = Math.min(height * 0.9, naturalHeight);

      const image = {
        naturalWidth,
        naturalHeight,
        aspectRatio,
        ratio: width / naturalWidth,
        width,
        height,
        left: (viewerWidth - width) / 2,
        top: (viewerHeight - height) / 2,
      };
      const initialImage = $.extend({}, image);

      if (options.rotatable) {
        image.rotate = oldImage.rotate || 0;
        initialImage.rotate = 0;
      }

      if (options.scalable) {
        image.scaleX = oldImage.scaleX || 1;
        image.scaleY = oldImage.scaleY || 1;
        initialImage.scaleX = 1;
        initialImage.scaleY = 1;
      }

      this.image = image;
      this.initialImage = initialImage;

      if ($.isFunction(callback)) {
        callback();
      }
    });
  },

  renderImage(callback) {
    const { image, $image } = this;

    $image.css({
      width: image.width,
      height: image.height,
      marginLeft: image.left,
      marginTop: image.top,
      transform: getTransformValues(image),
    });

    if ($.isFunction(callback)) {
      if (this.transitioning) {
        $image.one(EVENT_TRANSITION_END, callback);
      } else {
        callback();
      }
    }
  },

  resetImage() {
    if (this.$image) {
      this.$image.remove();
      this.$image = null;
    }
  },
};
