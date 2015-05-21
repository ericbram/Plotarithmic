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
    self.df = df;
    self.plotter = plotter;
    var activePoint = -1;
    var activeDataPoint = -1;
    var startZoom = [];
    var isZooming = false;

    var dragtype, dragStartX, dragStartY;

    this.UpdateObjects = function (dfvar, plot) {
        self.plotter = plot;
        self.df = dfvar;
    }

    $(function () {
        self.div = mainDiv;

        // handle the mousedown event,
        // this can be a drag or a zoom depending
        // on where it's clicked
        $(div).on('mousedown', function (e) {
            if (e.button != 0) {
                // not a left click
                return;
            }
            var screencoords = [
                    e.pageX - $(this).parent().offset().left,
                    e.pageY - $(this).parent().offset().top - parseInt($(this).parent().css('padding-top'))];

            // need to see if these screen coords are within a control point
            var ptTmp = self.plotter.IsPointInsideCtrlPt(screencoords);
            var pt = ptTmp[0];
            activeDataPoint = ptTmp[1];
            if (pt > -1) {

                // it's time to start a drag... if it's draggable
                dragtype = self.df.ControlPointDraggableType(pt);

                // see if it's a specific type of drag.
                // at this point, also store the starting x and y
                // just so we don't have to compute that during every move event
                if (dragtype == "XONLY" || dragtype == "YONLY" || dragtype) {
                    activePoint = pt;
                    dragStartX = screencoords[0];
                    dragStartY = screencoords[1];
                    showTooltip(screencoords[0], screencoords[1], screencoords[0] + "," + screencoords[1]);
                }
            }
            else {
                // it's time to start a zoom
                startZoom = [
                        e.pageX - $(this).parent().offset().left,
                        e.pageY - $(this).parent().offset().top - parseInt($(this).parent().css('padding-top'))];
                if (startZoom[0] < bounds['minX'] || startZoom[0] > bounds['maxX']) {
                    return;
                }
                if (startZoom[1] < bounds['minY'] || startZoom[1] > bounds['maxY']) {
                    return;
                }

                isZooming = true;
                $(div).append('<div id=\"PlotarithmicSelector\" style=\"display: none; position: absolute; border: 2px solid white; background-color:rgba(255, 255, 255, 0.3)\"></div>');
                $("#PlotarithmicSelector").css('left', e.pageX).css('top', e.pageY).css('width', '0px').css('height', '0px');
            }
        });
    });

    $(document).on('mousemove', function (e) {
        // check to see if we are actively dragging a control point
        if (activePoint != -1 || isZooming) {

            try {
                e.target.style.cursor = 'default';
            }
            catch (Exception) {
            }
            // get the coordinates of the mouse (in relation to the canvas, not the page)

            var xval = e.pageX;
            var yval = e.pageY;

            xval = xval - $(self.div).parent().offset().left;
            yval = yval - $(self.div).parent().offset().top - parseInt($(self.div).parent().css('padding-top'));

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

            if (activePoint != -1) {

                // check to see if there's a limit to the drag point
                // if there is, do not let the user drag outside of the axis bounds
                if (dragtype == "XONLY") {
                    yval = dragStartY;
                } else if (dragtype == "YONLY") {
                    xval = dragStartX;
                }

                // use the size of the control point as well to help put the tooltip in a friendly place
                var sz = ControlSize;
                $("#" + ID + '_ctrl' + activePoint + 'div').css('left', xval - sz / 2).css('top', yval - sz / 2);

                // get the x,y graph values of the mouse location
                var location = self.plotter.ScreenToPointLocation([xval, yval]);

                // sometimes there's a bit of a round going on with regards to the dragging of the point
                // this just evens it out for display purposes
                if (dragtype == "XONLY") {
                    location[1] = 0;
                } else if (dragtype == "YONLY") {
                    location[0] = 0;
                }

                // update the tooltip with the tooltips location and value
                $("#tooltipGraph").text(Math.round(location[0]) + "," + Math.round(location[1] * 100) / 100)
                    .css('display', 'inline')
                    .css('top', yval - sz - 20 + $(self.div).parent().offset().top + parseInt($(self.div).parent().css('padding-top')))
                    .css('left', xval + sz + $(self.div).parent().offset().left);

                // trigger a mousemove over the DOM for any software to hook into
                $(div).trigger("PlotarithmicMouseMove", [activeDataPoint, location[0], location[1]]);
            }
            if (isZooming) {
                // handle zooming

                // change the current size of the zoom box
                var leftmost = xval < startZoom[0] ? xval : startZoom[0];
                var width = xval < startZoom[0] ? startZoom[0] - xval : xval - startZoom[0] - 4;
                var topmost = yval < startZoom[1] ? yval : startZoom[1];
                var height = yval < startZoom[1] ? startZoom[1] - yval : yval - startZoom[1] - 4;

                $("#PlotarithmicSelector").css('left', leftmost).css('top', topmost).css('width', width + 'px').css('height', height + 'px').css('display', 'inline');
            }
        }
    });

    $(document).on('mouseup', function (e) {

        if (activePoint != -1 || isZooming) {
            // set new point location
            var xval = e.pageX;
            var yval = e.pageY;


            xval = xval - $(self.div).parent().offset().left;
            yval = yval - $(self.div).parent().offset().top - parseInt($(self.div).parent().css('padding-top'));

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

            if (activePoint != -1) {

                // check to see if there's a limit to the drag point
                // if there is, do not let the user drag outside of the axis bounds
                if (dragtype == "XONLY") {
                    yval = dragStartY;
                } else if (dragtype == "YONLY") {
                    xval = dragStartX;
                }

                // remove the tooltip because the drag is done
                $("#tooltipGraph").remove();

                // update the value for the control point
                var location = self.plotter.ScreenToPointLocation([xval, yval]);
                self.df.SetControlPoint(activePoint, location);

                // trigger the mouseup event for any handler code to process
                $(div).trigger("PlotarithmicMouseUp", [activeDataPoint, location[0], location[1]]);

                // remove active point since drag is done
                activePoint = -1;
            }
            if (isZooming) {
                // remove the zoom graphic
                while ($("#PlotarithmicSelector").length > 0) {
                    $("#PlotarithmicSelector").remove();
                }


                // calculate zoom bounds
                var leftmost = xval < startZoom[0] ? xval : startZoom[0];
                var width = xval < startZoom[0] ? startZoom[0] - xval : xval - startZoom[0];
                var topmost = yval < startZoom[1] ? yval : startZoom[1];
                var height = yval < startZoom[1] ? startZoom[1] - yval : yval - startZoom[1];

                var topleft = self.plotter.ScreenToPointLocation([leftmost, topmost]);
                var bottomright = self.plotter.ScreenToPointLocation([leftmost + width, topmost + height]);

                var minX = topleft[0];
                var maxX = bottomright[0];
                var minY = bottomright[1];
                var maxY = topleft[1];

                if (startZoom[0] == xval && startZoom[1] == yval) {
                    // don't do anything, this was
                    // just a mouse click, and we don't
                    // really want to be zooming if we
                    // haven't changed location
                }
                else {
                    // trigger zoom event for user to handle with the new bounds
                    // since we do not have the data in order to calculate new points here,
                    // we cannot do the zoom within this library
                    $(div).trigger("PlotarithmicZoom", {xaxis: [minX, maxX], yaxis: [minY, maxY]});
                }
                // zoom is over
                isZooming = false;
            }
        }
    });

    function showTooltip(x, y, contents) {
        $("<div id='tooltipGraph'>" + contents + "</div>").css({
            position: "absolute",
            display: "none",
            top: y - ControlSize - 20,
            left: x + ControlSize + 40,
            border: "1px solid white",
            padding: "2px",
            color: "#fff",
            background: "#555"
        }).appendTo("body");
    }
}