/**
 * Created by ebram on 7/21/2014.
 */

function DataFormatter() {

    var locations = [[10,0],[16,0],[32,0],[64,0],[125,0],[250,0],[500,0],[1000,0],[2000,0],[5,0]];

    var basicData;

    this.SetControlPoint = function(index, point) {
          basicData[index].control.location = point;
    }

    this.SetData = function(basic) {
        var tmpdata = basic;

        if (tmpdata == null || typeof (tmpdata) == 'undefined') {
            console.error('DataFormatter.SetData failure -- data parameter undefined');
            return;
        } else if (!(tmpdata instanceof Array)) {
            console.error('DataFormatter.SetData failure -- data parameter is not an array');
            return;
        }

        // at this point, we've confirmed we have an array
        for (var i = 0; i < tmpdata.length; i++) {
            /* format expected:

             data= array,
             color= #rgb,
             visible= true,
             control= {
                 visible= false
                 forecolor= #rgb
                 background= #rgb
                 location= {
                     x= 1000,
                     y= 5
                 }
                draggable= true, XONLY, YONLY, false
             }
             */

            var r = Math.round(Math.random() * 255);
            var g = Math.round(Math.random() * 255);
            var b = Math.round(Math.random() * 255);
            var singlePlot = tmpdata[i];

            // if nothing defined by this point, create an empty dictionary
            if (singlePlot == null || typeof (singlePlot) == 'undefined') {
                singlePlot = {};
            }

            // now it's time to go through each item and give it a default if it does not have one
            if (singlePlot.data == null || typeof singlePlot.data == 'undefined') {
                if (singlePlot instanceof Array) {
                    var tmpData = singlePlot;
                    singlePlot = {};
                    singlePlot.data = tmpData;
                }   else {
                    singlePlot.data = [];
                }
            }
            if (singlePlot.color == null || typeof singlePlot.color == 'undefined') {
                singlePlot.color = 'rgb(' + r + ',' + g + ',' + b + ')';
            }
            if (singlePlot.visible == null || typeof singlePlot.visible == 'undefined') {
                singlePlot.visible = true;
            }
            if (singlePlot.control == null || typeof singlePlot.control == 'undefined') {
                singlePlot.control = {};
            }
            if (singlePlot.control.visible == null || typeof singlePlot.control.visible == 'undefined') {
                singlePlot.control.visible = true;
            }
            if (singlePlot.control.forecolor == null || typeof singlePlot.control.forecolor == 'undefined') {
                singlePlot.control.forecolor = "#FFFFFF";
            }
            if (singlePlot.control.background == null || typeof singlePlot.control.background == 'undefined') {
                singlePlot.control.background = 'rgb(' + r + ',' + g + ',' + b + ')';
            }
            if (singlePlot.control.draggable == null || typeof singlePlot.control.draggable == 'undefined') {
                singlePlot.control.draggable = true;
            }
            if (singlePlot.control.location == null || typeof singlePlot.control.location == 'undefined') {
                singlePlot.control.location = locations[i];
            }

            tmpdata[i] = singlePlot;
        }
        basicData = tmpdata;
    }

    this.GetData = function () {
        return basicData;
    }
}