$(document).ready(function(){

  //////
  function bg(){
    ctx.beginPath();
    ctx.fillStyle = "black";
    ctx.fillRect(0,0, 300, 200);
    ctx.closePath();
  }
  function initCtx(){
    ctx.textBaseline = "bottom";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.font = "normal 20px Arial";
  }
  function getTimeText(){
    let h = d.getHours();
    let hours = h < 10 ? '0'+h : h;
    let min = d.getMinutes();
    let minutes = min < 10 ? '0'+min : min;
    let sec = d.getSeconds();
    let secondes = sec < 10 ? '0'+sec : sec;

    return hours +":"+minutes+":"+secondes;
  }
  function getTimeDate(){
    let day = d.getDay();
    let date = d.getDate();
    let month = d.getMonth();
    let year = d.getFullYear();

    return days[day]+" "+date+" "+months[month]+" "+year;
  }
  function drawTime(){
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.font = "bolder 25px Arial";
    ctx.textAlign = "center";
    let timeText = getTimeText();
    ctx.fillText(timeText, canvas.width/2, 170);
    ctx.closePath();
  }
  function drawDate(){
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.font = "normal 15px Arial";
    ctx.textAlign = "center";
    let dateText = getTimeDate();
    ctx.fillText(dateText, canvas.width/2, 190);
    ctx.closePath();
  }

  function drawArrows(){
    drawPrevArrow();
    drawNextArrow();
  }
  function drawPrevArrow(){
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.font = "bolder 30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("<", 10, 100);
    ctx.closePath();
  }
  function drawNextArrow(){
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.font = "bolder 30px Arial";
    ctx.textAlign = "center";
    ctx.fillText(">", 290, 100);
    ctx.closePath();
  }

  function drawScreenBg(screen){
    ctx.beginPath();
    ctx.fillStyle = screen.color;
    ctx.fillRect(screen.x, screen.y, screen.w, screen.h);
    ctx.closePath();
  }
  function drawScreenCity(screen){
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.font = "bolder 30px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(screen.city, 20 + screen.x, 20);
    ctx.closePath();
  }
  function drawImage(screen){
    let url = screen.url;
    if (!screen.image){
      let image = new Image();
      image.src = url;
      image.onload = function(){
        ctx.drawImage(image, 150 + screen.x, 20);
        screen.image = image;
      }
    }else{
      ctx.drawImage(screen.image, 150 + screen.x, 20);
    }
  }
  function drawCondition(screen){
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.font = "normal 10px Arial";
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText(screen.condition, 280 + screen.x, 140);
    ctx.closePath();
  }
  function drawTmp(screen){
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.font = "bolder 40px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(screen.tmp, 20 + screen.x, 100);
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.font = "bolder 10px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText('°C', 65 + screen.x, 100);
    ctx.closePath();
  }

  function drawScreens(){
    for (let i = 0; i < activScreens.length; i ++) {
      let screen = activScreens[i];
      drawScreenBg(screen);
      drawScreenCity(screen);
      drawImage(screen);
      drawCondition(screen);
      drawTmp(screen);
    }
  }

  function moveScreen(screen, sens) {
    if (sens === 'next'){
      screen.x = screen.x - screen.vx;
    }
    if (sens === 'prev'){
      screen.x = screen.x + screen.vx;
    }
  }
  function deleteScreen(){
    activScreens = activScreens.slice(1);
  }
  function stopMove(){
    sliding = false;
    sens = null;
    deleteScreen();
    clicking = true;
  }
  function checkCurrentScreen(screen){
    if (sens === 'next' && screen.x < -300){
      stopMove();
    }
    if (sens === 'prev' && screen.x > 300){
      stopMove();
    }
  }
  function moveScreens(){
    for (let i = 0; i < activScreens.length; i ++) {
      let screen = activScreens[i];
      moveScreen(screen, sens)
      if (0 === i) {
        checkCurrentScreen(screen);
      }
    }
  }


  function interFrame(){
    bg();
    drawScreens(indexSlide);
    if (sliding) {
      moveScreens(indexSlide);
    }
    initCtx();
    if (clicking){
      drawArrows();
    }
    drawTime();
    drawDate();
  }
  function frame(){
    interFrame();
    window.requestAnimationFrame(frame);
  }
  ////


  function getCityInfo(city) {
    return $.ajax({
      url : "https://www.prevision-meteo.ch/services/json/"+city
    });
  }
  function addScreen(data, x, y){
    let screen = createScreen(data, x, y);
    activScreens.push(screen);
  }
  function createScreen(data, x, y) {
    let cityInfo = data.city_info || {}, city = cityInfo.name;
    let currentCondition = data.current_condition || {},
      tmp = currentCondition.tmp,
      iconBig = currentCondition.icon_big,
      condition = currentCondition.condition;
    return {
      x : x,
      y : y,
      vx : 3,
      w : 300,
      h : 150,
      color : "black",
      city : city,
      tmp : tmp,
      url : iconBig,
      condition : condition
    }
  }
  function changeIndex(sens){
    if (sens === 'next'){
      indexSlide ++;
    }
    if (sens === 'prev'){
      indexSlide --;
    }
    if (indexSlide < 0) {
      indexSlide = cities.length -1;
    }
    if (indexSlide > cities.length -1){
      indexSlide = 0;
    }
    return indexSlide;
  }



  function slide(direction) {
    clicking = false;
    sens = direction;
    indexSlide = changeIndex(sens);
    getCityInfo( cities[indexSlide] )
      .then(function(data){
        addScreen(data, sens === 'next' ? 300 : -300, 0);
        sliding = true;
      })
      .catch(function(){
        slide(sens);
      });
  }
  function click(sens){
    slide(sens);
    restartInterval();
  }

  function initScreen(indexSlide){
    getCityInfo( cities[indexSlide] ).then(function(data){
      addScreen(data, 0, 0);
      launchInterval();
    });
  }
  function launchInterval(){
    inter = setInterval(function(){
      slide('next');
    }, 10000);
  }
  function restartInterval(){
    if (inter) {
      clearInterval(inter);
      launchInterval();
    }
  }

  var cities = ["Bordeaux", "Marseille", "Paris", "Strasbourg", "Lille", "Lyon"];
  var indexSlide = 0;
  var activScreens = [];
  var sliding = false;
  var sens = null;
  var inter = null;
  var clicking = true;

  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext('2d');
  var days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  var months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aôut", "Septembre", "Octobre", "Novembre", "Décembre"];

  var d = new Date();
  setInterval(function(){
    d = new Date();
  }, 1000);
  initScreen(indexSlide);
  frame();
  canvas.onclick = function(ev){
    if (clicking){
      let clickX = ev.layerX;
      if (clickX >= 0 && clickX <= 50) {
        click('prev');
      }
      if (clickX >= 250 && clickX <= 300) {
        click('next');
      }
    }
  };

});