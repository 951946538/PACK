
    var time = 0;
    var timeMove =0;
    var timer;
    var touchColor = "#000000";
    var x = 10;
    var y = 6;

    var backgroundCanvas = document.getElementById('gD');

    var colorInput = document.getElementById('');
    var colorPalette = document.getElementById('');

    document.addEventListener("touchstart", touchStart, false);
    document.addEventListener("touchend", touchEnd, false);
    document.addEventListener("touchmove", touchMove, false);

    window.addEventListener('contextmenu', function (e) {
        if (e.cancelable) {// 判断默认行为是否已经被禁用
            if (!event.defaultPrevented) {
               e.preventDefault();
            }
        } });

    function touch(e) {
        if (e.cancelable) {
        // 判断默认行为是否已经被禁用
        if (!e.defaultPrevented) {
            e.preventDefault();
        }
        }
        var touchList = new Array();
        for(var i=0; i<e.touches.length;i++){
            touchList.push(calLocation(e.touches[i]));
        }
        
        return touchList;
    }
      function touchStart(e) {
        if (e.cancelable) {
        // 判断默认行为是否已经被禁用
/*        if (!e.defaultPrevented) {
            e.preventDefault();
        }*/
        }
            var touchInfo = new Array();
            if(time == 0){
                timer = window.setInterval(function(){time++},50);
            }
            for(var i=0; i<e.touches.length;i++){
                if(e.touches[i].target.id == 'gD'){//if is touching the canvas
                    touchInfo = touch(e);
                    socket.emit('touchStart', {
                        value: touchInfo
                    });
                                    
                } 
                else if(e.touches[i].target.className == 'color-option'){
                    chooseColor(e);
                }
            }
      }

      function touchEnd(e) {
        if (e.cancelable) {
        // 判断默认行为是否已经被禁用
        if (!e.defaultPrevented) {
            e.preventDefault();
        }
        }
         socket.emit('touchEnd');
         time = 0;
         window. clearInterval(timer);
      }

      function touchMove(e) {
        if (e.cancelable) {
        // 判断默认行为是否已经被禁用
        if (!e.defaultPrevented) {
            e.preventDefault();
        }
        }
        var touchInfo = new Array();
        if(e.target.id == 'gD'){
            touchInfo = touch(e);
            console.log(touchInfo);
        }
        if(timeMove != time){//to limit the quantity of the data, get a group of data every 50ms
            timeMove = time;
            socket.emit('touchMove', {
                value: touchInfo
        });
        }          
      }


      function calLocation(data){
        //The formate of the data is (x,y,pressure(0 to 1),time(1 means 50ms and 3 means 150ms etc),color)
        var touchInfo = new Array();
        var pressure = Number(data.force.toFixed(2));
        touchInfo.push(Math.floor((data.clientX-5)*x/backgroundCanvas.scrollWidth));
        touchInfo.push(Math.floor((data.clientY-5)*y/backgroundCanvas.scrollHeight));
        console.log(data.clientX+","+backgroundCanvas.scrollWidth);
        console.log(data.clientY+","+backgroundCanvas.scrollHeight);
        if(pressure == 0){touchInfo.push(0.75);}else{touchInfo.push(pressure);};
        touchInfo.push(time);
        touchInfo.push(touchColor); 
        console.log(touchInfo);
        return touchInfo;
      }


        function componentToHex(c) {
          var hex = c.toString(16);
          return hex.length == 1 ? "0" + hex : hex;
        }

        function rgbToHex(color) {
          arr = color.replace('rgb', '').replace('(', '').replace(')', '').split(',');
          return "#" + componentToHex(Number(arr[0])) + componentToHex(Number(arr[1])) + componentToHex(Number(arr[2]));
        }

 /*     function chooseColor(e) {
          let color = rgbToHex(e.target.style.backgroundColor);
          colorInput.value = color;
          colorInput.style.borderRight =  `10px solid ${color}`;
          colorPalette.style.display = 'none';
        }
*/

        function chooseColor(e) {
            let color = rgbToHex(e.target.style.backgroundColor);
            touchColor = color;
            backgroundCanvas.style.backgroundColor = color;
            console.log(touchColor);
        }
      

