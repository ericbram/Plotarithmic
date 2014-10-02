var ControlSize = 16;
var LEFT_SIZE = 70;
var BOTTOM_SIZE = 50;
var TOP_SIZE = 20;
var RIGHT_SIZE = 50;

function Plotarithmic(uniqueID, dataval, graphDiv, bounds, options) {
    try {
        if (typeof(options) != 'undefined') {
            ControlSize = options['ControlSize'];
            LEFT_SIZE = options['left'];
            RIGHT_SIZE = options['right'];
            TOP_SIZE = options['top'];
            BOTTOM_SIZE = options['bottom'];
        }
    }  catch (Exception) {
        console.error("no options defined, or defined improperly");
    }
    var firstrun = true;
    var self = this;
    var bounds = {minX: LEFT_SIZE, minY: TOP_SIZE, maxX: graphDiv.width() - RIGHT_SIZE, maxY: graphDiv.height() - BOTTOM_SIZE, minXValue: bounds['minXValue'], maxXValue: bounds['maxXValue'], minYValue: bounds['minYValue'], maxYValue: bounds['maxYValue']};
    var minYticks = 8;
    var maxYticks = 16;
    var dfLocal, grapherLocal, events;

    Setup(dataval, bounds, options);


    function Setup(Maindata, bounds, options) {



        $(graphDiv).append('<canvas id=\"' + uniqueID + 'innerGraphCanvas\"/>');
        var canvas = document.getElementById(uniqueID + 'innerGraphCanvas');
        var context = canvas.getContext('2d');
        canvas.width = bounds['maxX'] + bounds['minX'];
        canvas.height = bounds['maxY'] + bounds['minY'];
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


