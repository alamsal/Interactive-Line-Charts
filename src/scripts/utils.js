//Compute DOY
Date.prototype.dayOfYear = function(){
    var j1= new Date(this);
    j1.setMonth(0, 0);
    return Math.round((this-j1)/8.64e7);
};

//Compute Date from DOY
Date.fromDayOfYear = function(n, y){
    if(!y) y= new Date().getFullYear();
    var d= new Date(y, 0, 1);        
    return new Date(d.setMonth(0, n));       
};

//2-digit padding    
function pad(n){
    return n > 9 ? "" + n: "0" + n;
}