'use strict';

describe('$sniffer', function() {

  function sniffer($window) {
    $window.navigator = {};
    return new $SnifferProvider().$get[1]($window);
  }

  describe('history', function() {
    it('should be true if history.pushState defined', function() {
      expect(sniffer({history: {pushState: noop, replaceState: noop}}).history).toBe(true);
    });

    it('should be false if history or pushState not defined', function() {
      expect(sniffer({history: {}}).history).toBe(false);
      expect(sniffer({}).history).toBe(false);
    });
  });

  describe('hashchange', function() {
    it('should be true if onhashchange property defined', function() {
      expect(sniffer({onhashchange: true, document: {}}).hashchange).toBe(true);
    });

    it('should be false if onhashchange property not defined', function() {
      expect(sniffer({document: {}}).hashchange).toBe(false);
    });

    it('should be false if documentMode is 7 (IE8 comp mode)', function() {
      expect(sniffer({onhashchange: true, document: {documentMode: 7}}).hashchange).toBe(false);
    });
  });


  describe('hasEvent', function() {
    var mockDocument, mockDivElement, $sniffer;

    beforeEach(function() {
      mockDocument = {createElement: jasmine.createSpy('createElement')};
      mockDocument.createElement.andCallFake(function(elm) {
        if (elm === 'div') return mockDivElement;
      });

      $sniffer = sniffer({document: mockDocument});
    });


    it('should return true if "onchange" is present in a div element', function() {
      mockDivElement = {onchange: noop};

      expect($sniffer.hasEvent('change')).toBe(true);
    });


    it('should return false if "oninput" is not present in a div element', function() {
      mockDivElement = {};

      expect($sniffer.hasEvent('input')).toBe(false);
    });


    it('should only create the element once', function() {
      mockDivElement = {};

      $sniffer.hasEvent('change');
      $sniffer.hasEvent('change');
      $sniffer.hasEvent('change');

      expect(mockDocument.createElement).toHaveBeenCalledOnce();
    });


    it('should claim that IE9 doesn\'t have support for "oninput"', function() {
      // IE9 implementation is fubared, so it's better to pretend that it doesn't have the support
      mockDivElement = {oninput: noop};

      expect($sniffer.hasEvent('input')).toBe((msie == 9) ? false : true);
    });
  });
});
