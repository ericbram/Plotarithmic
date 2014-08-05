function Plotarithmic(uniqueID, dataval, graphDiv, bounds) {
    var firstrun = true;
    var self = this;
    var bounds = {minX: LEFT_SIZE, minY: 0, maxX: graphDiv.width(), maxY: graphDiv.height() - LEFT_SIZE, minXValue: bounds['minXValue'], maxXValue: bounds['maxXValue'], minYValue: bounds['minYValue'], maxYValue: bounds['maxYValue']};
    var minYticks = 8;
    var maxYticks = 16;
    var dfLocal, grapherLocal, events;

    Setup(dataval, bounds);


    function Setup(Maindata, bounds) {
        $(graphDiv).append('<canvas id=\"' + uniqueID + 'innerGraphCanvas\"/>');
        $("#" + uniqueID + "innerGraphCanvas").css('position', 'absolute').css('left', bounds['minX']).css('top', bounds['minY']);
        var canvas = document.getElementById(uniqueID + 'innerGraphCanvas');
        var context = canvas.getContext('2d');
        canvas.width = bounds['maxX'] - bounds['minX'];
        canvas.height = bounds['maxY'] - bounds['minY'];
        dfLocal = new DataFormatter();
        dfLocal.SetData(Maindata);

        var bd = new BackgroundDrawer(uniqueID, context, bounds);
        grapherLocal = new MainPlotter(uniqueID, context, bounds, graphDiv);
        grapherLocal.SetData(dfLocal.GetData());


        bd.CreateBackGround(minYticks, maxYticks);
        grapherLocal.Graph();
        bd.FinishingTouches();
        if (firstrun) {
            events = new EventsHandler(uniqueID, graphDiv, bounds, dfLocal, grapherLocal);
            firstrun = false;
        } else {
              events.UpdateObjects(dfLocal, grapherLocal);
        }
    }

    this.ReGraph = function (newData, newbounds) {
        $("#" + uniqueID + "innerGraphCanvas").remove();
        $.each(newbounds, function (key, value) {
            if (key in bounds) {
                bounds[key] = value;
            }
        });
        Setup(newData, bounds);
    }
}


