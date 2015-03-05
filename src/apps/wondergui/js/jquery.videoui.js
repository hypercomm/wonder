/*
 * Bootstrap video player
 * A customizable HTML5 video player plugin for jQuery based on bootstrap UI
 * version: 1.0
 * Author: zied.hosni.mail@gmail.com
 * 2012 © html5-ninja.com
 * 2012-09-26
 */

(function( $ ){

    $.fn.videoUI = function( options ) {

        var settings = $.extend( {
            'playMedia'  : true,
            'progressMedia' : true,
            'timerMedia': true,
            'volumeMedia':5,
            'fullscreenMedia':true,
            'autoHide':true,
            'autoPlay':false
        }, options);

        var video = document.getElementById(this.attr('id'));
        var controllerClass = this.attr('id');
        var duration = currentTime = timer = seekx = seekPos = buffered = timerBuffer=0;
        var widthController = this.width();
       // var widthController = "100%";


        this.after('<div class="videoController container-fluid '+controllerClass+'"></div>');
        //$('.'+controllerClass).width(widthController);

        /*
        video.addEventListener("loadedmetadata", function() {
            duration = video.duration;

            var timerBuffer = setInterval(function(){

                buffered = video.buffered.end(0)+video.buffered.start(0);

                if (video.currentTime==buffered){
                    clearInterval(timerBuffer);
                }
                else{
                    $('.'+controllerClass+' .progress .bufferBar').width( (buffered/duration*100 )+ '%');
                }
            },100);

        });
        */


        if(settings.progressMedia){
            $('.'+controllerClass).append('<div class="progress" style="cursor:pointer"><div class="progress-bar progressBar" style="width: 0%;"/><div class="progress-bar bufferBar" style="width: 0%;opacity:0.5"/></div>');

            this.bind('play',function(){
                timer = setInterval(function(){
                    currentTime = video.currentTime;
                    var width = (video.currentTime/video.duration)*100+'%';
                    $('.'+controllerClass+' .progress .progressBar').width(width);
                },100);

            });

            this.bind('suspend',function(){

                $('.'+controllerClass+' .progress').addClass('progress-striped active');
            });

            this.bind('timeupdate',function(){
                $('.'+controllerClass+' .progress').removeClass('progress-striped active');
            })

            $('.'+controllerClass+' .progress').mousemove(function(e){
                seekx = e.pageX ;

            });

            $('.'+controllerClass+' .progress').bind('click',function(){
                seekPos = seekx/$(this).width()*100;
                console.log(video.duration*seekPos);
                video.currentTime=video.duration*seekPos/100;
                video.play();
                return false;
            });

        }
/*
        if(settings.autoPlay){
            video.play()
        }
*/
        this.bind('click',function(){
            $(this).hasClass('pauseMedia') ?  video.pause() :  video.play();
            $(this).children('span').toggleClass('glyphicon glyphicon-pause');
            $(this).toggleClass('pauseMedia');
            return false;
        });

        if (settings.playMedia){
            $('.'+controllerClass).append('<a href="#" class="playMedia"><span class="glyphicon glyphicon-play"></span></a>');

            $('.'+controllerClass+' .playMedia').bind('click',function(){
                $(this).hasClass('pauseMedia') ?  video.pause() :  video.play();
                $(this).children('span').toggleClass('glyphicon glyphicon-pause');
                $(this).toggleClass('pauseMedia');
                return false;
            });

            this.bind('play',function(){
                $('.'+controllerClass+' .playMedia span').addClass('glyphicon glyphicon-pause');
                $('.'+controllerClass+' .playMedia').addClass('pauseMedia');
            });

            this.bind('pause',function(){
                clearInterval(timer);
                $('.'+controllerClass+' .playMedia span').removeClass('glyphicon glyphicon-pause');
                $('.'+controllerClass+' .playMedia').removeClass('pauseMedia');
            });

            this.bind("ended", function() {
                $('.'+controllerClass+' .playMedia span').removeClass('glyphicon glyphicon-pause');
                $('.'+controllerClass+' .playMedia').removeClass('pauseMedia');
            });

        }


        if (settings.timerMedia){
            $('.'+controllerClass).append('<h6 class="timer"></h6>');
            var timerProgress = setInterval(function(){
                var ctime = video.currentTime;
                var dtime = video.duration;
                if (dtime)
                    $('.'+controllerClass+' h6').html(pad(Math.floor(ctime / 60),2)+':'+pad(Math.floor(ctime % 60),2) +' / ' + pad(Math.floor(dtime / 60),2)+':'+pad(Math.floor(dtime % 60),2) );
                else
                    $('.'+controllerClass+' h6').html('00:00 / 00:00');
            },1000);
        }

        function pad(num, size) {
            var s = num+"";
            while (s.length < size) s = "0" + s;
            return s;
        }


        if (settings.volumeMedia){
            var volume = settings.volumeMedia;
            var on='';
            var html = '<span class="mute glyphicon glyphicon-volume-up"></span><ul class="volumeMedia">';
            for(i=0;i<10;i++){
                if (i<volume) on=' class="list-unstyled on"';
                else on=' class="list-unstyled"'
                html += '<li'+on+'></li>'
            }
            html += '<ul/>';

            $('.'+controllerClass).append(html);

            if (volume < 5 ) $('.'+controllerClass+ ' .mute').addClass('glyphicon glyphicon-volume-down').removeClass('glyphicon-volume-up');
            else $('.'+controllerClass+ ' .mute').addClass('glyphicon glyphicon-volume-up').removeClass('glyphicon-volume-down');

            $('.'+controllerClass+ ' .volumeMedia li').click(function(){
                video.volume=($(this).index()+1)/10;
                $('.'+controllerClass+ ' .volumeMedia li').removeClass('on');
                for(j=0;j< $(this).index()+1;j++ )
                    $('.'+controllerClass+ ' .volumeMedia li').eq(j).addClass('on');
                if ($(this).index()+1 < 5 ) $('.'+controllerClass+ ' .mute').addClass('glyphicon glyphicon-volume-down').removeClass('glyphicon-volume-up');
                else $('.'+controllerClass+ ' .mute').addClass('glyphicon glyphicon-volume-up').removeClass('glyphicon-volume-down');
            });

            $('.'+controllerClass+ ' .mute').click(function(){
                if (video.volume >0){
                    $('.'+controllerClass+ ' .mute').addClass('glyphicon glyphicon-volume-off').removeClass('glyphicon-volume-down').removeClass('glyphicon-volume-up');
                    $('.'+controllerClass+ ' .volumeMedia li').removeClass('on');
                    video.volume = 0;
                }
            });
        }


        if (settings.fullscreenMedia){
            $('.'+controllerClass).append('<span class="fullscreen glyphicon glyphicon-fullscreen"></span>');
            $('.'+controllerClass+ ' .fullscreen').click(function(){
                fullscreenMode(video);
            });
        }

        function fullscreenMode(element) {
            if(element.requestFullScreen) {
                //w3c
                element.requestFullScreen();
            } else if(element.webkitRequestFullScreen) {
                //Google Chrome
                element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
            } else if(element.mozRequestFullScreen){
                //Firefox
                element.mozRequestFullScreen();
            } else {
                alert('Does Not Support Full Screen Mode');
            }
        }

        if (settings.autoHide){
            this.parents('.videoUiWrapper').mouseleave(function(e) {
                if (!$('.'+controllerClass).is(':visible') ){
                    e.stopPropagation();
                }
                else
                    $('.'+controllerClass).delay(100).slideUp() ;
            });

            this.parents('.videoUiWrapper').mouseover(function(e) {
                if ($('.'+controllerClass).is(':visible'))
                    e.stopPropagation();
                else
                    $('.'+controllerClass).delay(100).slideDown() ;
            });

        }else{
            $('.'+controllerClass).css({
                'position':'relative',
                'left':'0',
                'bottom':'0',
                'top':'-5px'
            });
        }



    };
})( jQuery );
