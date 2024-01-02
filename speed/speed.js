
// https://stackoverflow.com/questions/58482163/how-to-improve-html-canvas-performance-drawing-pixels

window.onload = () => {

    const SCREEN_WIDTH = window.innerWidth;
    const SCREEN_HEIGHT = window.innerHeight;

    var ctx=cnv.getContext("2d");
    cnv.setAttribute('width', SCREEN_WIDTH)
    cnv.setAttribute('height', SCREEN_HEIGHT)
    var data=ctx.createImageData(SCREEN_WIDTH, SCREEN_HEIGHT);
    var buf=new Uint32Array(data.data.buffer);

    // gyorsabb

    if (true) {
        function draw(x1,y1,x2,y2){
        var i=0;
        for(var y=0;y<SCREEN_HEIGHT;y++)
            for(var x=0;x<SCREEN_WIDTH;x++){
            var d1=(Math.sqrt((x-x1)*(x-x1)+(y-y1)*(y-y1))/10) & 1;
            var d2=(Math.sqrt((x-x2)*(x-x2)+(y-y2)*(y-y2))/10) & 1;
            buf[i++]=d1==d2?0xFF000000:0xFFFFFFFF;
            }
        ctx.putImageData(data,0,0);
        }
    } else {
        // Lassabb
    
        function draw(x1,y1,x2,y2){
          //ctx.clearRect(0,0,600,600);
          //ctx.fillStyle="black";
          for(var y=0;y<SCREEN_HEIGHT;y++)
            for(var x=0;x<SCREEN_WIDTH;x++){
              var d1=(Math.sqrt((x-x1)*(x-x1)+(y-y1)*(y-y1))/10) & 1;
              var d2=(Math.sqrt((x-x2)*(x-x2)+(y-y2)*(y-y2))/10) & 1;
              //if(d1==d2)ctx.fillRect(x,y,1,1);
              ctx.fillStyle=d1==d2?"black":"white";
              ctx.fillRect(x,y,1,1);
            }
        }
    }

    // DRAW
    var cnt=0;
    setInterval(function(){
      cnt++;
      var start=Date.now();
      draw(300+300*Math.sin(cnt*Math.PI/180),
           300+300*Math.cos(cnt*Math.PI/180),
           500+100*Math.sin(cnt*Math.PI/100),
           500+100*Math.cos(cnt*Math.PI/100));
      t.innerText="Frame time:"+(Date.now()-start)+"ms";
    },20);

}