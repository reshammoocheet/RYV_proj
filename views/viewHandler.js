function switchPlayBtn(){
    console.log("hllo")
    var songName = document.getElementById("songNameHeader").innerText;
    if(songName.length > 0){
        var playbtn = document.getElementById('play-btn');
        var pausebtn = document.getElementById('pause-btn');

        if(pausebtn.Style["display"] == "none"){
            pausebtn.Style["display"] = "flex";
            playbtn.Style["display"] = "none";
        }
        else if(playbtn.Style["display"] == "none"){
            playbtn.Style["display"] = "flex";
            pausebtn.Style["display"] = "none";
        }
    }
}