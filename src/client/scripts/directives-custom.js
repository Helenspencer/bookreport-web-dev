angular.module('app.directives-custom', [])
.directive('focusable', [
    function() {
      return {
        restrict: 'A',
        link: function(scope, ele, attr) {
          var input = ele.find('input, textarea').css({
            'cursor': 'text'
          }).addClass('input');
          input.on('focus', function(event) {
            ele.addClass('selected');
          }).on('blur', function(event) {
            ele.removeClass('selected');
          });
          ele.on('click', function(event) {
            $(input).focus();
          });
        }
      };
    }
  ])
.directive('fileClick', ['$parse',  function($parse) {
      return {
        restrict: 'A',
        link: function(scope, ele, attr) {
          var fn = $parse(attr['fileClick'], null, true);
          var active = ele.find('td').not('.chk').not('.tags').css({
            'cursor': 'pointer'
          });
          active.on('mouseover', function(event) {
            ele.addClass('selected');
          }).on('mouseout', function(event) {
            ele.removeClass('selected');
          });
          active.on('click', function(event) {
            var callback = function() {
              fn(scope, {$event:event});
            };
            scope.$apply(callback);
          });
        }
      };
    }
  ])
.directive('hlFiles', [
    function() {
      return {
        restrict: 'A',
        link: function(scope, ele, attr) {
         var inputs = $();
          ele.find('td').not('.chk').on('mouseover', function(event) {
            inputs = ele.nextUntil('.project').find('input');
            inputs.each(function(){
              $(this).data('checked', $(this).prop('checked'));
            })
            inputs.prop({"checked":true, "disabled":true})
          }).on('mouseout', function(event) {
            inputs.prop('disabled', false).prop("checked", function(){return $(this).data('checked')});
            inputs = $();
          });
        }
      };
    }
  ])
.directive('mainCheckbox', [
    function() {
      return {
        restrict: 'A',
        link: function(scope, ele, attr) {

          setTimeout(function(){
            var children = ele.closest(attr['mainCheckbox']).find('input[type="checkbox"]').not(ele);
            children.change(function(event) {
              setTimeout(function(){
                var state = getState(children.not('[main-checkbox]'));

                if (state != 'some') {
                  ele.prop({'checked':state == 'none' ? false : true, 'indeterminate':false});
                }
                else {
                  ele.prop({'checked':true, 'indeterminate':true});
                }
              }, 10);
            });

            ele.change(function(event) {
              children.prop({"checked":ele.prop("checked")});
            });
          }, 100);

          function getState(list) {
            var checked = false;
            var checkedAll = true;
            var state;
            list.each(function(){
              state = $(this).prop('checked');
              if (state) {
                checked = true;
              }
              else {
                checkedAll = false;
              }
            });

            return !checked ? 'none' : checkedAll ? 'all' : 'some';
          }
        }
      };
    }
  ])
.directive('watchButton', [
    function() {
      return {
        restrict: 'A',
        scope: {
          data:'=data'
        },
        link: function(scope, ele, attr) {
          var inputs = $();
          scope.$watch('data', function(newValue, oldValue) {
              if (newValue) {
                update();
              }
          }, true);

          setTimeout(function(){update()}, 100);

          function update() {
            inputs = $(attr['target']).find('input[type="checkbox"]');
            inputs.change(function(){
              setTimeout(function(){
                updateState();
              }, 10);
            });
            updateState();
          }

          function updateState() {
            var checked = false;
            inputs.not('[main-checkbox]').each(function(){
              if ($(this).prop('checked')) {
                checked = true;
              }
            });
            ele.prop('disabled', !checked);
          }
        }
      };
    }
  ])
.directive('convertToNumber', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function(val) {
        return parseInt(val, 10);
      });
      ngModel.$formatters.push(function(val) {
        return '' + val;
      });
    }
  };
})
.directive('ngEnter', function() {
        return function(scope, element, attrs) {
            element.bind("keydown keypress", function(event) {
                if(event.which === 13) {
                        scope.$apply(function(){
                                scope.$eval(attrs.ngEnter);
                        });
                        
                        event.preventDefault();
                }
            });
        };
})
.directive('resizable', function () {

    return {
        restrict: 'A',     
        scope: {
            callback: '&onResize'
        },
        link: function postLink(scope, elem, attrs) {          
            elem.resizable();            
              elem.on('resize', function (evt, ui) {
              scope.$apply(function() {
                if (scope.callback) { 
                  scope.callback({$evt: evt, $ui: ui }); 
                }                
              })
            });
        }
    };
  })
.directive('correctionData', ['$sce', function($sce) { 
        return {   
            restrict: 'E',   
            scope: {
              data:'=',
              callback: '&callback'
            },         
            template: "<div ng-bind-html='trustedHtml'></div>",
            link: function(scope,element,attrs) {
                var original;
                scope.updateView = function(newValue) {
                  scope.trustedHtml = $sce.trustAsHtml(scope.data);
                  original = scope.trustedHtml.toString().replace(/ /g,'');
                }

                element.bind('keyup', function(event) {                    
                  event.preventDefault();
                  var self = this;
                  scope.$apply(function() {
                    scope.callback({'changed':original  != self.childNodes[0].innerHTML.replace(/ /g,'')});
                  });                                                      
                }); 

                scope.$watch('data', function(newValue, oldValue) {                              
                  scope.updateView(newValue);
                });           
            }
        };      
    }]);
