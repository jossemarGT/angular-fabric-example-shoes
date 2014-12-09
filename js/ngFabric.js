/*
  Heads up! A great part is based on this https://gist.github.com/clouddueling/8475865
*/

/**
* http://fabricjs.com/js/kitchensink/controller.js
* http://fabricjs.com/js/kitchensink/utils.js
* http://fabricjs.com/js/kitchensink/app_config.js
* http://fabricjs.com/events/
* view-source:http://fabricjs.com/kitchensink/
*/

(function(angular, fabric) {

  'use strict';

  function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  angular.module('ngFabric', [])

  .factory('FabricService', ['$q', function($q) {
    var self = {};

    function update() {
      if (!self.canvas) {
        return;
      }

      self.canvas.fire('canvas:modified');
      self.canvas.renderAll.bind(self.canvas);
    }

    function updateWithPromise(deferred){
      update();
      deferred.resolve();
    }

    function getActiveStyle(styleName, object) {
      if (!self.canvas) {
        return;
      }

      object = object || self.canvas.getActiveObject();
      if (!object) {
        return;
      }

      return (object.getSelectionStyles && object.isEditing)
      ? (object.getSelectionStyles()[styleName] || '')
      : (object[styleName] || '');
    }

    function setActiveStyle(styleName, value, object) {
      if (!self.canvas) {
        return;
      }

      object = object || self.canvas.getActiveObject();
      if (!object) {
        return;
      }

      if (object.setSelectionStyles && object.isEditing) {
        var style = { };
        style[styleName] = value;
        object.setSelectionStyles(style);
        object.setCoords();
      }
      else {
        object[styleName] = value;
      }

      object.setCoords();
      update();
      self.canvas.renderAll();
    }

    function getActiveProp(name) {
      if (!self.canvas) {
        return;
      }

      var object = self.canvas.getActiveObject();
      if (!object) {
        return;
      }

      return object[name] || '';
    }

    function setActiveProp(name, value) {
      var object = self.canvas.getActiveObject();
      if (!object) {
        return;
      }

      object.set(name, value).setCoords();
      update();
      self.canvas.renderAll();
    }

    // Factory functions
    self.canvas = undefined;
    self.rotatingPointOffset = 20;
    self.element = {};
    self.canvasId = 'fabric-' + Math.floor(Math.random() * 10000000);

    self.init = function() {
      self.element.attr('id', self.canvasId);
      self.canvas = new fabric.Canvas(self.canvasId);
    };

    self.loadJson = function(json) {
      self.canvas.loadFromJSON(json, self.canvas.renderAll(self.canvas));
    };

    self.loadShape = function(shapePath, shapeOptions) {
      var opt = shapeOptions || {}
          , def = $q.defer();

      fabric.loadSVGFromURL(shapePath, function(objects, options) {
        var object = fabric.util.groupSVGElements(objects, options);

        object.top = opt.top || 0;
        object.left = opt.left || 0;
        object.angle = opt.angle || 0;
        object.opacity = opt.opacity || 100;
        object.rotatingPointOffset = opt.rotatingPointOffset || self.rotatingPointOffset;
        object.padding = opt.padding || 0;
        object.borderColor = opt.borderColor || 'EEF6FC';
        object.cornerColor = opt.cornerColor || 'rgba(64, 159, 221, .3)';
        object.cornerSize = opt.cornerSize || 7;
        object.transparentCorners = !!opt.transparentCorners;
        object.hasControls = !!opt.hasControls;
        object.hasBorders = !!opt.hasBorders;
        object.hoverCursor = opt.hoverCursor || 'pointer';
        object.lockRotation = !!opt.lockRotation;
        object.lockScalingX = !!opt.lockScalingX;
        object.lockScalingY = !!opt.lockScalingY;
        object.lockMovementX = !!opt.lockMovementX;
        object.lockMovementY = !!opt.lockMovementY;

        var stroke = opt.stroke || '#000';
        var fill = opt.fill || '#0088cc'

        if (object.isSameColor && object.isSameColor() || !object.paths) {
          object.setFill(fill);
        } else if (object.paths && opt.stroke === undefined ) {
          for (var i = 0; i < object.paths.length; i++) {
            object.paths[i].fill(fill);
          }
        }

        if (opt.stroke !== undefined){
          for (var i = 0; i < object.paths.length; i++) {
            object.paths[i].stroke = stroke;
          }
        }

        self.canvas.add(object);
        object.active = true;
        object.bringToFront();

        def.resolve();
      });

      return def.promise;
    };

    self.addImage = function(image, imageOptions) {
      var opt = imageOptions || {}
          , def = $q.defer();

      fabric.Image.fromURL(image, function (object) {
        object.top = opt.top || 0;
        object.left = opt.left || 0;
        object.opacity = opt.opacity || 1;
        object.padding = opt.padding || 0;
        object.borderColor = opt.borderColor || 'EEF6FC';
        object.cornerColor = opt.cornerColor || 'rgba(64, 159, 221, .3)';
        object.cornerSize = opt.cornerSize|| 7;
        object.rotatingPointOffset = opt.rotatingPointOffset || self.rotatingPointOffset;
        object.transparentCorners = !!opt.transparentCorners; //Default value: false
        object.hasControls = !!opt.hasControls;               //Default value: false
        object.hasBorders = !!opt.hasBorders;                 //Default value: false
        object.perPixelTargetFind = !!opt.perPixelTargetFind;
        object.targetFindTolerance = opt.targetFindTolerance || 0;
        object.hoverCursor = opt.hoverCursor || 'pointer';
        object.lockRotation = !!opt.lockRotation;
        object.lockScalingX = !!opt.lockScalingX;
        object.lockScalingY = !!opt.lockScalingY;
        object.lockMovementX = !!opt.lockMovementX;
        object.lockMovementY = !!opt.lockMovementY;

        self.canvas.add(object);
        object.active = true;
        object.bringToFront();

        def.resolve();
      });

      return def.promise;
    };

    self.addFilter = function (filterName, options, object) {
      options = options || {};
      object = object || self.canvas.getActiveObject();

      if(!object)
        return;

      object.filters.push(new fabric.Image.filters[filterName](options));
    }

    self.applyFilters = function (object) {
      object = object || self.canvas.getActiveObject();

      if(!object)
        return;

      object.applyFilters(self.canvas.renderAll.bind(self.canvas));
    }

    self.addText = function(str, textOptions) {
      str = str || "New Text";
      var opt = textOptions || {};

      var text = new fabric.Text(str, {
        left: opt.left || 0,
        top: opt.top || 0,
        color: opt.color || '#454545',
        fontFamily: opt.fontFamily || 'Open Sans',
        fontWeight: opt.fontWeight || '',
        textDecoration: opt.textDecoration || '',
        fontStyle: opt.fontStyle || '',
        textAlign: opt.textAlign ||'center',
        fontSize: opt.fontSize || '40',
        rotatingPointOffset: opt.rotatingPointOffset || self.rotatingPointOffset,
        angle: opt.angle || 0,
        padding: opt.padding || 5,
        borderColor: opt.borderColor || 'EEF6FC',
        cornerColor: opt.cornerColor || 'rgba(64, 159, 221, .3)',
        cornerSize: opt.cornerSize || 7,
        transparentCorners: opt.transparentCorners || false,
        hasRotatingPoint: true,
        centerTransform: true
      });

      self.canvas.add(text);
      text.active = true;
      text.bringToFront();
    };

    self.setBackgroundColor = function(color) {
      self.canvas.setBackgroundColor(color);
      update();
    };

    self.setOverlayImage = function (imageUrl) {
      var def = $q.defer();
      self.canvas.setOverlayImage(imageUrl, updateWithPromise(def) );
      return def.promise;
    }

    self.setWidth = function(width) {
      self.canvas.setWidth(width);
      update();
    };

    self.setHeight = function(height) {
      self.canvas.setHeight(height);
      update();
    };

    self.clearCanvas = function() {
      self.canvas.clear();
      self.canvas.setBackgroundColor('ffffff');
      update();
    };

    self.deselectActiveObject = function() {
      var object = self.canvas.getActiveObject();
      if (object) {
        object.active = false;
      }
    };

    self.deactivateAll = function() {
      self.canvas.deactivateAll().renderAll();
    };

    self.getCanvasData = function() {
      var data = self.canvas.toDataURL({
        width: self.canvas.getWidth(),
        height:  self.canvas.getHeight(),
        multiplier: multiplier
      });

      return data;
    };

    self.download = function(filename) {
      // If there is a focused object deselect it and after the download is
      // initialized reselct it.
      var object = self.canvas.getActiveObject();
      self.deselectActiveObject();

      // If zoom is less than 1 a small version is created with a lot of white space.
      var data = self.getCanvasData().replace("image/png", "image/octet-stream");
      filename = filename || 'Untitled Image.png';

      var link = document.createElement('a');
      link.download = filename;
      link.href = data;
      link.click();

      if (object) {
        object.active = true;
      }
    };

    self.removeSelected = function() {
      var activeObject = self.canvas.getActiveObject(),
      activeGroup = self.canvas.getActiveGroup();

      if (activeGroup) {
        var objectsInGroup = activeGroup.getObjects();
        self.canvas.discardActiveGroup();
        objectsInGroup.forEach(function(object) {
          self.canvas.remove(object);
        });
      } else if (activeObject) {
        self.canvas.remove(activeObject);
      }
    };

    self.getType = function() {
      return getActiveProp('type');
    };

    self.getOpacity = function() {
      return getActiveStyle('opacity') * 100;
    };
    self.setOpacity = function(value) {
      setActiveStyle('opacity', parseInt(value, 10) / 100);
    };

    self.getFill = function() {
      return getActiveStyle('fill');
    };

    self.setFill = function(value) {
      if (! self.canvas) {
        return;
      }

      // Yes this looks bad but it works for text and uploaded shapes who both
      // use the same prop.
      var object = self.canvas.getActiveObject();
      if (object) {
        if (object.type === 'text') {
          setActiveStyle('fill', value);
        } else {
          if (object.isSameColor && object.isSameColor() || !object.paths) {
            object.setFill(value);
          } else if (object.paths) {
            for (var i = 0; i < object.paths.length; i++) {
              object.paths[i].setFill(value);
            }
          }
          self.canvas.renderAll();
        }
      }
    };

    self.isBold = function() {
      return getActiveStyle('fontWeight') === 'bold';
    };
    self.toggleBold = function() {
      setActiveStyle('fontWeight',
      getActiveStyle('fontWeight') === 'bold' ? '' : 'bold');
    };
    self.isItalic = function() {
      return getActiveStyle('fontStyle') === 'italic';
    };
    self.toggleItalic = function() {
      setActiveStyle('fontStyle',
      getActiveStyle('fontStyle') === 'italic' ? '' : 'italic');
    };

    self.isUnderline = function() {
      return getActiveStyle('textDecoration').indexOf('underline') > -1;
    };
    self.toggleUnderline = function() {
      var value = self.isUnderline()
      ? getActiveStyle('textDecoration').replace('underline', '')
      : (getActiveStyle('textDecoration') + ' underline');

      setActiveStyle('textDecoration', value);
    };

    self.isLinethrough = function() {
      return getActiveStyle('textDecoration').indexOf('line-through') > -1;
    };
    self.toggleLinethrough = function() {
      var value = self.isLinethrough()
      ? getActiveStyle('textDecoration').replace('line-through', '')
      : (getActiveStyle('textDecoration') + ' line-through');

      setActiveStyle('textDecoration', value);
    };
    self.isOverline = function() {
      return getActiveStyle('textDecoration').indexOf('overline') > -1;
    };
    self.toggleOverline = function() {
      var value = self.isOverline()
      ? getActiveStyle('textDecoration').replace('overline', '')
      : (getActiveStyle('textDecoration') + ' overline');

      setActiveStyle('textDecoration', value);
    };

    self.getText = function() {
      return getActiveProp('text');
    };
    self.setText = function(value) {
      setActiveProp('text', value);
    };

    self.getTextAlign = function() {
      return capitalize(getActiveProp('textAlign'));
    };
    self.setTextAlign = function(value) {
      setActiveProp('textAlign', value.toLowerCase());
    };

    self.getFontFamilygetStrokeColor = function() {
      return getActiveProp('fontFamily').toLowerCase();
    };
    self.setFontFamily = function(value) {
      setActiveProp('fontFamily', value.toLowerCase());
    };

    self.getBgColor = function() {
      return getActiveProp('backgroundColor');
    };
    self.setBgColor = function(value) {
      setActiveProp('backgroundColor', value);
    };

    self.getFlipX = function() {
      return getActiveProp('flipX');
    };

    self.setFlipX = function(value) {
      setActiveProp('flipX', value);
    };

    self.toggleFlipX = function() {
      var value = self.getFlipX() ? false : true;
      self.setFlipX(value);
    };

    self.getTextBgColor = function() {
      return getActiveProp('textBackgroundColor');
    };
    self.setTextBgColor = function(value) {
      setActiveProp('textBackgroundColor', value);
    };

    self.getStrokeColor = function() {
      return getActiveStyle('stroke');
    };

    self.setStrokeColor = function(value) {
      setActiveStyle('stroke', value);
    };

    self.getStrokeWidth = function() {
      return getActiveStyle('strokeWidth');
    };

    self.setStrokeWidth = function(value) {
      setActiveStyle('strokeWidth', parseInt(value, 10));
    };

    self.getFontSize = function() {
      return getActiveStyle('fontSize');
    };

    self.setFontSize = function(value) {
      setActiveStyle('fontSize', parseInt(value, 10));
    };

    self.getLineHeight = function() {
      return getActiveStyle('lineHeight');
    };

    self.setLineHeight = function(value) {
      setActiveStyle('lineHeight', parseFloat(value, 10));
    };

    self.getBold = function() {
      return getActiveStyle('fontWeight');
    };

    self.setBold = function(value) {
      setActiveStyle('fontWeight', value ? 'bold' : '');
    };

    self.getCanvasBgColor = function() {
      return self.canvas.backgroundColor;
    };

    self.setCanvasBgColor = function(value) {
      self.canvas.backgroundColor = value;
      self.canvas.renderAll();
    };

    self.sendBackwards = function() {
      var activeObject = self.canvas.getActiveObject();
      if (activeObject) {
        self.canvas.sendBackwards(activeObject);
      }
    };

    self.sendToBack = function() {
      var activeObject = self.canvas.getActiveObject();
      if (activeObject) {
        self.canvas.sendToBack(activeObject);
      }
    };

    self.bringForward = function() {
      var activeObject = self.canvas.getActiveObject();
      if (activeObject) {
        self.canvas.bringForward(activeObject);
      }
    };

    self.bringToFront = function() {
      var activeObject = self.canvas.getActiveObject();
      if (activeObject) {
        self.canvas.bringToFront(activeObject);
      }
    };

    self.loadJson = function(json) {
      self.canvas.loadFromJSON(json);
      var obj = angular.fromJson(json);
      self.setWidth(obj.width);
      self.setHeight(obj.height);
    };

    return self;
  }])

  .directive('fabric', ['FabricService', '$timeout', function(FabricService, $timeout) {
    return {
      scope: {
        ngModel: '=',
        ngChange: '&'
      },
      restrict: 'A',
      link: function(scope, element) {
        fabric.Object.prototype.transparentCorners = false;

        function update() {
          $timeout(function() {
            scope.ngModel = FabricService.canvas.toJSON(['height', 'width', 'backgroundColor']);
            scope.ngChange();
          });
        }

        function initCanvas() {
          FabricService.element = element;
          FabricService.init(scope.ngModel);
        }

        function initListeners() {
          FabricService.canvas.on('canvas:modified', function(options) {
            update();
          });

          FabricService.canvas.on('object:modified', function(options) {
            FabricService.canvas.renderAll();
            update();
          });

          FabricService.canvas.on("object:selected", function(){
            $timeout(function() {
              update();
            });
          });

          FabricService.canvas.on("selection:cleared", function(){
            $timeout(function() {
              scope.fabricActiveObject = undefined;
            });
          });

          FabricService.canvas.on("after:render", function(){
            FabricService.canvas.calcOffset();
          });
        }

        initCanvas();
        initListeners();
      }
    };
  }]);
})(
  window.angular,
  window.fabric
);
