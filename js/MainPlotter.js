function MainPlotter(uniqueID, contextVar, boundsVar, sentDiv) {
    var self = this;
    var baseDiv = sentDiv;
    var ID = uniqueID;
    var context = contextVar;
    var bounds = boundsVar;
    var data;


    var pixelsX, pixelsY;
    var logDiffX, diffY;
    var minX, maxX;
    var minY, maxY;

    this.SetData = function (newData) {
        self.data = newData;
    }

    this.Graph = function () {
        SetupBoundaries();
        $.each(self.data, function (index, value) {
            // inside this array is an array of x,y coordinates

            // do not draw if not visible
            if (!value.visible) {
                return;
            }

            // use lastY to avoid drawing unnecessary lines
            var last = self.PointToScreenLocation(value.data[0][0], value.data[0][1]);
            var lastdrawn = self.PointToScreenLocation(value.data[0][0], value.data[0][1]);
            var coord;
            for (var i = 0; i < value.data.length; i++) {
                // inside here is a single x,y coordinate at value.data[i]
                coord = self.PointToScreenLocation(value.data[i][0], value.data[i][1]);
                // calculate next point and draw line to it

                // if we didnt even move over a pixel, don't bother
                if (Math.round(coord[0]) == Math.round(last[0]))
                    continue;

                // draw changing line
                if (lastdrawn[1] != coord[1]) {
                    context.beginPath();
                    context.lineWidth = 1;
                    context.moveTo(lastdrawn[0] + 0.5, lastdrawn[1] + 0.5);
                    context.lineTo(coord[0] + 0.5, coord[1] + 0.5);
                    context.strokeStyle = value.color;
                    context.closePath();
                    context.stroke();

                    lastdrawn = coord;
                }

                last = coord;
            }

            if (lastdrawn[0] != coord[0]) {
                context.beginPath();
                context.lineWidth = 1;
                context.moveTo(lastdrawn[0] + 0.5, lastdrawn[1] + 0.5);
                context.lineTo(coord[0] + 0.5, coord[1] + 0.5);
                context.strokeStyle = value.color;
                context.closePath();
                context.stroke();
            }


            // now it's time to draw the control point

            // don't draw if not visible
            if (!value.control.visible) {
                return;
            }

            var ctrlLoc = self.PointToScreenLocation(value.control.location[0], value.control.location[1]);
            var ctrlID = ID + '_ctrl' + index;
            var sizeval = 16;
            while ($("#" + ctrlID + 'div').length > 0) {
                $("#" + ctrlID + 'div').remove();
            }

            $(baseDiv).append('<div id=\"' + ctrlID + 'div\"/>');
            $("#" + ctrlID + "div").append('<canvas id=\"' + ctrlID + '\"/>');
            $("#" + ctrlID + "div").css('position', 'absolute')
                .css('left', ctrlLoc[0] - sizeval / 2)
                .css('top', ctrlLoc[1] - sizeval / 2 + TOP_SIZE)
                .css('width', sizeval)
                .css('height', sizeval);

            var tmpcanvas = document.getElementById(ctrlID);
            var tmpcontext = tmpcanvas.getContext('2d');

            tmpcanvas.width = sizeval;
            tmpcanvas.height = sizeval;

            tmpcontext.beginPath();
            tmpcontext.arc(sizeval / 2, sizeval / 2, sizeval / 2, 0, 2 * Math.PI, false);
            tmpcontext.fillStyle = value.control.background;
            tmpcontext.fill();
            tmpcontext.closePath();

            tmpcontext.beginPath();
            tmpcontext.fillStyle = value.control.forecolor;
            var divisor = index + 1 >= 10 ? 7 : 3;
            tmpcontext.fillText(index + 1, sizeval / divisor, sizeval / 1.5);
            tmpcontext.closePath();
        });
    }

    // this is called sparingly to save on calculation time
    // when drawing the graph
    function SetupBoundaries() {
        // get the pixels allowed
        pixelsX = bounds['maxX'] - bounds['minX']
        // get the log difference in X
        maxX = bounds['maxXValue'];
        minX = bounds['minXValue'];
        logDiffX = log10(maxX) - log10(minX);

        // get the pixels in height allowed
        pixelsY = bounds['maxY'] - bounds['minY'];
        maxY = bounds['maxYValue'];
        minY = bounds['minYValue'];
        // difference (linear) in Y
        diffY = maxY - minY;
    }

    this.ScreenToPointLocation = function (point) {
        // get the log difference between max and min x values
        var difflog = log10(maxX) - log10(minX);

        // get the percentage that the click was across the horizontal plane
        var perc = (point[0] - LEFT_SIZE)  / pixelsX;

        // convert that percentage to an X value
        var xval = Math.pow(10, log10(minX) + perc * difflog);

        var percY = (point[1] - TOP_SIZE) / pixelsY;

        var yval = maxY - percY * diffY;

        return [xval, yval];
    }

    this.PointToScreenLocation = function (dataX, dataY) {
        // get the log of the value to convert
        var logData = log10(dataX);
        // get the percentage this value is in relation to the entire range
        var percX = (logData - log10(minX)) / logDiffX;
        // multiply this percentage by the width in pixels to get the pixel over
        var xCoord = pixelsX * percX + LEFT_SIZE;

        var yVal = -1;
        // get the actual distance from the max value
        if (dataY < 0) {
            yVal = maxY + Math.abs(dataY);
        } else {
            yVal = maxY - dataY;
        }
        // get the percentage this value is in relation to the entire range
        var percY = yVal / diffY;
        // multiply this percentage by the width in pixels to get the pixel over
        var yCoord = pixelsY * percY;

        return [xCoord, yCoord];
    }

    this.IsPointInsideCtrlPt = function (point) {
        for (var i = 0; i < self.data.length; i++) {
            if (self.data[i].visible && self.data[i].control.visible) {
                // this point is visible, see if it matches
                var screenloc = self.PointToScreenLocation(self.data[i].control.location[0], self.data[i].control.location[1]);
                var dist = Math.sqrt(Math.pow(screenloc[0] - point[0], 2) + Math.pow(screenloc[1] - point[1], 2));
                if (dist < ControlSize / 2) {
                    // it's within the radius!
                    // return this instance
                    return i;
                }
            }
        }
        return -1;
    }
}