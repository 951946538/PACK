
 function getXYinMatrixCoo(x, y, column_count=10, line_count=6){

    var canvas = document.getElementById("drawArea"), ctxt = canvas.getContext("2d");
    
    var screen_width = canvas.width;
    var screen_height = canvas.height;
    
    console.log("width:",screen_width);
    console.log("height:",screen_height);
    
    
    var line   = Math.floor(y*line_count/screen_height);
    var column = Math.floor(x*column_count/screen_width);
    
    //console.log("x:",x);
    //console.log("y:",y);
    
    return [line,column];
};


window.addEventListener('resize', reportWindowSize);
 
function reportWindowSize() {
  var h = window.innerHeight;
  var w = window.innerWidth;
  
  console.log("window resize");
  console.log(w);
  console.log(h);
}

//var timer;


var touchMatrix = [ [0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0]];

var prevTouchMatrix = [ [0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0]];


function getInfosFromTouch(touch){
    var br = document.getElementById("drawArea").getBoundingClientRect();

    var column_count = 10;
    var line_count = 6;

    var cell_width_in_px  = br.width / column_count;
    var cell_height_in_px = br.height / line_count;

    var x_rel = (touch.clientX - br.left)/br.width;
    var y_rel = (touch.clientY - br.top)/br.height;
    
    // console.log("changed id:",touch.identifier);
    // console.log("clientX:",touch.clientX);
    // console.log("clientY:",touch.clientY);

    // console.log("x_rel:", x_rel);
    // console.log("y_rel:", y_rel);
    
    x_rel = x_rel < 0 ? 0 : x_rel >= 1 ? 0.99 : x_rel;
    y_rel = y_rel < 0 ? 0 : y_rel >= 1 ? 0.99 : y_rel;

    var x_mat = Math.floor(x_rel*column_count);
    var y_mat = Math.floor(y_rel*line_count);

    // console.log("x_rel_c:", x_rel);
    // console.log("y_rel_c:", y_rel);

    //console.log("x :",x_mat);
    //console.log("y :",y_mat);

    var cell_x_top_in_px = x_mat*cell_width_in_px;
    var cell_y_top_in_px = y_mat*cell_height_in_px;

    return [x_mat, y_mat, cell_x_top_in_px, cell_y_top_in_px, cell_width_in_px, cell_height_in_px]
} 

function sendTouchMatrixIfStateChanged(){

    var mat_changed = false;

    //console.log("inside sendTouchMatrixIfStateChanged");
    //console.log(touchMatrix);
    //console.log("prev:    " + JSON.stringify(prevTouchMatrix));
    //console.log("current: " + JSON.stringify(touchMatrix));

    if(JSON.stringify(prevTouchMatrix) == JSON.stringify(touchMatrix)) mat_changed = false;
    else mat_changed = true;

    if(mat_changed){

        var rgb = parseColor($("#colorButton").css("background-color"));
        //rgb = [255,0,0];
        var command_list = "[";
        var patern_duration = 0;

        for(x=0;x<10;x++){
            for(y=0;y<6;y++){

                  console.log(touchMatrix[y][x]);

                  if(prevTouchMatrix[y][x] != touchMatrix[y][x]){

                          if(touchMatrix[y][x]==1){patern_duration = 30000}
                          else{patern_duration = 600}

                          var formated_text= x.toString() + "," + 
                                             y.toString() + "," + 
                                             patern_duration + "," + 
                                             rgb[0].toString() + "," + 
                                             rgb[1].toString() + "," + 
                                             rgb[2].toString() + "," + 
                                             0;
                                           
                          command_list += formated_text + ";";
                  }
            }
        }
        command_list += "]";
        console.log("sending command list:");
        console.log(command_list);
        sendThroughtWebSocket(command_list);
    }
    //copie tableau 2D sans reference
    prevTouchMatrix = touchMatrix.map(function(arr){return arr.slice()});


}


var CanvasDrawr = function(options) {
    var canvas = document.getElementById(options.id), ctxt = canvas.getContext("2d");
    canvas.style.width = '100%'
	canvas.width = 0.9*window.innerWidth;//document.body.clientWidth;
	canvas.height = 0.98*window.innerHeight;
    //canvas.width = canvas.offsetWidth;
    canvas.style.width = '';
    ctxt.lineWidth = 0;//options.size || Math.ceil(Math.random() * 35);
    ctxt.lineCap = options.lineCap || "round";
    ctxt.pX = undefined;
    ctxt.pY = undefined;
    var lines = [, , ];
    var offset = $(canvas).offset();
    var self = {init: function() {

                    //canvas.addEventListener('touchstart', self.allevent, false);
					canvas.addEventListener('touchstart', self.touchStart, false);
					canvas.addEventListener('touchend', self.touchStop, false);
					canvas.addEventListener('touchmove', self.touchMove, false);
                    

                },resetTouchMatrix:function(){
					touchMatrix =     [ [0,0,0,0,0,0,0,0,0,0],
									    [0,0,0,0,0,0,0,0,0,0],
									    [0,0,0,0,0,0,0,0,0,0],
								    	[0,0,0,0,0,0,0,0,0,0],
								    	[0,0,0,0,0,0,0,0,0,0],
							     		[0,0,0,0,0,0,0,0,0,0]];
				},touchStart:function(event){

                    //console.log("touchStart called");
                    self.resetTouchMatrix();
                    $.each(event.touches, function(i, touch) {
                        //var id = touch.identifier;
						const [x_mat, y_mat, cell_x_top_in_px, cell_y_top_in_px, cell_width_in_px, cell_height_in_px] = getInfosFromTouch(touch);
						//////////console.log("new touch event");
                        var hex_color = $("#colorButton").css("background-color");
                        ctxt.strokeStyle = hex_color; 
                        ctxt.fillStyle   = hex_color;
                        ctxt.fillRect(cell_x_top_in_px,cell_y_top_in_px, cell_width_in_px, cell_height_in_px);
						touchMatrix[y_mat][x_mat] = 1;
                    });

                    sendTouchMatrixIfStateChanged();


				},touchStop:function(event){

                    //console.log("touchStop called");
                    $.each(event.changedTouches, function(i, touch) {
                        //var id = touch.identifier;
						const [x_mat, y_mat, cell_x_top_in_px, cell_y_top_in_px, cell_width_in_px, cell_height_in_px] = getInfosFromTouch(touch);
						////////////console.log("end touch event");
                        ctxt.strokeStyle = "#FF00FF";   
                        ctxt.fillStyle = "#FFFFFF";
                        ctxt.fillRect(cell_x_top_in_px,cell_y_top_in_px, cell_width_in_px, cell_height_in_px);
						touchMatrix[y_mat][x_mat] = 0;
                    });

                    sendTouchMatrixIfStateChanged();

				
				},touchMove:function(event){
				    //console.log("touchMove called");
					self.resetTouchMatrix();
                    ctxt.strokeStyle = "#FFFFFF";  
				    ctxt.fillStyle = "#ffffff";
                    ctxt.fillRect(0,0,canvas.width,canvas.height);
					
					$.each(event.touches, function(i, touch) {
						const [x_mat, y_mat, cell_x_top_in_px, cell_y_top_in_px, cell_width_in_px, cell_height_in_px] = getInfosFromTouch(touch);
						var hex_color = $("#colorButton").css("background-color");
                        ctxt.fillStyle = hex_color;
                        ctxt.fillRect(cell_x_top_in_px,cell_y_top_in_px, cell_width_in_px, cell_height_in_px);
						touchMatrix[y_mat][x_mat] = 1;
                        //console.log(y_mat,x_mat);
					});

                    sendTouchMatrixIfStateChanged();
				
				}
            };
    return self.init();
};
$(function() {
    var super_awesome_multitouch_drawing_canvas_thingy = new CanvasDrawr({id: "drawArea",size: 15});


});
