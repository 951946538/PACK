
function process(loader, main){

    document.getElementById(main).style.display = 'none';
    document.getElementById(loader).style.display = 'block';

}
function changeColorSLIC(){
    console.log("wesh");
    let button = document.getElementById('SLIC')
    let color = button.style.backgroundColor;

    if(color == ""){
        button.style.backgroundColor = '#76bd7a'
        document.getElementById('IA').style.backgroundColor = '#ffffff'
        document.getElementById("IA").style.color = 'rgb(0,0,0)'

        document.getElementById('AUTO').style.backgroundColor = '#ffffff'
        document.getElementById("AUTO").style.color = 'rgb(0,0,0)'
    }
    else{

        console.log(color)
        if(color == 'rgb(255, 255, 255)'){
            button.style.backgroundColor = 'rgb(118,189,122)';
            button.style.color = 'rgb(255,255,255)'
            document.getElementById("IA").style.backgroundColor = '#ffffff'
            document.getElementById("IA").style.color = 'rgb(0,0,0)'

            document.getElementById("AUTO").style.backgroundColor = '#ffffff'
            document.getElementById("AUTO").style.color = 'rgb(0,0,0)'
        }

    }


}

function changeColorAUTO(){
    console.log("wesh");
    let button = document.getElementById('AUTO')
    let color = button.style.backgroundColor;

    if(color == ""){
        button.style.backgroundColor = '#76bd7a'
        document.getElementById('IA').style.backgroundColor = '#ffffff'
        document.getElementById("IA").style.color = 'rgb(0,0,0)'

        document.getElementById('SLIC').style.backgroundColor = '#ffffff'
        document.getElementById("SLIC").style.color = 'rgb(0,0,0)'
    }
    else{

        console.log(color)
        if(color == 'rgb(255, 255, 255)'){
            button.style.backgroundColor = 'rgb(118,189,122)';
            button.style.color = 'rgb(255,255,255)'
            document.getElementById("IA").style.backgroundColor = '#ffffff'
            document.getElementById("IA").style.color = 'rgb(0,0,0)'

            document.getElementById("SLIC").style.backgroundColor = '#ffffff'
            document.getElementById("SLIC").style.color = 'rgb(0,0,0)'
        }

    }


}


function changeColorIA(){
    console.log("wesh");
    let button = document.getElementById('IA');
    let color = button.style.backgroundColor ;

    if(color == '' ){
        button.style.backgroundColor = 'rgb(118,189,122)'
        document.getElementById('SLIC').style.backgroundColor = '#ffffff';
        document.getElementById("SLIC").style.color = 'rgb(0,0,0)'

        document.getElementById('AUTO').style.backgroundColor = '#ffffff'
        document.getElementById("AUTO").style.color = 'rgb(0,0,0)'
    }
    else{

        console.log(color)
        if(color == 'rgb(255, 255, 255)'){
            button.style.backgroundColor = 'rgb(118,189,122)';
            button.style.color = 'rgb(255,255,255)'
            
            document.getElementById("SLIC").style.backgroundColor = '#ffffff'
            document.getElementById("SLIC").style.color = 'rgb(0,0,0)'

            document.getElementById("AUTO").style.backgroundColor = '#ffffff'
            document.getElementById("AUTO").style.color = 'rgb(0,0,0)'
        }

    }
}
