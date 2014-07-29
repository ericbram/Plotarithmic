/**
 * Created by ebram on 7/22/2014.
 */

function EventsHandler(idval, mainDiv, boundsVar, dataFormatter, plotterVar) {
    var self = this;
    var div = mainDiv;
    var ID = idval;
    var plotter = plotterVar;
    var bounds = boundsVar;
    var df = dataFormatter;
    var activePoint = -1;
    var startZoom = [];
    var isZooming = false;

    $(function() {
        self.div = mainDiv;

        // handle the mousedown event,
        // this can be a drag or a zoom depending
        // on where it's clicked
        $(div).on('mousedown', function (e) {
            if (e.button != 0) {
                // not a left click
                return;
            }
            var screencoords = [e.pageX - this.offsetLeft, e.pageY - this.offsetTop];

            // need to see if these screen coords are within a control point
            var pt = plotter.IsPointInsideCtrlPt(screencoords);
            if (pt > -1) {
                // it's time to start a drag
                activePoint = pt;
                showTooltip(screencoords[0], screencoords[1], screencoords[0] + "," + screencoords[1]);
            }
            else {
                // it's time to start a zoom
                isZooming = true;
                startZoom = [e.pageX - this.offsetLeft, e.pageY- this.offsetTop];
                $(div).append('<div id=\"PlotarithmicSelector\" style=\"position: absolute; border: 2px solid white; background-color:rgba(255, 255, 255, 0.3)\"></div>');
                $("#PlotarithmicSelector").css('left', e.pageX).css('top', e.pageY).css('width', '0px').css('height', '0px');
            }
        });
    });
    $(document).on('mousemove', function (e) {
        // check to see if we are actively dragging a control point
         if (activePoint != -1) {

             // control point is being moved
             e.target.style.cursor='default';

             var xval = e.pageX;
             var yval = e.pageY;

             // do bounds checking
             if (xval < bounds['minX']) {
                 xval = bounds['minX'];
             } else if (xval > bounds['maxX']) {
                 xval = bounds['maxX'];
             }
             if (yval < bounds['minY']) {
                 yval = bounds['minY'];
             } else if (yval > bounds['maxY']) {
                 yval = bounds['maxY'];
             }

             // get the coordinates of the mouse (in relation to the canvas, not the page)
             xval = xval - $(self.div)[0].offsetLeft;
             yval = yval - $(self.div)[0].offsetTop;

             // use the size of the control point as well to help put the tooltip in a friendly place
             var sz = ControlSize;
              $("#" + ID + '_ctrl' + activePoint + 'div').css('left', xval - sz/2).css('top', yval - sz/2);

             // get the x,y graph values of the mouse location
             var location =  plotter.ScreenToPointLocation([xval, yval]);

             // update the tooltip
             $("#tooltipGraph").text(Math.round(location[0]) + "," + Math.round(location[1]*100)/100).css('top', yval - sz - 20).css('left', xval + sz + 40);

             // trigger a mousemove over the DOM for any software to hook into
             $.event.trigger("PlotarithmicMouseMove", [activePoint, location[0], location[1]]);
         } if (isZooming) {
            // handle zooming
            e.target.style.cursor='default';
            var xval = e.pageX;
            var yval = e.pageY;

            // do bounds checking
            if (xval < bounds['minX']) {
                xval = bounds['minX'];
            } else if (xval > bounds['maxX']) {
                xval = bounds['maxX'];
            }
            if (yval < bounds['minY']) {
                yval = bounds['minY'];
            } else if (yval > bounds['maxY']) {
                yval = bounds['maxY'];
            }

            // get the coordinates of the mouse (in relation to the canvas, not the page)
            xval = xval - $(self.div)[0].offsetLeft;
            yval = yval - $(self.div)[0].offsetTop;

            var leftmost = xval < startZoom[0] ? xval : startZoom[0];
            var width = xval < startZoom[0] ? startZoom[0] - xval : xval - startZoom[0];
            var topmost = yval < startZoom[1] ? yval : startZoom[1];
            var height = yval < startZoom[1] ? startZoom[1] - yval :  yval - startZoom[1];
            $("#PlotarithmicSelector").css('left', leftmost).css('top', topmost).css('width', width + 'px').css('height', height + 'px');
        }
    });

    $(document).on('mouseup', function (e) {
        if (activePoint != -1) {
            $("#tooltipGraph").remove();
            // set new point location
            var xval = e.pageX;
            var yval = e.pageY;
            // do bounds checking
            if (xval < bounds['minX']) {
                xval = bounds['minX'];
            } else if (xval > bounds['maxX']) {
                xval = bounds['maxX'];
            }
            if (yval < bounds['minY']) {
                yval = bounds['minY'];
            } else if (yval > bounds['maxY']) {
                yval = bounds['maxY'];
            }

            var xval = xval - $(self.div)[0].offsetLeft;
            var yval = yval - $(self.div)[0].offsetTop;

            var location = plotter.ScreenToPointLocation([xval, yval]);
            df.SetControlPoint(activePoint, location);
            $.event.trigger("PlotarithmicMouseUp", [activePoint, location[0], location[1]]);

            // remove active point
            activePoint = -1;
        }
        if (isZooming) {
            // remove the zoom graphic
            $("#PlotarithmicSelector").remove();

            var xval = e.pageX - $(self.div)[0].offsetLeft;
            var yval = e.pageY - $(self.div)[0].offsetTop;
            var leftmost = xval < startZoom[0] ? xval : startZoom[0];
            var width = xval < startZoom[0] ? startZoom[0] - xval : xval - startZoom[0];
            var topmost = yval < startZoom[1] ? yval : startZoom[1];
            var height = yval < startZoom[1] ? startZoom[1] - yval :  yval - startZoom[1];

            var topleft = plotter.ScreenToPointLocation(leftmost, topmost);
            var bottomright = plotter.ScreenToPointLocation(leftmost + width, topmost + height);

            var minX = topleft[0];
            var maxX = bottomright[0];
            var minY = topleft[1];
            var maxY = bottomright[1];

            $.event.trigger("PlotarithmicZoom", [minX, maxX, minY, maxY]);

            // zoom is over
            isZooming =false;
        }
    });



    function showTooltip(x, y, contents) {
        $("<div id='tooltipGraph'>" + contents + "</div>").css({
            position: "absolute",
            display: "iwell tnline",
            top: y - ControlSize - 20,
            left: x + ControlSize + 40,
            border: "1px solid white",
            padding: "2px",
            color: "#fff",
            background: "#555"
        }).appendTo("body");
    }
}