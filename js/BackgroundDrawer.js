function BackgroundDrawer(uniqueID, contextVar, boundsVar) {
    var self = this;
    var ID = uniqueID;
    var context = contextVar;
    var bounds = boundsVar;
    var XTicks = [];
    var YTicks = [];
    var MAJOR_TICKWIDTH = 1;
    var MINOR_TICKWIDTH = 0.3;
    var TickTypeEnum = {
        MajorTick: 0,
        MinorTick: 1
    }

    this.CreateBackGround = function (minYticks, maxYticks) {
        DrawOuterBorder();
        DrawXAxis();
        DrawYAxis(minYticks, maxYticks);
    }

    function DrawYAxis(minticks, maxticks) {
           var diffY = bounds['maxYValue'] - bounds['minYValue'];

        // try to see if there is a whole # divisor
        // that falls within the min and max ticks

        var tickAdder = -1;
        var numberOfTicks = -1;
        for (var i = minticks + 1; i < maxticks - 1; i++) {
            if (diffY % (i-1) == 0) {
                // this is a whole # divisor, this will be our graph multiplier
                tickAdder = diffY / (i-1);
                numberOfTicks = i;
                break;
            }
        }

        // if in here, we failed to find a whole number divisor
        // so we'll just use the minimum number of ticks
        // and accept that the values on the side will be decimal
        if (numberOfTicks == -1) {
             numberOfTicks = minticks;
          tickAdder = diffY/(minticks - 1);
        }

        var currentY = bounds['maxYValue'];

        // loop to actually create the Y ticks and draw them
        for (var i = 0; i < numberOfTicks; i++) {
            var newY = {YVal: currentY, TickLocation: i * ((bounds['maxY'] - bounds['minY']) / (numberOfTicks - 1))};
            YTicks.push(newY);
            context.beginPath();
            context.lineWidth = 0.3;
            context.moveTo(0.5, newY.TickLocation + 0.5);
            context.lineTo(bounds['maxX'] - bounds['minX'] + 0.5,newY.TickLocation + 0.5);
            context.strokeStyle = '#ffffff';
            context.closePath();
            context.stroke();

            currentY -= tickAdder;
        }
    }

    function DrawXAxis() {
        var minXPoint = bounds['minXValue'];
        var maxXPoint = bounds['maxXValue'];
        // Determine, in a log sense,
        // how far this major ticks need to go
        var majorLoop = Math.ceil(log10(maxXPoint));

        for (var i = 0; i <= majorLoop; i++) {
            // check for Major Tick marks
            var MajorX = Math.round(Math.pow(10, i));
            if (minXPoint <= MajorX && maxXPoint >= MajorX) {
                // this is a valid major tick within range
                if (!ContainsX(XTicks,MajorX)) {
                    XTicks.push({
                        XVal: MajorX,
                        TickType: TickTypeEnum.MajorTick,
                        TickLocation: -1
                    });
                }
            }

            // check minor ticks (these will be in the log marks between major ticks
            for (var minor = 2; minor < 10; minor++) {
                var MinorVal = MajorX * minor;
                if (minXPoint < MinorVal &&
                    maxXPoint > MinorVal) {
                    // this is a valid minor tick
                    if (!ContainsX(XTicks,MinorVal)) {
                        XTicks.push({
                            XVal: MinorVal,
                            TickType: TickTypeEnum.MinorTick,
                            TickLocation: -1
                        });
                    }
                }
            }
        }
        XTicks.sort(function(a,b){
            if(a.XVal > b.XVal){ return 1}
            if(a.XVal < b.XVal){ return -1}
            return 0;
        });

        var logminX = log10(minXPoint);
        var logmaxX = log10(maxXPoint);
        var difflog = logmaxX - logminX;

        // draw the actual lines
        $.each(XTicks, function (index, value) {
            var logVal = log10(value['XVal'])
            var percentageX = (logVal-logminX)/difflog;
            value.TickLocation =  percentageX * (bounds['maxX'] - bounds['minX']);

            context.beginPath();
            context.lineWidth = value.TickType == TickTypeEnum.MajorTick ? MAJOR_TICKWIDTH : MINOR_TICKWIDTH;
            context.moveTo(value.TickLocation + 0.5, 0+ 0.5);
            context.lineTo(value.TickLocation+ 0.5, bounds['maxY']-bounds['minY']+ 0.5);
            context.strokeStyle = '#ffffff';
            context.closePath();
            context.stroke();
        });
    }

    function DrawOuterBorder() {
        // TODO:  allow color?  thickness?
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(bounds['maxX'] - bounds['minX'], 0);
        context.lineTo(bounds['maxX'] - bounds['minX'], bounds['maxY'] - bounds['minY']);
        context.lineTo(0, bounds['maxY'] - bounds['minY']);
        context.fill();

        context.beginPath();
        context.lineWidth = 3;
        context.moveTo(0, 0);
        context.lineTo(bounds['maxX'] - bounds['minX'], 0);
        context.lineTo(bounds['maxX'] - bounds['minX'], bounds['maxY'] - bounds['minY']);
        context.lineTo(0, bounds['maxY'] - bounds['minY']);
        context.strokeStyle = '#ffffff';
        context.closePath();
        context.stroke();
    }

    this.FinishingTouches = function() {
        context.beginPath();
        context.lineWidth = 3;
        context.moveTo(0, 0);
        context.lineTo(bounds['maxX'] - bounds['minX'], 0);
        context.lineTo(bounds['maxX'] - bounds['minX'], bounds['maxY'] - bounds['minY']);
        context.lineTo(0, bounds['maxY'] - bounds['minY']);
        context.strokeStyle = '#ffffff';
        context.closePath();
        context.stroke();
    }

    function ContainsX(array, val) {
        $.each(array, function (index, value) {
            if (value['XVal'].x == val) {
                return true;
            }
        });
        return false;
    }
}