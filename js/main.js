var btn = document.getElementById('btn');
var message = document.getElementById('msg');
var failMessage = document.getElementById('f-msg');
var clipboard = new Clipboard(btn);

for (var i; i < btn.length; i++) {

};

clipboard.on('success', function(e) {
    console.info('Action:', e.action);
    console.info('Text:', e.text);
    console.info('Trigger:', e.trigger);
    e.clearSelection();

    message.classList.toggle('content-open');
    window.setTimeout(function() {
      message.classList.remove('content-open');
    }, 2500);
});

clipboard.on('error', function(e) {
    console.error('Action:', e.action);
    console.error('Trigger:', e.trigger);

    failMessage.classList.toggle('content-open');
    window.setTimeout(function() {
      failMessage.classList.remove('content-open');
    }, 5500);
});

var message = document.getElementById('msg');
var failMessage = document.getElementById('f-msg');
var close = document.getElementsByClassName("closebtn");
var i;

for (i = 0; i < close.length; i++) {
    close[i].onclick = function(){
        var div = this.parentElement;
        message.classList.remove('content-open');
    }
};

for (i = 0; i < close.length; i++) {
    close[i].onclick = function(){
        var div = this.parentElement;
        failMessage.classList.remove('content-open');
    }
};

// var page = document.getElementById('page-transition');
// var btn = document.getElementById('close')
//
// btn.addEventListener('click', function (e) {
//     page.classList.add('page-close');
// });
