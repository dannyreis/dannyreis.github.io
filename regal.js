window.onload = function() {
	$('img.nav').bind('mouseenter mouseleave', function() {
	    $(this).attr({
	        src: $(this).attr('data-alt-src') 
	        , 'data-alt-src': $(this).attr('src') 
	    })
	})
	
	$('a[href^="#"]').on('click',function (e) {
	    e.preventDefault();

	    var target = this.hash;
	    $target = $(target);

	    $('html, body').stop().animate({
	        'scrollTop': $target.offset().top
	    }, 900, 'swing', function () {
	        window.location.hash = target;
	    });
	});
	
};