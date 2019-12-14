import $ from 'jquery';
import '../src';

describe('viewer', () => {
  const createImage = () => {
    const container = document.createElement('div');
    const image = document.createElement('img');

    image.src = '/base/docs/images/tibet-1.jpg';
    container.appendChild(image);
    document.body.appendChild(container);

    return image;
  };

  it('should register as a plugin correctly', () => {
    expect($.fn.viewer).to.be.a('function');
    expect($.fn.viewer.Constructor).to.be.a('function');
    expect($.fn.viewer.noConflict).to.be.a('function');
    expect($.fn.viewer.setDefaults).to.be.a('function');
  });

  it('should remove data after destroyed', () => {
    const $image = $(createImage());

    $image.viewer();
    expect($image.data('viewer')).to.be.an.instanceof($.fn.viewer.Constructor);
    $image.viewer('destroy');
    expect($image.data('viewer')).to.be.undefined;
  });

  it('should apply the given option', (done) => {
    $(createImage()).viewer({
      inline: true,

      ready() {
        done();
      },
    });
  });

  it('should execute the given method', (done) => {
    $(createImage()).viewer({
      shown() {
        done();
      },
    }).viewer('show');
  });

  it('should trigger the binding event', (done) => {
    $(createImage()).one('ready', (event) => {
      expect(event.type).to.equal('ready');
      done();
    }).viewer('show');
  });

  it('should rollback when call the $.fn.viewer.conflict', () => {
    const { viewer } = $.fn;
    const noConflictViewer = $.fn.viewer.noConflict();

    expect(noConflictViewer).to.equal(viewer);
    expect($.fn.viewer).to.be.undefined;

    // Reverts it for the rest test suites
    $.fn.viewer = noConflictViewer;
  });
});
