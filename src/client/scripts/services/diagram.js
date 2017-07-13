angular.module("app")
  .factory('Shape', function() {
    var ns = "http://www.w3.org/2000/svg";

    var shapeClass = function(data, target, index) {
      var th = this;
      th.padding = {l:12, t:8, b:11, r:12};
      th.lines = [];
      th.to = [];
      th.fontSize = data.fontSize || 14;
      th.rzRectSize = 15;

      th.startW = data.width;
      th.startH = data.height;
      
      th.target = target;
      th.parent = $(target).closest('.diagram');
      th.node = document.createElementNS(ns, "svg");
      th.node.setAttribute('xmlns', ns);
      $(th.node).css({'overflow':'visible'});
      th.node.setAttribute('class', 'block type' + data.type + ' style' + (data.style || 0) + (data.noFill ? ' no-fill' : '') + (data.noOutline ? ' no-outline' : ''));

      target.appendChild(th.node);
      var shapeLayer = document.createElementNS(ns, 'g');
      th.node.appendChild(shapeLayer);

      var textLayer = document.createElementNS(ns, 'g');
      th.node.appendChild(textLayer);

      th.coordRect = document.createElementNS(ns, 'rect');
      th.node.appendChild(th.coordRect);

      if (data.resizable) {
        th.rzRectLayer = document.createElementNS(ns, 'svg');
        th.rzRectLayer.setAttribute('xmlns', ns);
        th.rzRectLayer.setAttribute('class', 'rz-rect');
        th.node.appendChild(th.rzRectLayer);

        th.rzIcon = document.createElementNS(ns, 'g');
        th.rzIcon.setAttribute('transform', 'translate(4, 4)');
        th.rzIcon.innerHTML = '<path d="M6.005,5.987 L5.625,-0.011 L0.008,5.607 L6.005,5.987 Z"/>';
        th.rzRectLayer.appendChild(th.rzIcon);

        th.rzRect = document.createElementNS(ns, 'rect');
        th.rzRect.setAttribute('width', th.rzRectSize);
        th.rzRect.setAttribute('height', th.rzRectSize);
        th.rzRect.setAttribute('fill-opacity', 0);
        th.rzRectLayer.appendChild(th.rzRect);

        var cornerOffset = {l:0, t:0};

        $(th.rzRect).on('mousedown', function(event) {
          event.stopImmediatePropagation();
          var cornerLt = $(th.rzRect).offset();
          cornerOffset = {left:event.pageX - (cornerLt.left + th.rzRectSize), top:event.pageY - (cornerLt.top + th.rzRectSize)};
          $(th.node).attr('class', function(index, classNames) {
              return classNames + ' resize';
          });

          $(document).on('mousemove', function(event) {
            var lt = $(th.coordRect).offset();
            th.startW = event.pageX - lt.left - cornerOffset.left;
            th.startH = event.pageY - lt.top - cornerOffset.top;

            redraw();

            changed("shape:sizeChanged", [event]);

          }).on('mouseup', function(event){
            $(th.node).attr('class', function(index, classNames) {
                return classNames.replace('resize', '');
            });
            $(document).off('mousemove');
            changed("shape:sizeChangedComplete", [event, th]);
          });
        });
      }

      redraw();

      function redraw() {
        $(shapeLayer).empty();
        $(textLayer).empty();

        var textWidth = typeof th.startW == 'undefined' || th.startW == 'auto' ? 150 : th.startW - th.padding.l - th.padding.r;

        th.text = multilineText(textWidth, textLayer, data.text, th.fontSize, data.centered);

        var textBBox = data.text ? th.text.getBBox() : {x:0, y:0, width:0, height:0};
        var totalTextH = textBBox.height + th.padding.t + th.padding.b;
        var totalTextW = textBBox.width + th.padding.l + th.padding.r;

        th.h = Math.max(th.padding.t + th.padding.b, typeof th.startH == 'undefined' ? totalTextH : Math.max(th.startH, totalTextH));
        th.w = Math.max(th.padding.l + th.padding.r, typeof th.startW == 'undefined' || th.startW == 'auto' ? textBBox.width + th.padding.l + th.padding.r : Math.max(th.startW, totalTextW));
        shapeLayer.appendChild(getShape(data, th.w, th.h));

        if (th.rzRectLayer) {
          th.rzRectLayer.setAttribute('x', th.w - th.rzRectSize);
          th.rzRectLayer.setAttribute('y', th.h - th.rzRectSize - (data.type == 2 ? 5 : 0));
        }

        var textX = th.padding.l;
        var textY = th.padding.t;

        if (data.centered) {
          textX = (th.w - textBBox.width) / 2;
          textY = (th.h - textBBox.height) / 2;
        }

        th.text.setAttribute('transform', 'translate(' + textX + ',' + textY + ')');
        th.text.setAttribute('fill', '#000000');
      }

      function changed(type, dataArray) {
        $(th.node).trigger(type, dataArray);
      }
    
      $(th.node).on('mousedown dblclick taphold', function(event) {
        $(th.node).trigger("shape:" + event.type, [event]);
      });

      th.data = data;
      th.index = index;
      $(th.node).data('shape', th);
      th.type = data.type;
      th.moved = false;

      th.resetSlots();
      th.position(data.x || 0, data.y || 0);
    }

    shapeClass.prototype.innerWidth = function() {
      return this.w - this.padding.l - this.padding.r;
    }

    shapeClass.prototype.innerHeight = function() {
      return this.h - this.padding.t - this.padding.b;
    }

    shapeClass.prototype.resetSlots = function() {
      this.totalSlots = {l:0, r:0, t:0, b:0};
      this.busySlots = {l:0, r:0, t:0, b:0};
      this.sideBlocks = {l:[], r:[], t:[], b:[]};
    }

    shapeClass.prototype.position = function(x, y) {
      var th = this;
      th.x = typeof x == "undefined" ? th.x : x;
      th.y = typeof y == "undefined" ? th.y : y;
      th.node.setAttribute('x', th.x);
      th.node.setAttribute('y', th.y);
      return {x: th.x, y: th.y};
    }

    shapeClass.prototype.offset = function() {
      return $(this.coordRect).offset();
    }

    shapeClass.prototype.cX = function() {
      return this.absX() + this.w / 2;
    }

    shapeClass.prototype.cY = function() {
      return this.absY() + this.h / 2;
    }

    shapeClass.prototype.absX = function() {
      return $(this.coordRect).offset().left - $(this.parent).offset().left;
    }

    shapeClass.prototype.absY = function() {
      return $(this.coordRect).offset().top - $(this.parent).offset().top;
    }

    shapeClass.prototype.getAbsPosition = function() {
      var nodePos = $(this.node).offset();
      var coordPos = $(this.node).offset();
      coordPos.top -= nodePos.top;
      coordPos.left -= nodePos.left;
      return coordPos;
    }

    return shapeClass;

    function getShape(data, w, h, stroke) {
      var ns = 'http://www.w3.org/2000/svg';
      var shape;

      if (data.type == 0) {
        shape = document.createElementNS(ns, 'circle');
        shape.setAttribute("cx", w / 2);
        shape.setAttribute("cy", h / 2);
        shape.setAttribute("r", w / 2);
      }
      else if (data.type == 1) {
        var cornerRadius = 6;
        shape = document.createElementNS(ns, 'rect');
        shape.setAttribute("rx", cornerRadius);
        shape.setAttribute("ry", cornerRadius);
        shape.setAttribute("width", w);
        shape.setAttribute("height", h);
      }
      else {
        shape = document.createElementNS(ns, 'path');
        shape.setAttribute('d', getPathData(data.type, w, h, data.sd, data.bd));
      }

      shape.setAttribute('class', 'shape');
      return shape;
    }

    function multilineText(maxWidth, target, text, size, centered) {
      var textEl = document.createElementNS(ns, "text");
      if (!text) return textEl;

      $(textEl).css('font-size', size);
      target.appendChild(textEl);
      var words = text.replace(/[\n\r]/g, ' \n ').split(' ');
      var lineNum = 0, currText = '', newText = '', numWords = 0;
      var tspan;

      while (words.length) {
        newText = currText + words[0] + ' ';

        tspan = document.createElementNS(ns, "tspan");
        tspan.appendChild(document.createTextNode(newText));
        tspan.setAttribute('x', 0);
        tspan.setAttribute('y', size + lineNum * size * 1.4);
        textEl.appendChild(tspan);

        if (tspan.getComputedTextLength() < maxWidth && words[0] !== '\n') {
          if (words.length != 1) {
            textEl.removeChild(tspan);
            currText = newText;
          }
          words.shift();
          numWords++;
        }
        else {
          $(tspan).empty();
          if (numWords < 1) {
            words.shift();
            currText = newText;
          }

          tspan.appendChild(document.createTextNode(currText));
          currText = '';
          if (words[0] !== '\n') lineNum++;
          numWords = 0;
        }
      }

      if (centered) {
        var width = textEl.getBBox().width;
        $(textEl).find('tspan').each(function(){
          this.setAttribute('x', (width - this.getComputedTextLength()) / 2);
        });
      }

      return textEl;
    }
    

    function getPathData(type, w, h, shapeDistortion, bezierDistortion) {
      var sd = shapeDistortion || 10; // shape distortion
      var bd = bezierDistortion || 10; // bezier distortion

      if (type == 2) {
        return  'M0 0' +
                'H' + w + 
                'V' + (h - sd / 2) + 
                'C' + w/2 + ' ' + (h - sd / 2) + ' ' + w/2 + ' ' + (h + bd) + ' ' + 0 + ' ' + (h + sd / 2) +
                'z'
      }

      if (type == 3) {
        return  'M0 0' +
                'C' + w/2 + ' ' + bd + ' ' + w/2 + ' ' + -bd + ' ' + w + ' 0' +
                'V' + h + 
                'C' + w/2 + ' ' + (h - bd) + ' ' + w/2 + ' ' + (h + bd) + ' 0 ' + h + 
                'z'
      }
    }
  });