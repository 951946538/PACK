/*!
 * Pixel Picker - a jQuery plugin to create cool pixel art.
 *
 * Copyright (c) 2015 Designer News Ltd.
 *
 * Project home:
 *   https://github.com/DesignerNews/pixel-picker
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Version:  0.1.1
 */
 
 
var device_name = "visuatouch2";
var visuatouch_adress = device_name + ".local";


var websock;
var log_adress = "logs.csv";

var is_device_connection_ok = false;

var log_token = "Y2Xj9lF5p4WECogSFrDgbFgYmO4RCMlPiwnT9STnwKTFMpo8RC1KHstfxJ93rmleRjbfe7G6lgBxND51F2uVIc9yhzksPqkTP7RXZqANj6XASGO4Hbrh2sEyEkmzfZ6ic4x2duJpmO1U"
var log_server_adress = "https://www.artiglobe.com/visuatouch_V2_0001/php/event_logger.php";
var log_url_on_server = "https://www.artiglobe.com/visuatouch_V2_0001/php/log_";
//var visuatouch_adress = "visuatouch1.local";




function parseColor(color) {
  // If the color is already an RGB array, return
  if (Object.prototype.toString.call(color) === '[object Array]') {
	return color;
  };

  return color.charAt(0) === '#' ? parseHex(color) : parseRgb(color);
};
function parseRgb(rgbValue) {
      return rgbValue.replace(/[^\d,]/g, '').split(',').map(function(value) {
        return parseInt(value, 10);
      });
    };
	
function start_socket(){
	
  var url = "ws://" + visuatouch_adress + ":81/";
  websock = new WebSocket(url);
  console.log("opening websocket at: ", url);
  
  websock.onopen = function(evt) { 
  		console.log('websocket OPEN!'); 
  		is_device_connection_ok = true;
  		updateConnectToDeviceButtonStates();
  };
  websock.onclose = function(evt) {
		var mess = 'websocket closed!';  
		console.log(mess); 
		var e = document.getElementById('mess_from_ESP');
        e.textContent = mess;
        is_device_connection_ok = false;
        updateConnectToDeviceButtonStates();
	
  };
  websock.onerror = function(evt) { 
  		console.log(evt); 
  		is_device_connection_ok = false;
  		updateConnectToDeviceButtonStates();
  };
  websock.onmessage = function(evt) {
   		//console.log(evt);
    	var e = document.getElementById('mess_from_ESP');
    	e.textContent = evt.data.substring(0,50) + "...";
  };



};

//==================================================================================================//
//==================================================================================================//
var palette_color_list = ["#000000","#323232","#646464","#820000","#b40000","#e60000","#ff7d7d","#823400","#b44800","#e65c00","#ffb27d","#828200","#b4b400","#e6e600","#ffff7d","#003300","#008000","#00cc00",
"#000000","#323232","#646464","#820000","#b40000","#e60000","#ff7d7d","#823400","#b44800","#e65c00","#ffb27d","#828200","#b4b400","#e6e600","#ffff7d","#003300","#008000","#00cc00",
"#000000","#323232","#646464","#820000","#b40000","#e60000","#ff7d7d","#823400","#b44800","#e65c00","#ffb27d","#828200","#b4b400","#e6e600","#ffff7d","#003300","#008000","#00cc00",
"#000000","#323232","#646464","#820000","#b40000","#e60000","#ff7d7d","#823400","#b44800","#e65c00","#ffb27d","#828200","#b4b400","#e6e600","#ffff7d","#003300","#008000","#00cc00",
"#000000","#323232","#646464","#820000","#b40000","#e60000","#ff7d7d","#823400","#b44800","#e65c00","#ffb27d","#828200","#b4b400","#e6e600","#ffff7d","#003300","#008000","#00cc00"];

var timeout_color_list = [];




//==================================================================================================//
//==================================================================================================//
function switchToFullScreenPad(){
	console.log("switchToFullScreenPad");
	$(".container").hide();
	$(".canvas_container").show();
	$("#colorPickerHolder").hide();
}

function switchToFullOptionMenu(){
	console.log("switchToFullOptionMenu");
	$(".container").show();
	$(".canvas_container").hide();	
	$("#colorPickerHolder").hide();
}

function switchToColorChoiceMenu(){
	console.log("switchToColorChoiceMenu");
	$(".container").hide();
	$(".canvas_container").hide();
	$("#colorPickerHolder").show();

}
//==================================================================================================//
//==================================================================================================//

$( document ).ready(function() {
	
	$('#device_adress').val(visuatouch_adress);
	$('#get_log_button').attr("action","http://" + visuatouch_adress + "/" + log_adress);
	$('#get_log_on_server_button').attr("action",log_url_on_server + device_name + ".csv");
	
    start_socket();

	
	$( "#vibration_slider" ).slider({
		value:50,
		min:1,
		max:100,
		change: function(event,ui){
									$("#vibration_intensity").html(ui.value);
									setVibrationIntensity();
								  }
	});
	
	
	$( "#leds_brigthness_slider" ).slider({
		value:1000,
		min:1,
		max:1000,
		change: function(event,ui){
									$("#leds_brigthness").html(ui.value);
									setLedsBrightness();
								  }
	});
	
	
	$( "#servo_intensity_slider" ).slider({
		value:300,
		min:1,
		max:500,//1000,
		change: function(event,ui){
									$("#servo_intensity").html(ui.value);
									setServoIntensity();
								  }
	});

	$( "#patern_duration_slider" ).slider({
		value:600,
		min:10,
		max:2000,
		change: function(event,ui){
									$("#patern_duration").html(ui.value);
								  }
	});

	$( "#patern_delay_slider" ).slider({
		value:100,
		min:0,
		max:300,
		change: function(event,ui){
									$("#patern_delay").html(ui.value);
								  }
	});

	//================================================//
	// Min-max servo range
	//================================================//
/* 	
	for(id=0;id<=9;id++){
	
			slider_id = "#servo" + id + "_slider";
			value_span_id = "#servo" + id + "_values";
			
			$( slider_id ).slider({
				range: true,
				min:0,
				max:1000,
				values:[100,500],
				change: function(event,ui){
											$(value_span_id).html( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
										  }
			});
	} */
	
	$("#servo0_slider").slider({
		min:0,
		max:1000,
		value:630,
		change: function(event,ui){
									$("#servo0_values").html(ui.value);
									moveServoById(0,ui.value);
								  }
	});
			
	$("#servo1_slider").slider({
		min:0,
		max:1000,
		value:630,
		change: function(event,ui){
									$("#servo1_values").html(ui.value);
									moveServoById(1,ui.value);
								  }
	});
	
	$("#servo2_slider").slider({
		min:0,
		max:1000,
		value:630,
		change: function(event,ui){
									$("#servo2_values").html(ui.value);
									moveServoById(2,ui.value);
								  }
	});
			
	$("#servo3_slider").slider({
		min:0,
		max:1000,
		value:630,
		change: function(event,ui){
									$("#servo3_values").html(ui.value);
									moveServoById(3,ui.value);
								  }
	});
	
	$("#servo4_slider").slider({
		min:0,
		max:1000,
		value:630,
		change: function(event,ui){
									$("#servo4_values").html(ui.value);
									moveServoById(4,ui.value);
								  }
	});
			
	$("#servo5_slider").slider({
		min:0,
		max:1000,
		value:430,
		change: function(event,ui){
									$("#servo5_values").html(ui.value);
									moveServoById(5,ui.value);
								  }
	});
	
	$("#servo6_slider").slider({
		min:0,
		max:1000,
		value:430,
		change: function(event,ui){
									$("#servo6_values").html(ui.value);
									moveServoById(6,ui.value);
								  }
	});
			
	$("#servo7_slider").slider({
		min:0,
		max:1000,
		value:430,
		change: function(event,ui){
									$("#servo7_values").html(ui.value);
									moveServoById(7,ui.value);
								  }
	});
	
	$("#servo8_slider").slider({
		min:0,
		max:1000,
		value:430,
		change: function(event,ui){
									$("#servo8_values").html(ui.value);
									moveServoById(8,ui.value);
								  }
	});
			
	$("#servo9_slider").slider({
		min:0,
		max:1000,
		value:430,
		change: function(event,ui){
									$("#servo9_values").html(ui.value);
									moveServoById(9,ui.value);
								  }
	});
	
	
	//===================================================//
	setPresetIntensity("1");
	setPaternSpeed("1");


	//====================================================//
	// desactive le context Menu lors d'un appui long     //
	//====================================================//
	window.oncontextmenu = function(event) {
     event.preventDefault();
     event.stopPropagation();
     return false;
	};

	//====================================================//
	// Appui long sur le bouton FullScreenPad             //
	//====================================================//
	var i = 0, fullscreenPad_button_timeOut = 0;
  
    // Hold Event 
    $('#fullscreenPad_button').bind('mousedown touchstart', function(e) {
        fullscreenPad_button_timeOut = setInterval(function() {
        	switchToFullScreenPad();
        }, 1000);
    }).bind('mouseup mouseleave touchend', function() {
        clearInterval(fullscreenPad_button_timeOut);
    });
	//===================================================//

	//====================================================//
	// Appui long sur le bouton OptionMenu            //
	//====================================================//
	var i = 0, fulloptionMenubutton_timeOut = 0;
  
    // Hold Event 
    $('#fulloptionMenu_button').bind('mousedown touchstart', function(e) {
        fulloptionMenubutton_timeOut = setInterval(function() {
        	switchToFullOptionMenu();
        }, 1000);
    }).bind('mouseup mouseleave touchend', function() {
        clearInterval(fulloptionMenubutton_timeOut);
    });
	//===================================================//


	// for(var j = 0; j < palette_color_list.length; j++){
	// 	style = "'background-color:" + palette_color_list[j] + "'";
	// 	console.log(style);
	// 	id = "color" + j;
	// 	$( "#colorPart" ).prepend( "<div id=" + id + " style=" + style + " class='color_block'></div>" );
	// }

	//====================================================//
	// Appui long sur le bouton ChooseColor               //
	//====================================================//
	chooseColor_button_timeOut = 0;
    $('#colorChoiceMenu_button').bind('mousedown touchstart', function(e) {
    	e.preventDefault();
        chooseColor_button_timeOut = setInterval(function() {
        	switchToColorChoiceMenu();
        }, 50);
    }).bind('mouseup mouseleave touchend touchcancel', function() {
        clearInterval(chooseColor_button_timeOut);
    });


    //===========================================================//
    // Color picker fullscreen
    //===========================================================//
    var defaultPicker = new iro.ColorPicker("#RoundColorPicker", {

    	  layout: [
		    { 
		      component: iro.ui.Wheel,
		      options: {}
		    },
		  ],
		  width: window.innerHeight*0.9,
		  color: $("#colorButton").css("background-color"),
		  borderWidth: 10,
		  borderColor: "#000",
	});



	defaultPicker.on('input:end', function(color) {
		console.log("choosen color:",color.hexString);
		$("#colorButton").css("background-color",color.hexString);
		$("#colorChoiceMenu_button").css("background-color",color.hexString);
		$("#colorPickerHolder").css("background-color",color.hexString);
		switchToFullScreenPad();
	});

	defaultPicker.on('color:change', function(color) {
			console.log("color change:",color.hexString);
			$("#colorChoiceMenu_button").css("background-color",color.hexString);
			$("#colorPickerHolder").css("background-color",color.hexString);
	});


	//====================================================//
	$("#colorChoiceMenu_button").css("background-color", $("#colorButton").css("background-color") );
	$("#colorPickerHolder").css("background-color", $("#colorButton").css("background-color") );
	

	$(".menuButtonArea").css("padding-left",0.91*window.innerWidth);
	$(".menuButtonArea").css("width",0.08*window.innerWidth);

	$('.pixel-picker-container').pixelPicker();




});



//==================================================================





//==================================================================
// 
//==================================================================

function moveServoById(id, pos){
	$.get( "http://" + visuatouch_adress + "/move_servo",{id:id,pos:pos}, function( data ) {});
	
}


function connectToDevice(e){
	var dev_id = e.id;

	if(dev_id=="1"){
		device_name="visuatouch1";
		$("#device_adress").val("visuatouch1.local");
	}
	if(dev_id=="2"){
		device_name="visuatouch2";
		$("#device_adress").val("visuatouch2.local");
	}
	setDeviceAdressClicked();

}

function updateConnectToDeviceButtonStates(){
	var backgroundColor;
	console.log("inside updateConnectToDeviceButtonStates")
	if(is_device_connection_ok) backgroundColor = "lightgreen";
	else backgroundColor = "red";

	if(device_name=="visuatouch1"){
		$(".dev1_button").css("background-color", backgroundColor);
		$(".dev2_button").css("background-color", "");
		$("#current_device_name").text("device #1");
	}
	if(device_name=="visuatouch2"){
		$(".dev1_button").css("background-color", "");
		$(".dev2_button").css("background-color", backgroundColor);
		$("#current_device_name").text("device #2");
	}

}



//==================================================================
// Customisation part
//==================================================================
var pixel_color = "#0000FF";
 


//==================================================================
//Version delegation de l'effet coté arduino
//==================================================================
function paternClicked(e){
	console.log("patern cicked:",e.id);
	
	//var currentColor = $("#colorButton").css("background-color");
	//var rgb = parseHex("#" + currentColor);	
	var rgb = parseColor($("#colorButton").css("background-color"));
	var patern_duration = $("#patern_duration").text();
	var patern_delay = $("#patern_delay").text();
	$.get( "http://" + visuatouch_adress + "/launch_patern",{r:rgb[0],g:rgb[1],b:rgb[2],duration:patern_duration, delay:patern_delay,patern:e.id}, function( data ) {});
	
}


function sendCommandToLogServer(command){
	console.log("sending command to log server");
	var d = new Date();
	var formated_time = d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear() + "  " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + "." + d.getMilliseconds();
	console.log("at time " + formated_time);

	$.get( log_server_adress,{send_time:formated_time, command:command, token:log_token, device_name:device_name}, function( data ) {})
																.fail(function(){   
																	$("#mess_from_logserver").text("log error")
																	console.log( "log error" );})
																.done(function(){ 
																	$("#mess_from_logserver").text("log ok");
																	console.log( "log ok" );});
}	


function sendThroughtWebSocket(command_list){
	console.log("sending:" + command_list);
	websock.send(command_list);
	sendCommandToLogServer(command_list);
}


//==================================================================
// Presets setting
//==================================================================
function setPaternSpeed(e){

	if(typeof e == 'object') var speed = e.id;
	else                     var speed = e;

	if(speed=="0"){
		$("#patern_duration_slider").slider('value',990);
		$("#patern_delay_slider").slider('value',135);

		$(".LSP_button").css("background-color", "lightgreen");
		$(".MSP_button").css("background-color", "");
		$(".HSP_button").css("background-color", "");
	}
	if(speed=="1"){
		$("#patern_duration_slider").slider('value',630);
		$("#patern_delay_slider").slider('value',75);

		$(".LSP_button").css("background-color", "");
		$(".MSP_button").css("background-color", "lightgreen");
		$(".HSP_button").css("background-color", "");
	}
	if(speed=="2"){
		$("#patern_duration_slider").slider('value',275);
		$("#patern_delay_slider").slider('value',35);

		$(".LSP_button").css("background-color", "");
		$(".MSP_button").css("background-color", "");
		$(".HSP_button").css("background-color", "lightgreen");
	}
}

//==================================================================
// Presets setting
//==================================================================
function setPresetIntensity(e){

	if(typeof e == 'object') var intensity = e.id;
	else                     var intensity = e;

	if(intensity=="0"){
		$("#servo_intensity_slider").slider('value',200);

		$(".L_INT_button").css("background-color", "lightgreen");
		$(".M_INT_button").css("background-color", "");
		$(".H_INT_button").css("background-color", "");
	}

	if(intensity=="1"){
		$("#servo_intensity_slider").slider('value',350);

		$(".L_INT_button").css("background-color", "");
		$(".M_INT_button").css("background-color", "lightgreen");
		$(".H_INT_button").css("background-color", "");
	}

	if(intensity=="2"){
		$("#servo_intensity_slider").slider('value',450);

		$(".L_INT_button").css("background-color", "");
		$(".M_INT_button").css("background-color", "");
		$(".H_INT_button").css("background-color", "lightgreen");
	}

}



//==================================================================
//Version effet coté javascript
//==================================================================
function sendPatern(e){
		
	var patern = e.id;
	var x;
	var y;
	var rgb = parseColor($("#colorButton").css("background-color"));
	
	var command_list;
	
    var patern_duration = $("#patern_duration").text();
	var patern_delay = parseInt($("#patern_delay").text());
	
									 					 
	//==========================================================
	//		LR Patern
	//==========================================================
	if (patern == "0"){
		
		command_list = "[";
		
		for(x=0;x<10;x++){
			for(y=0;y<6;y++){
				  var formated_text= x.toString() + "," + 
									 y.toString() + "," + 
									 patern_duration + "," + 
									 rgb[0].toString() + "," + 
									 rgb[1].toString() + "," + 
									 rgb[2].toString() + "," + 
									 x*patern_delay;
									 
				  //console.log("sending:" + formated_text);
				  command_list += formated_text + ";";
			}
		}
		command_list += "]";
		sendThroughtWebSocket(command_list);
	}
	
	//==========================================================
	//		RL Patern
	//==========================================================
	if (patern == "1"){
		
		command_list = "[";
		
		for(x=9;x>=0;x--){
			for(y=0;y<6;y++){
				  var formated_text= x.toString() + "," + 
									 y.toString() + "," + 
									 patern_duration + "," + 
									 rgb[0].toString() + "," + 
									 rgb[1].toString() + "," + 
									 rgb[2].toString() + "," + 
									 (9-x)*patern_delay;
									 
				  //console.log("sending:" + formated_text);
				  command_list += formated_text + ";";
			}
		}
		command_list += "]";
		sendThroughtWebSocket(command_list);
	}
	//==========================================================
	//		TB Patern
	//==========================================================
	if (patern == "2"){
		
		command_list = "[";
		
		for(y=0;y<6;y++){
			for(x=0;x<10;x++){
				  var formated_text= x.toString() + "," + 
									 y.toString() + "," + 
									 patern_duration + "," + 
									 rgb[0].toString() + "," + 
									 rgb[1].toString() + "," + 
									 rgb[2].toString() + "," + 
									 y*patern_delay;
									 
				  //console.log("sending:" + formated_text);
				  command_list += formated_text + ";";
			}
		}
		command_list += "]";
		sendThroughtWebSocket(command_list);
	}
	//==========================================================
	//		BT Patern
	//==========================================================
	if (patern == "3"){
		
		command_list = "[";
		
		for(y=5;y>=0;y--){
			for(x=0;x<10;x++){
				  var formated_text= x.toString() + "," + 
									 y.toString() + "," + 
									 patern_duration + "," + 
									 rgb[0].toString() + "," + 
									 rgb[1].toString() + "," + 
									 rgb[2].toString() + "," + 
									 (5-y)*patern_delay;
									 
				  //console.log("sending:" + formated_text);
				  command_list += formated_text + ";";
			}
		}
		command_list += "]";
		sendThroughtWebSocket(command_list);
	}

	//==========================================================
	//		ME Patern
	//==========================================================
	if (patern == "4"){
		
		command_list = "[";
		
		for(y=5;y>=0;y--){
			for(x=4;x>=0;x--){
				  var formated_text= x.toString() + "," + 
									 y.toString() + "," + 
									 patern_duration + "," + 
									 rgb[0].toString() + "," + 
									 rgb[1].toString() + "," + 
									 rgb[2].toString() + "," + 
									 (4-x)*patern_delay;
				  command_list += formated_text + ";";
			}
			for(x=5;x<=10;x++){
				  var formated_text= x.toString() + "," + 
									 y.toString() + "," + 
									 patern_duration + "," + 
									 rgb[0].toString() + "," + 
									 rgb[1].toString() + "," + 
									 rgb[2].toString() + "," + 
									 (x-5)*patern_delay;
				  command_list += formated_text + ";";
			}
		}
		command_list += "]";
		sendThroughtWebSocket(command_list);
	}

	//==========================================================
	//		EM Patern
	//==========================================================
	if (patern == "5"){
		
		command_list = "[";
		
		for(y=5;y>=0;y--){
			for(x=0;x<5;x++){
				  var formated_text= x.toString() + "," + 
									 y.toString() + "," + 
									 patern_duration + "," + 
									 rgb[0].toString() + "," + 
									 rgb[1].toString() + "," + 
									 rgb[2].toString() + "," + 
									 x*patern_delay;
				  command_list += formated_text + ";";
			}
			for(x=9;x>=5;x--){
				  var formated_text= x.toString() + "," + 
									 y.toString() + "," + 
									 patern_duration + "," + 
									 rgb[0].toString() + "," + 
									 rgb[1].toString() + "," + 
									 rgb[2].toString() + "," + 
									 (9-x)*patern_delay;
				  command_list += formated_text + ";";
			}
		}
		command_list += "]";
		sendThroughtWebSocket(command_list);
	}

	//==========================================================
	//		snake LR Patern
	//==========================================================
	if (patern == "6"){
		var xys = [[0,0,0,0,0,0,1,1,1,1,1,1,2,2,2,2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,5,5,5,5,5,5,6,6,6,6,6,6,7,7,7,7,7,7,8,8,8,8,8,8,9,9,9,9,9,9],
				   [0,1,2,3,4,5,5,4,3,2,1,0,0,1,2,3,4,5,5,4,3,2,1,0,0,1,2,3,4,5,5,4,3,2,1,0,0,1,2,3,4,5,5,4,3,2,1,0,0,1,2,3,4,5,5,4,3,2,1,0]]
		command_list = "[";
		
		for(i=0; i<xys[0].length; i++){
			var x = xys[0][i];
			var y = xys[1][i];

			var formated_text= x.toString() + "," + 
			   				   y.toString() + "," + 
							   Math.round(0.4*patern_duration) + "," + 
							   rgb[0].toString() + "," + 
							   rgb[1].toString() + "," + 
						       rgb[2] + "," + 
							   Math.round(0.4*i*patern_delay);

			command_list += formated_text + ";";

		}
		command_list += "]";
		sendThroughtWebSocket(command_list);
	}
	

}


function getSpiralXYfromStep(step, isClockWise){
	
	var x = 0;
	var y = 0;
	
	return x,y
}

function randomColoredClickedJs(point_count, random_color){
	console.log("randomColoredClicked js");
	
	var rgb = parseColor($("#colorButton").css("background-color"));


	var command_list = "[";
	
    var patern_duration = $("#patern_duration").text();
	var patern_delay = parseInt($("#patern_delay").text());
								 					 

	for(i=0; i < point_count; i++){	
	
		var x = Math.floor((Math.random() * 9) + 0);
		var y = Math.floor((Math.random() * 5) + 0);
		var randomized_delay = Math.floor((Math.random() * point_count/2 * patern_delay) + 0);
		
		if(random_color){
			r = Math.floor((Math.random() * 255) + 0);
			g = Math.floor((Math.random() * 255) + 0);
			b = Math.floor((Math.random() * 255) + 0);
		}
		else{
			r = rgb[0].toString();
			g = rgb[1].toString();
			b = rgb[2].toString();
		}
		
		var formated_text= x.toString() + "," + 
						   y.toString() + "," + 
						   patern_duration + "," + 
						   r + "," + 
						   g + "," + 
						   b + "," + 
						   randomized_delay;
							 
		command_list += formated_text + ";";
	}
	
	command_list += "]";
	sendThroughtWebSocket(command_list);
}
		
	

// function randomColoredClicked(){
// 	console.log("randomColoredClicked");
	
// 	var rgb = parseColor($("#colorButton").css("background-color"));
// 	console.log("rgb color:");
// 	console.log(rgb);
	
// 	$.get( "http://" + visuatouch_adress + "/random_burst",{r:rgb[0],g:rgb[1],b:rgb[2]}, function( data ) {});
	
// }
 
// function randomRainbowClicked(){
// 	console.log("randomRainbowClicked");
// 	$.get( "http://" + visuatouch_adress + "/random_burst", function( data ) {});
// }


function getConnectedDeviceId(){
		$.get( "http://" + visuatouch_adress + "/get_id",{}, function( data ) {console.log(data);});
}	


function setLedsBrightness(){
	var level = $("#leds_brigthness").text();
	console.log($("#leds_brigthness"));
	console.log("setLedsBrightness to:",level);
	$.get( "http://" + visuatouch_adress + "/set_leds_brightness",{intensity:level}, function( data ) {});
}


function setServoIntensity(){
	var level = $("#servo_intensity").text();
	console.log($("#servo_intensity"));
	console.log("setServoIntensity to:",level);
	$.get( "http://" + visuatouch_adress + "/set_servo_intensity",{intensity:level}, function( data ) {});
}

function setLogState(){
	var state = $("#saveLogToggleButton").is(":checked");
	console.log("set_log_state to:",state);
	$.get( "http://" + visuatouch_adress + "/set_log_state",{save_log:state}, function( data ) {});
}

function setVibrationIntensity(){
	var level = $("#vibration_intensity").text();
	console.log($("#vibration_intensity"));
	console.log("setVibrationIntensity to:",level);
	$.get( "http://" + visuatouch_adress + "/set_vibration",{intensity:level}, function( data ) {});
}

function randomPixelButtonClicked(){
	console.log("random pixel button clicked");
	$.get( "http://" + visuatouch_adress + "/random_touch", function( data ) {});
}
function websocketTestButtonClicked(e){
	console.log("test button websocket clicked");
	websock.send(e.id);
}

function setDeviceAdressClicked(){
	console.log("setDeviceAdressClicked");
	visuatouch_adress = $("#device_adress").val();
	console.log("visuatouch_adress:",visuatouch_adress);
	$('#get_log_button').attr("action","http://" + visuatouch_adress + "/" + log_adress);
	$('#get_log_on_server_button').attr("action", log_url_on_server + device_name + ".csv");
	websock.close();
	start_socket();
	
	setLedsBrightness();
	setServoIntensity();

}

function resetLogClicked(){
	console.log("reset log button clicked");
	if (confirm('Are you sure?')) {
		$.get( "http://" + visuatouch_adress + "/reset_log", function( data ) {});
	}
}

function resetLogOnServerClicked(){
	console.log("reset log on server button clicked");
	if (confirm('Are you sure?')) {
		$.get(log_server_adress,{ token:log_token, device_name:device_name, reset_log:true}, function( data ) {});
	}
}


	
function chooseColor(e) {
	
	let color = rgbToHex(e.target.style.backgroundColor);
	touchColor = color;
	backgroundCanvas.style.backgroundColor = color;
	console.log("color chosen:");
	console.log(touchColor);
	pixel_color = touchColor;
}

function rgbToHex(color) {
	arr = color.replace('rgb', '').replace('(', '').replace(')', '').split(',');
	return "#" + componentToHex(Number(arr[0])) + componentToHex(Number(arr[1])) + componentToHex(Number(arr[2]));
}

function componentToHex(c) {
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}

function parseHex(hexValue) {
  var rgb = parseInt(hexValue.substring(1), 16);
  return [(rgb >> 16) & 0xFF, (rgb >> 8) & 0xFF, rgb & 0xFF];
};
	






//======================================================================
// Partie specifique à PIXELPICKER
//======================================================================

(function ($) {


  $.fn.pixelPicker = function(options) {
    var settings,
        rows,
        currentColor,
        isErasing = false,
        isDragging = false,
        palette = [],
        map = [];

    // Core functions
    var updateHandler,
        applyColor,
        cycleColor;

    // Helper functions
    var parseColor,
        parseHex,
        parseRgb,
        arrayToRgb,
        arrayEqual;

    // Takes the passed in cell, finds its current background color within
    // the color palette, and updates the currentColor to the next
    // (or previous if reverse is true) color in the palette
    cycleColor = function(cell, reverse) {
      var cellColor = parseColor(cell.css('background-color').length ? cell.css('background-color') : '#ffffff');

      // If we're in eraser mode, return early
      // if (isErasing) {
        // return currentColor = parseColor(settings.eraserColor);
      // };

      // Locate our position in the palette based on our
      // current cell's background color
      var currentIndex = (function() {
        var matchingIndex;

        palette.forEach(function(color, index) {
          if (arrayEqual(color, cellColor)) {
            matchingIndex = index;
          };
        });

        return matchingIndex;
      })();

      var nextIndex = (function() {
        if (reverse) {
          // Go back in the array, or to the end if we've reached the beginning
          return (currentIndex - 1) === -1 ? palette.length - 1 : (currentIndex - 1);
        } else {
          // Go forward in the array, or the beginning if we've reached the end
          return (currentIndex + 1) in palette ? (currentIndex + 1) : 0;
        };
      })();

      // Set the new global current color!
      return currentColor = palette[nextIndex];
    };

    // Apply the global current color as the cell's background
    applyColor = function(cell) {
      return cell.css('background-color', arrayToRgb(currentColor));
    };

    // Update whatever is handling the updated map of colors
    updateHandler = function(rowIndex, cellIndex, cell, dontHandle) {
      var handler = settings.update;
	  
	  currentColor = $("#colorButton").css("background-color");
      var newColor = (cell != null && cell.css('background-color').length ? parseColor(cell.css('background-color')) : currentColor);

		
      map[rowIndex][cellIndex] = newColor;

      if (dontHandle) return;

      if (typeof handler === 'function') {
        // We can either pass off the updated map to a function
        handler(map);
      } else if (handler instanceof jQuery) {
        // Or, we can update the value="" of a jQuery input
        handler.val(JSON.stringify(map));
      }
	  
	  var rgb = parseRgb(newColor);
	  // console.log("rgb color:");
	  // console.log(rgb);
	  
	  //version http
	  //$.get( "http://visuatouch1.local/touch", {x:cellIndex,y:rowIndex,duration:600,r:rgb[0],g:rgb[1],b:rgb[2]});
	  
	  var duration = 2*parseInt($("#patern_duration").text());
	  //version websocket
	  var formated_text= "[" +
						 cellIndex.toString() + "," + 
						 rowIndex.toString() + "," + 
						 duration.toString()  + "," +
						 rgb[0].toString() + "," + 
						 rgb[1].toString() + "," + 
						 rgb[2]+ "," + 
						 0 +
						 ";]"
						 
	  sendThroughtWebSocket(formated_text);
    };

    // Determine if we need to parse a hex or rgb value
    parseColor = function(color) {
      // If the color is already an RGB array, return
      if (Object.prototype.toString.call(color) === '[object Array]') {
        return color;
      };

      return color.charAt(0) === '#' ? parseHex(color) : parseRgb(color);
    };

    // Parse a hex value to an RGB array (i.e. [255,255,255])
    parseHex = function(hexValue) {
      var rgb = parseInt(hexValue.substring(1), 16);
      return [(rgb >> 16) & 0xFF, (rgb >> 8) & 0xFF, rgb & 0xFF];
    };

    // Parse an RGB value to an RGB array (i.e. [255,255,255])
    parseRgb = function(rgbValue) {
      return rgbValue.replace(/[^\d,]/g, '').split(',').map(function(value) {
        return parseInt(value, 10);
      });
    };

    // Convert an RGB array back to a CSS RGB color
    arrayToRgb = function(inArray) {
      return 'rgb(' + inArray[0] + ', ' + inArray[1] + ', ' + inArray[2] + ')';
    };

    // Check if two arrays are exacty the same
    arrayEqual = function(a, b) {
      return a.length === b.length && a.every(function(elem, i) {
        return elem === b[i];
      });
    };

    // Woo settings!
    settings = $.extend({
      update: null,
      ready: null,
      rowSelector: '.pixel-picker-row',
      cellSelector: '.pixel-picker-cell',
      eraserColor: "ffffff",
      palette: [
        '#ffffff', '#000000',
        '#ff0000', '#0000ff',
        '#ffff00', '#008000'
      ]
    }, options);

    // Convert palette to array of RGB arrays
    settings.palette.forEach(function(color) {
      palette.push(parseColor(color));
    });

    // Add the eraser color as the first color in
    // the palette. Required to make color cycling work.
    // If eraserColor is left unset, first color in
    // palette is assigned
    if (settings.eraserColor == null) {
      settings.eraserColor = settings.palette[0];
    } else {
      palette.unshift(parseColor(settings.eraserColor));
    };

    $(window)
      // Prevent context menu from showing up over top of cells
      .on('contextmenu', function(event) {
        if ($(event.target).hasClass(settings.cellSelector.substring(1))) return event.preventDefault();
      })

    // Find all the rows
    rows = this.find(settings.rowSelector);
    rowCount = rows.length;

    // Set up our initial color
    currentColor = settings.palette[0];
	
	
	
    rows.each(function(rowIndex, row) {
      row = $(row);
      map.push([]);
      var cellCollection = map[rowIndex];
      var cells = row.find(settings.cellSelector);
      var cellCount = cells.length;

      cells.each(function(cellIndex, cell) {
        cell = $(cell);
        cellCollection.push([]);

        // When a cell is clicked in to...
        cell.on('mousedown', function(event) {
          // First, was it a right click?
          var isRightClick = ('which' in event && event.which === 3) || ('button' in event && event.button === 2);

          // By default, turn dragging on so the mouse can move to
          // another cell and have continuity
          isDragging = true;

          // Now we do all the work

		  pixel_color = $("#colorButton").css("background-color");
		  
		  currentColor = parseColor(pixel_color);

		  //Timer pour eteindre le pixel dans 600ms
		  setTimeout(function(rowIndex, cellIndex){
			  var resetColor = [255,255,255];
			  cell.css('background-color', arrayToRgb(resetColor))	  
		  },600);
		  
          applyColor(cell);
          updateHandler(rowIndex, cellIndex);
		  
        });

        // Turn dragging off when we mouse up
        cell.on('mouseup', function() {
          isDragging = false;
        });

        // When the mouse enters a cell, if dragging is on
        // (turned on in the mousedown event), apply our current
        // global color to the cell, no cycling
        cell.on('mouseenter', function() {
          if (!isDragging) return;
		  
		  //pixel_color = "#" + $("#colorButton").css("background-color");
		  pixel_color = $("#colorButton").css("background-color");
		  console.log(pixel_color);
		  
		  currentColor = parseColor(pixel_color);
		  
		  //Timer pour eteindre le pixel dans 600ms
		  setTimeout(function(rowIndex, cellIndex){
			  var resetColor = [255,255,255];
			  cell.css('background-color', arrayToRgb(resetColor))	  
		  },600);
		  
		  
          applyColor(cell);
          updateHandler(rowIndex, cellIndex);
        });

        // Update the handler when we've finished the initial cell processing
        if (rowIndex + 1 === rowCount && cellIndex + 1 === cellCount) {
          updateHandler(rowIndex, cellIndex, cell);

          // Trigger the ready handler if there is one
          if (settings.ready) {
            settings.ready();
          }
        } else {
          updateHandler(rowIndex, cellIndex, cell, true);
        };
      });
    });

    return this;

  };

}(jQuery));
