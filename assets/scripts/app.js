'use strict';

var fuck ="whit";

(function () {
  var clicks = 0, polyCss = '', css = '';
  var polyArry = new Object();

  var App = {
    elements: {
      polyContainer: document.querySelector('.poly-container'),
      scene: document.querySelector('.scene'),
      number: document.querySelector('.number'),
      pointsAmount: document.querySelector('.counter .amount'),
      clicksAmount: document.querySelector('.counter .clicks'),
      clear: document.querySelector('.clear'),
      crosshair: document.createElement('div')
    },
    init : function() {
      App.elements['crosshair'].className = 'follower crosshair';
      App.elements['scene'].appendChild(App.elements['crosshair']);

      this.events();
    },
    events : function() {
      App.utls.on(App.elements['polyContainer'], 'mousemove mouseleave', function(e) {
        var opacity = e.type === 'mousemove' ? 1 : 0;
        App.elements['crosshair'].setAttribute('style', 'opacity:'+opacity+';left:'+e.pageX+'px; top:'+e.pageY+'px;');
      });

      App.utls.on(App.elements['number'], 'change', function(e) {
        App.elements['pointsAmount'].innerHTML = this.value;
        clicks = 0, polyCss = '';
      });
      App.utls.on(App.elements['polyContainer'], 'click', function(e) {
        var mouseX = e.pageX,  mouseY = e.pageY;

        var X = App.elements['polyContainer'].offsetLeft,
        Y = App.elements['polyContainer'].offsetTop,
        polyWidth= App.elements['polyContainer'].offsetWidth,
        polyHeight= App.elements['polyContainer'].offsetHeight;

        var shapeX = mouseX - X - 5,
        shapeY = mouseY - Y - 5,
        percentX = shapeX / polyWidth,
        percentY = shapeY / polyHeight;

        console.log(percentX);

        var normalisedX = parseFixed2(percentX),
        normalisedY = parseFixed2(percentY);

        function parseFixed2(value) {
          return parseFloat((value) * 100).toFixed(2)
        };

        var points =  parseFloat(App.elements['number'].value);
        clicks += 1;
        console.log(clicks);
        /*
        * Reset clicks / stored polygon CSS
        * Remove all points from scene
        */
        if (clicks > points) {
          console.log('reset clicks');
          clicks = 1, polyCss = '';
        }

        App.createPoly(clicks, points, normalisedY, normalisedX, e);
      });
    },
    createPoly : function(clicks, points, normalisedY, normalisedX, e) {
      var point = document.createElement('div');
      point.className = "point";
      App.elements['polyContainer'].appendChild(point);
      point.style.top = e.offsetY-6.5+'px';
      point.style.left = e.offsetX-6.5+'px';

      /*
      * get First click values
      * Show how many clicks have been made
      */
      console.log(clicks);
      if (clicks < points) {

        polyCss = polyCss + normalisedX + '% ' + normalisedY + '%, ';
        App.elements['clicksAmount'].innerHTML = clicks;
        App.elements['pointsAmount'].innerHTML = points;

      }

      /*
      * get last click values
      * add poly to scene
      * append/update css in head with newly added polygon
      */
      else if (clicks == points) {

        var Mstyle = document.getElementById('style-export');
        if(Mstyle){ Mstyle.remove(); }

        // Add last
        polyCss = polyCss + normalisedX + '% ' + normalisedY+'%';

        var createPoly = document.createElement('div'),
        legendItem = document.createElement('div');

        // Append and add attributes to new polygon
        createPoly.className = "poly";
        // give polygon unique ID
        createPoly.setAttribute('id', "poly-"+document.querySelectorAll('.poly').length);
        // give polygon a random hue of a color
        createPoly.setAttribute("style", 'background:'+randomColor({hue: 'yellow',luminosity: 'light'})+';');
        // Append polygon to scene
        App.elements['polyContainer'].appendChild(createPoly);

        legendItem.innerHTML = "Polygon ID #"+createPoly.getAttribute('id') + '<textarea class="code" data-poly="'+polyCss+'">'+polyCss+'</textarea>';
        legendItem.setAttribute('data-poly-id', createPoly.getAttribute('id'));
        legendItem.className = "lengend-item";

        var el = document.querySelector('.lengend-items');
        el.insertBefore(legendItem, el.firstChild);


        this.buildStyleSheet(clicks, createPoly);

        /*
        * Highlight polygon on scene when hovering over it in legend
        */
        App.utls.on(legendItem, 'mouseenter mouseleave', function(e) {
          var id = this.getAttribute('data-poly-id'),
          el = document.getElementById(id);
          if (e.type === 'mouseenter') {
            el.className += " active";
          } else {
            el.classList.remove("active");
          }
        });

        /*
        * Change Polygon when updating it in legend
        * @todo: update css in head
        */
        App.utls.on(legendItem.querySelector('.code'), 'change keydown', function(e) {
          if (e.type === 'change') {
              var id = this.parentElement.getAttribute('data-poly-id'),
              polyCss = this.value;
              createPoly.setAttribute("style", '-webkit-clip-path: polygon('+polyCss+'); background:'+randomColor({hue: 'yellow',luminosity: 'light'})+';');
          } else if(e.type === 'keydown' && e.keyCode == 13) {
              e.preventDefault();
              this.blur();
          }
        });

        document.querySelectorAll(".point").remove();
        App.elements['clicksAmount'].innerHTML = 0;
      }

      /*
      * Add/remove class to crosshair whenever scene is clicked
      */
      App.elements['crosshair'].className += " active";
      setTimeout(function() {
        App.elements['crosshair'].classList.remove("active");
      }, 100);

    },
    /*
    * Build styleSheet
    */
    buildStyleSheet : function(clicks, createPoly) {
      var Parameters=[],
      len = clicks,
      key='#'+createPoly.getAttribute('id');

       polyArry[key] = '';
      Parameters.push(polyArry);
      var len = Object.keys(polyArry).length - 1;

      var head = document.head || document.getElementsByTagName('head')[0],
          style = document.createElement('style');

      css += Object.keys(polyArry)[len]+'{-webkit-clip-path: polygon('+polyCss+');}\n';

      style.type = 'text/css';
      style.id = "style-export";
      if (style.styleSheet){
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
      head.appendChild(style);
    }
  };

  App.utls = {
    // bind multiple events at once
    on: function(element,events,handler){
        if(!_.isString(events)){
            App.util.log(element+' is not a string.');
        }else{
            var eventArray = events.split(" ");
            _.each(eventArray, function(event){
                element.addEventListener(event, handler, false);
            });
        }
    },
    // bind remove multiple events at once
    off: function(element,events,handler){
        if(!_.isString(events)){
            App.util.log(element+' is not a string.');
        }else{
            var eventArray = events.split(" ");
            _.each(eventArray, function(event){
                element.removeEventListener(event, handler, false);
            });
        }
    },
    log: function(obj,level){
        var lvl = level || 1;
        if(App.data.debug > lvl){
            if(lvl === 0){
                console.error(obj);
            }else{
                console.log(obj);
            }
        }
    },
  };

  App.init();
}());

/*
* @todo: Clear scene
*/
// App.elements['clear'].addEventListener('click', function(e) {
//   clearAmount();
// });
// function clearAmount() {
//   document.querySelectorAll(".poly").remove();
//   document.querySelectorAll(".lengend-item").remove();
//   document.querySelectorAll(".point").remove();
//   //App.elements['clicksAmount'].innerHTML = 0;
// };

Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
  for(var i = this.length - 1; i >= 0; i--) {
    if(this[i] && this[i].parentElement) {
        this[i].parentElement.removeChild(this[i]);
    }
  }
}
