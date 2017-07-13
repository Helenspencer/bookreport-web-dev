(function() {
  'use strict';
  angular.module('app').controller('DiagramCtrl', [
    '$scope', '$rootScope', '$modal', '$location', 'SessionService', '$window', function($scope, $rootScope, $modal, $location, SessionService, $window) {      
      if (SessionService.isAuthorized()) {

      } else {
        return $location.path('/login');
      }

      $scope.data = [];

      $scope.$watch('data', function(newValue, oldValue) {
          if (newValue != oldValue) {
            // Place your code here
          }
      }, true);

      $scope.isTouchDevice = 'ontouchstart' in document.documentElement;
      $scope.pressType = $scope.isTouchDevice ? 'Taphold' : 'Double-click';

      $scope.savePng = function(scale) {
        var box = getSVGBox(scale);
        var border = 10;

        svgAsDataUri(document.getElementById("diagram-svg"), {scale: scale}, function(uri) {
          var image = new Image();
          image.onload = function() {
            var canvas = document.createElement('canvas');
            canvas.width = box.right - box.left + border * 2;
            canvas.height = box.bottom - box.top + border * 2;
            var context = canvas.getContext('2d');
            context.drawImage(image, -box.left + border, -box.top + border);

            canvas.toBlob(function(blob) {saveAs(blob, "diagram.png"), "image/png"});
          }
          image.src = uri;
        });
      }

      $scope.export = function() {
        saveAs(new Blob([JSON.stringify($scope.data)], {type: "text/plain;charset=utf-8"}), "diagram.json");
      }

      var reader  = new FileReader();
      reader.onload = function(event) {
        $scope.data = JSON.parse(event.target.result);
        $scope.$apply();
      }

      $scope.import = function(e) {
        var ele = document.getElementById('diagram-file-input');
        var f = ele.files[0];

        if (f) {
          reader.readAsText(f);
        }

        ele.value = "";
      }

      function getSVGBox(scale) {
        var blocks = $('#diagram-svg .block');
        var box = {left:0, top:0, right: 0, bottom: 0};
        var shape;

        if (!blocks.length) {
          return box;
        }

        box.left = Infinity;
        box.top = Infinity;
        
        blocks.each(function(index) {
          shape = $(this).data('shape');
          var pos = {left:shape.absX(), top: shape.absY()};
          var size = this.getBBox();
          pos.left += size.x;
          pos.top += size.y;
          box.left = Math.min(box.left, pos.left);
          box.top = Math.min(box.top, pos.top);
          box.right = Math.max(box.right, pos.left + size.width);
          box.bottom = Math.max(box.bottom, pos.top + size.height);
        });

        for (var key in box) {
          box[key] *= scale;
        }

        return box;
      }

      $scope.serializeDiagram = function() {
        var uri = $('div[diagram]')[0].serializeWithStyles().replace(/(<div[^>]*>)|(<[^>]*div>)/g, '');
        uri = 'data:text/plain,' + $window.encodeURIComponent(uri);
        $window.open(uri, '_blank');
      }

      Element.prototype.serializeWithStyles = (function() {
        var defaultStylesByTagName = {};
        var noStyleTags = {"BASE":true,"HEAD":true,"HTML":true,"META":true,"NOFRAME":true,"NOSCRIPT":true,"PARAM":true,"SCRIPT":true,"STYLE":true,"TITLE":true};
        var tagNames = ["A","ABBR","ADDRESS","AREA","ARTICLE","ASIDE","AUDIO","B","BASE","BDI","BDO","BLOCKQUOTE","BODY","BR","BUTTON","CANVAS","CAPTION","CENTER","CITE","CODE","COL","COLGROUP","COMMAND","DATALIST","DD","DEL","DETAILS","DFN","DIV","DL","DT","EM","EMBED","FIELDSET","FIGCAPTION","FIGURE","FONT","FOOTER","FORM","H1","H2","H3","H4","H5","H6","HEAD","HEADER","HGROUP","HR","HTML","I","IFRAME","IMG","INPUT","INS","KBD","KEYGEN","LABEL","LEGEND","LI","LINK","MAP","MARK","MATH","MENU","META","METER","NAV","NOBR","NOSCRIPT","OBJECT","OL","OPTION","OPTGROUP","OUTPUT","P","PARAM","PRE","PROGRESS","Q","RP","RT","RUBY","S","SAMP","SCRIPT","SECTION","SELECT","SMALL","SOURCE","SPAN","STRONG","STYLE","SUB","SUMMARY","SUP","SVG","TABLE","TBODY","TD","TEXTAREA","TFOOT","TH","THEAD","TIME","TITLE","TR","TRACK","U","UL","VAR","VIDEO","WBR"];
        var ignoreProps = ["width", "height", "cursor", "position", "x", "y", "cx", "cy", "r", "rx", "ry", "-webkit-user-select", "transform-origin", "perspective-origin", "border-collapse", "transition-duration", "transition-property", "word-break", "-webkit-perspective-origin-x", "-webkit-perspective-origin-y", "white-space", "display"];

        for (var i = 0; i < tagNames.length; i++) {
            if(!noStyleTags[tagNames[i]]) {
                defaultStylesByTagName[tagNames[i]] = computeDefaultStyleByTagName(tagNames[i]);
            }
        }

        function computeDefaultStyleByTagName(tagName) {
            var defaultStyle = {};
            var element = document.body.appendChild(document.createElement(tagName));
            var computedStyle = getComputedStyle(element);
            for (var i = 0; i < computedStyle.length; i++) {
                defaultStyle[computedStyle[i]] = computedStyle[computedStyle[i]];
            }
            document.body.removeChild(element); 
            return defaultStyle;
        }

        function getDefaultStyleByTagName(tagName) {
            tagName = tagName.toUpperCase();
            if (!defaultStylesByTagName[tagName]) {
                defaultStylesByTagName[tagName] = computeDefaultStyleByTagName(tagName);
            }
            return defaultStylesByTagName[tagName];
        }

        return function serializeWithStyles() {
            if (this.nodeType !== Node.ELEMENT_NODE) { throw new TypeError(); }
            var cssTexts = [];
            var elements = this.querySelectorAll("*");
            for ( var i = 0; i < elements.length; i++ ) {
                var e = elements[i];
                if (!noStyleTags[e.tagName]) {
                    var computedStyle = getComputedStyle(e);
                    var defaultStyle = getDefaultStyleByTagName(e.tagName);
                    cssTexts[i] = e.style.cssText;
                    for (var ii = 0; ii < computedStyle.length; ii++) {
                        var cssPropName = computedStyle[ii];

                        if (computedStyle[cssPropName] !== defaultStyle[cssPropName] && ignoreProps.indexOf(cssPropName) < 0) {
                            if (cssPropName == "cursor") console.log(cssPropName);
                            e.style[cssPropName] = computedStyle[cssPropName];
                        }
                    }
                }
            }
            var result = this.outerHTML;
            for ( var i = 0; i < elements.length; i++ ) {
                elements[i].style.cssText = cssTexts[i];
            }
            return result;
        }
      })();
    }
  ]);

}).call(this);