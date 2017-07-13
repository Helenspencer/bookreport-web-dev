angular.module('app.diagram', [])
.directive('diagram', ['Shape', '$window', '$modal', '$rootScope', function(Shape, $window, $modal, $rootScope) {
      return {
        restrict: 'A',
        scope: {
          data: "=data",
          fit: "=fit"
        },
        link: function(scope, ele, attr) {
          var window = angular.element($window);
          var timeout, prevWidth;
          var canvasWidth = 1600;

          scope.$watch('fit', function(newValue, oldValue) {
              if (newValue != oldValue) {
                initFit();
                redraw();
              }
          });

          scope.$watch('data', function(newValue, oldValue) {
              if (newValue != oldValue) {
                redraw();
              }
          }, true);

          var ns = "http://www.w3.org/2000/svg";
          var svg = document.createElementNS(ns, "svg");
          svg.setAttribute('class', 'diagram');
          svg.setAttribute('id', 'diagram-svg');
          // svg.setAttribute('xmlns', ns);
          $(ele).css({'overflow':'auto', 'position':'relative'});

          var bgLayer = document.createElementNS(ns, "rect");
          var activeLayer = document.createElementNS(ns, "rect");
          var linesLayer = document.createElementNS(ns, "svg");
          var activeLayer = document.createElementNS(ns, "rect");
          var shapesLayer = document.createElementNS(ns, "svg");

          var clickPoint = document.createElementNS(ns, "circle");
          var clickTimeout = null;
          clickPoint.setAttribute('r', '6');
          clickPoint.setAttribute('class', 'click-pt');

          svg.appendChild(bgLayer);
          svg.appendChild(linesLayer);
          svg.appendChild(clickPoint);
          svg.appendChild(activeLayer);
          svg.appendChild(shapesLayer);

          activeLayer.setAttribute('x', '0');
          activeLayer.setAttribute('y', '0');
          activeLayer.setAttribute('width', '100%');
          activeLayer.setAttribute('height', '100%');
          activeLayer.setAttribute('fill', '#ffffff');
          activeLayer.setAttribute('fill-opacity', '0');
          activeLayer.setAttribute('class', 'active-layer');
          linesLayer.setAttribute('class', 'lines-layer');
          shapesLayer.setAttribute('class', 'shapes-layer');
          shapesLayer.setAttribute('x', '0');
          shapesLayer.setAttribute('y', '0');

          svg.setAttribute('width', canvasWidth);
          svg.setAttribute('height', 800);
          ele.append(svg);

          var clickCoord = {x: 0, y:0};

          var defData = {id:0, type:1, style:1, x:0, y:0, width:'auto', to:[], text:''};
          scope.activeData = angular.copy(defData);
          scope.activeIndex = -1;

          $rootScope.modalIsOpened = false;

          var openModal = function(event) {
            clearTimeout(clickTimeout);
            scope.currentModal = $modal.open({
              templateUrl: 'add-block-tpl',
              backdrop: 'static',
              scope: scope
            });

            $rootScope.modalIsOpened = true;

            scope.currentModal.result.then(function() {
              $rootScope.modalIsOpened = false;
              clickPoint.setAttribute('class', 'click-pt');
            });
          };

          $(activeLayer).on('dblclick taphold', function(event){
            clickPoint.setAttribute('class', 'click-pt active-pt');
            scope.activeIndex = -1;
            scope.activeData = angular.copy(defData);
            scope.activeData.id = getNewId();
            scope.activeData.x = clickCoord.x;
            scope.activeData.y = clickCoord.y;
            openModal(event);
          }).on('mousedown', function(event) {
            setNewBlockCoordinates(event);
            clickPoint.setAttribute('class', 'click-pt down-pt');
            clearTimeout(clickTimeout);
            clickTimeout = setTimeout(function(){
              clickPoint.setAttribute('class', 'click-pt');
            }, 1000);
          });          

          function setNewBlockCoordinates(event) {
            var canvas = $(svg);
            var offset = canvas.offset();
            clickCoord.x = (event.pageX - offset.left) / canvas.width() * 100 + '%';
            clickCoord.y = (event.pageY - offset.top) / canvas.height() * 100 + '%';
            clickPoint.setAttribute('cx', clickCoord.x);
            clickPoint.setAttribute('cy', clickCoord.y);
          }

          scope.changeConnection = function(state, type, data, toId) {
            if (state) {
              data[toId] = type;
            }
            else {
              delete data[toId];
            }
          }

          scope.removeBlock = function(index, id) {
            scope.data.splice(index, 1);
            angular.forEach(scope.data, function(value, key) {
              delete value.to[id];
            });
            scope.currentModal.close();
          }

          scope.addBlock = function(data) {
            var to = {};
            var modal = $('#add-block-modal');

            $(modal).find('.connection table input[type="checkbox"]:checked').each(function(){
              var row = $(this).closest('tr');
              to[row.data('id')] = row.find('input[type="radio"]:checked').attr('value');
            });

            data.to = to;

            if (scope.activeIndex > -1) {
              scope.data[scope.activeIndex] = data;
            }
            else {
              scope.data.push(data);
            }

            scope.currentModal.close();
          }

          function getNewId() {
            var id, maxId = 0;
            angular.forEach(scope.data, function(value, key) {
              maxId = Math.max(maxId, parseInt(value.id) || 0);
            });
            return maxId + 1;
          }

          var activeShape, offset, i;
          var shapesById = {};

          function initFit() {
            prevWidth = 0;
            if (scope.fit) {
              window.on('resize', function() {
                  clearTimeout(timeout);
                  timeout = setTimeout(function() {adjustCanvas()}, 100);
              });
            }
            else {
              window.off('resize');
            }
            adjustCanvas();
          }

          function adjustCanvas() {
            var width = $(ele).width();
            if (width != prevWidth) {
              if (scope.fit) {
                svg.setAttribute('width', ele.width());
              }
              else {
                svg.setAttribute('width', canvasWidth);
              }
              drawAllLines();
            }
            prevWidth = width;
          }

          $(document).ready(function(){
            setTimeout(function(){initFit()}, 100);
          });

          redraw();

          function redraw() {
            $(linesLayer).empty();
            $(shapesLayer).empty();
            shapesById = {};

            for (i = 0; i < scope.data.length; i++) {
              var shape = new Shape(scope.data[i], shapesLayer, i);
              shapesById[shape.data.id] = shape;

              $(shape.node).on('shape:down', function(event) {
              });

              $(shape.node).on('shape:sizeChanged', function(event, oEvent, shape){
                drawConnectionsForShape($(event.target).data('shape'));
              });

              $(shape.node).on('shape:sizeChangedComplete', function(event, oEvent, shape){
                shape.data.width = shape.w;
                shape.data.height = shape.h;
              });

              $(shape.node).on('shape:mousedown', function(event, oEvent){
                activeShape = $(event.target).data('shape');
                activeShape.moved = false;
                offset = activeShape.offset();
                offset.left -= oEvent.pageX;
                offset.top -= oEvent.pageY;
                addClass(svg, 'noselect');
                addClass(activeShape.node, 'active');

                $(svg).on('mousemove', function(e) {
                  var oX = (e.pageX - $(svg).offset().left);
                  var oY = (e.pageY - $(svg).offset().top);
                  activeShape.position(oX + offset.left, oY + offset.top);
                  drawConnectionsForShape(activeShape);
                  activeShape.moved = true;
                });

                $(svg).on('mouseup', function() {
                  removeClass(activeShape.node, 'active');
                  removeClass(svg, 'noselect');
                  activeShape.data.x = activeShape.absX() / $(svg).width() * 100 + '%';
                  activeShape.data.y = activeShape.absY() / $(svg).height() * 100 + '%';
                  activeShape = null;
                  $(svg).off('mousemove');
                  $(svg).off('mouseup');
                  scope.$apply();
                });
              }).on('shape:dblclick shape:taphold', function(event){
                var targetShape = $(event.target).data('shape');
                if (!targetShape.moved) {
                  scope.activeIndex = targetShape.index;
                  scope.activeData = angular.copy(targetShape.data);
                  openModal(event);
                }
              });
            }

            drawAllLines();
          }

          function addClass(target, className) {
            $(target).attr('class', function(index, classNames) {
              return classNames + ' ' + className;
            });
          }

          function removeClass(target, className) {
            $(target).attr('class', function(index, classNames) {
              return classNames.replace(className, '');
            });
          }

          function drawAllLines() {
            $(linesLayer).empty();
            for (var key in shapesById) {
              drawConnections(shapesById[key]);
            }
          }

          function drawConnectionsForShape(shape) {
            var to;
            for (var key in shapesById) {
              to = shapesById[key].data.to;
              angular.forEach(to, function(value, key2) {
                if (key2 == shape.data.id) {
                  drawConnections(shapesById[key]);
                }
              });
            }
            drawConnections(shape);
          }

          function drawConnections(shape) {
            var i, line, shape2, angle, coord, coord2, position;
            var to = shape.data.to;
            var counts = {};

            while (shape.lines && shape.lines.length) {
              $(shape.lines.pop()).remove();
            }

            angular.forEach(to, function(value, key) {
              if (typeof counts[key] == 'undefined') counts[key] = {total:0, current:0};
              counts[key].total++;
            });

            angular.forEach(to, function(value, key) {
              shape2 = shapesById[key];
              if (shape2) {
                angle = Math.atan2(shape2.cY() - shape.cY(), shape2.cX() - shape.cX());
                angle -= Math.PI / 2;
                counts[key].current++;

                position = counts[key].total > 1 ? counts[key].current / (counts[key].total - 1) : 1;
                coord = getConnectionOffset(shape, angle, position);
                coord2 = getConnectionOffset(shape2, angle + Math.PI, 0);

                line = document.createElementNS(ns, "path");
                line.setAttribute('d', getPath(angle, {x:coord.x + shape.cX(), y:coord.y + shape.cY()}, {x:coord2.x + shape2.cX(), y:coord2.y + shape2.cY()}));
                line.setAttribute('class', 'connection line' + value);
                linesLayer.appendChild(line);
                shape.lines.push(line);
              }
            });
          }

          function getPath(angle, coord, coord2) {
            angle += Math.PI * 0.02;
            var dist = lineDistance(coord, coord2);
            var offset = rotate(0, dist/2, angle);
            var offset2 = rotate(0, dist/2, -angle);
            var c = [coord.x, coord.y, coord.x + offset.x, coord.y + offset.y, coord2.x, coord2.y].join(' ');
            return  'M' + coord.x + ' ' + coord.y + 'C' + c;
          }

          function lineDistance(point1, point2){
            var xs = 0;
            var ys = 0;
           
            xs = point2.x - point1.x;
            xs = xs * xs;
           
            ys = point2.y - point1.y;
            ys = ys * ys;
           
            return Math.sqrt( xs + ys );
          }

          function getConnectionOffset(shape, angle, position) {
            var maxLen = Math.min(shape.w/2, shape.h/2);
            var coord = rotate(0, maxLen, angle + Math.PI / 4 * position);
            return coord;
            // var sW = shape.w - 6, sH = shape.h - 6;
            // return intersectRectangle(-sW / 2, -sH / 2, sW, sH, 0, 0, coord.x, coord.y);
          }

          function ccw(x1, y1, x2, y2, x3, y3) {           
            var cw = ((y3 - y1) * (x2 - x1)) - ((y2 - y1) * (x3 - x1));
            return cw > 0 ? true : cw < 0 ? false : true;
          };

          function intersectLine(x1, y1, x2, y2, x3, y3, x4, y4) {
            var s1_x, s1_y, s2_x, s2_y;
            s1_x = x2 - x1;     s1_y = y2 - y1;
            s2_x = x4 - x3;     s2_y = y4 - y3;

            var s, t;
            s = (-s1_y * (x1 - x3) + s1_x * (y1 - y3)) / (-s2_x * s1_y + s1_x * s2_y);
            t = ( s2_x * (y1 - y3) - s2_y * (x1 - x3)) / (-s2_x * s1_y + s1_x * s2_y);

            if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
                var atX = x1 + (t * s1_x);
                var atY = y1 + (t * s1_y);
                return { x: atX, y: atY };
            }

            return false;
          };

          function intersectRectangle(rx, ry, rWidth, rHeight, x1, y1, x2, y2) {
            var result, l, lines = [
              [rx, ry, rx + rWidth, ry],
              [rx + rWidth, ry, rx + rWidth, ry + rHeight],
              [rx + rWidth, ry + rHeight, rx, ry + rHeight],
              [rx, ry + rHeight, rx, ry]
            ]

            for (var i in lines) {
              l = lines[i];
              result = intersectLine(l[0], l[1], l[2], l[3], x1, y1, x2, y2);
              if (result) return result;
            }

            return false;
          }

          function rotate(x, y, angle, oX, oY) {
            var cos, sin, tx, ty;
            oX = oX || 0;
            oY = oY || oX;
            cos = Math.cos(angle);
            sin = Math.sin(angle);
            tx = x * cos - y * sin;
            ty = x * sin + y * cos;
            return {
              x: tx + oX,
              y: ty + oY
            };
          };
        }
      };
    }
  ])
.directive('sampleShape', ['Shape', '$window', function(Shape, $window) {
      return {
        restrict: 'A',
        scope: {
          sampleShape: "=sampleShape"
        },
        link: function(scope, ele, attr) {
          var w = 22, h = 18, sd = 6, bd = 4;
          var type = scope.sampleShape;
          var ns = "http://www.w3.org/2000/svg";
          var svg = document.createElementNS(ns, "svg");
          $(svg).css({'overflow':'visible'});
          svg.setAttribute('width', w);
          svg.setAttribute('height', h);
          svg.setAttribute('class', 'diagram');

          var shapeH = type == 2 ? h - sd / 2 : h;
          var shape = new Shape({width:w, height:shapeH, type:type, sd:sd, bd:bd}, svg);
          ele.append(svg);
        }
      } 
    }
  ])
.directive('doublePress', ['$parse', '$rootScope', function($parse, $rootScope) {
      return {
        compile: function($element, attr) {
          var fn = $parse(attr['doublePress'], true);
          return function ngEventHandler(scope, element) {
            element.on(eventName, function(event) {
              var callback = function() {
                fn(scope, {$event:event});
              };
              if (forceAsyncEvents[eventName] && $rootScope.$$phase) {
                scope.$evalAsync(callback);
              } else {
                scope.$apply(callback);
              }
            });
          };
        }
      } 
    }
  ]);