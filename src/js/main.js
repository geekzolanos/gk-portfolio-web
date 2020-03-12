(function() {
	'use strict';

	/*----------------------------------------
		Detect Mobile
	----------------------------------------*/
	var isMobile = {
		Android: function() {
			return navigator.userAgent.match(/Android/i);
		},
			BlackBerry: function() {
			return navigator.userAgent.match(/BlackBerry/i);
		},
			iOS: function() {
			return navigator.userAgent.match(/iPhone|iPad|iPod/i);
		},
			Opera: function() {
			return navigator.userAgent.match(/Opera Mini/i);
		},
			Windows: function() {
			return navigator.userAgent.match(/IEMobile/i);
		},
			any: function() {
			return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
		}
	};

	/*----------------------------------------
		Back to top
	----------------------------------------*/
	var backToTop = function() {
		$('.js-backtotop').on('click', function(e){
			e.preventDefault();
			$('html, body').animate({
	      scrollTop: $('body').offset().top
	    }, 700, 'easeInOutExpo');
		});
	}

	var nextScroll = function() {
		$('.js-next').on('click', function(e){
			e.preventDefault();
			$('html, body').animate({
      	scrollTop: $( $.attr(this, 'href') ).offset().top
    	}, 700, 'easeInOutExpo');
		});

		$(window).scroll(function(){

			var $this = $(this),
				st = $this.scrollTop();

			if (st > 10) {
				$('.js-next').addClass('probootstrap-sleep');
			} else {
				$('.js-next').removeClass('probootstrap-sleep');
			}

		});
	}

	/*----------------------------------------
		Burger Menu
	----------------------------------------*/	
	var mobileMenuControl = function() {
		

		// click burger menu
		$('.probootstrap-burger-menu').on('click', function(e){
			e.preventDefault();
			if ($('body').hasClass('show')) {
				$('.probootstrap-burger-menu').removeClass('active');
				$('body').removeClass('show');
			} else {
				$('.probootstrap-burger-menu').addClass('active');
				$('body').addClass('show');
			}
		});

		if ($(window).width() > 766) {
			$('body').removeClass('probootstrap-mobile-menu-active');
			$('.probootstrap-burger-menu').removeClass('active');
		} else {
			$('body').addClass('probootstrap-mobile-menu-active');
		}

		$(window).resize(function(){
			if ($(window).width() > 766) {
				$('body').removeClass('probootstrap-mobile-menu-active');
				$('.probootstrap-burger-menu').removeClass('active');
			} else {
				$('body').addClass('probootstrap-mobile-menu-active');
			}
		});

		// Click outside of the Mobile Menu content
		$(document).click(function (e) {
	    var container = $(".probootstrap-nav, .probootstrap-burger-menu");
	    
	    if (!container.is(e.target) && container.has(e.target).length === 0) {
	      if ( $('body').hasClass('show') ) {
					$('body').removeClass('show');
					$('.probootstrap-burger-menu').removeClass('active');
				}
	    }
		});
	};

	/*----------------------------------------
		Menu Hover
	----------------------------------------*/
	var menuHover = function() {
		if (!isMobile.any()) {
			$('.probootstrap-navbar .navbar-nav li.dropdown').hover(function() {
			  $(this).find('> .dropdown-menu').stop(true, true).delay(200).fadeIn(500).addClass('animated-fast fadeInUp');
			}, function() {
				$(this).find('> .dropdown-menu').stop(true, true).fadeOut(200).removeClass('animated-fast fadeInUp')
			});
		}
	}

	
	/*----------------------------------------
		Content Animation
	----------------------------------------*/
	var contentWayPoint = function() {
		var i = 0;
		$('.probootstrap-animate').waypoint({
			handler: function( direction ) {
				if( direction === 'down' && !$(this.element).hasClass('probootstrap-animated') ) {				
					i++;
					$(this.element).addClass('item-animate');
					setTimeout(function(){
						$('body .probootstrap-animate.item-animate').each(function(k){
							var el = $(this);
							setTimeout( function () {
								var effect = el.data('animate-effect');
								if ( effect === 'fadeIn') {
									el.addClass('fadeIn probootstrap-animated');
								} else if ( effect === 'fadeInLeft') {
									el.addClass('fadeInLeft probootstrap-animated');
								} else if ( effect === 'fadeInRight') {
									el.addClass('fadeInRight probootstrap-animated');
								} else {
									el.addClass('fadeInUp probootstrap-animated');
								}
								el.removeClass('item-animate');
							},  k * 200, 'easeInOutExpo' );
						});					
					}, 200);				
				}
			},
			offset: '95%'
		});
	};

	

	/*----------------------------------------
		Counter Animation
	----------------------------------------*/
	var counter = function() {
		$('.js-counter').countTo({
			 formatter: function (value, options) {
	      return value.toFixed(options.decimals);
	    },
		});
	};
	
	var counterWayPoint = function() {
		if ($('#probootstrap-counter').length > 0 ) {
			$('#probootstrap-counter').waypoint({
				handler: function( direction ) {										
					if( direction === 'down' && !$(this.element).hasClass('probootstrap-animated') ) {
						setTimeout( counter , 400);					
						$(this.element).addClass('probootstrap-animated');
					}
				},
				offset: '90%' 
			});
		}
	};

	var magnificPopupControl = function() {
		$('.image-popup').magnificPopup({
			type: 'image',
			removalDelay: 300,
			mainClass: 'mfp-with-zoom',
			gallery:{
				enabled:true
			},
			zoom: {
				enabled: true, // By default it's false, so don't forget to enable it

				duration: 300, // duration of the effect, in milliseconds
				easing: 'ease-in-out', // CSS transition easing function

				// The "opener" function should return the element from which popup will be zoomed in
				// and to which popup will be scaled down
				// By defailt it looks for an image tag:
				opener: function(openerElement) {
				// openerElement is the element on which popup was initialized, in this case its <a> tag
				// you don't need to add "opener" option if this code matches your needs, it's defailt one.
				return openerElement.is('img') ? openerElement : openerElement.find('img');
				}
			}
		});

		$('.with-caption').magnificPopup({
			type: 'image',
			closeOnContentClick: true,
			closeBtnInside: false,
			mainClass: 'mfp-with-zoom mfp-img-mobile',
			image: {
				verticalFit: true,
				titleSrc: function(item) {
					return item.el.attr('title') + ' &middot; <a class="image-source-link" href="'+item.el.attr('data-source')+'" target="_blank">image source</a>';
				}
			},
			zoom: {
				enabled: true
			}
		});


		$('.popup-youtube, .popup-vimeo, .popup-gmaps').magnificPopup({
      disableOn: 700,
      type: 'iframe',
      mainClass: 'mfp-fade',
      removalDelay: 160,
      preloader: false,

      fixedContentPos: false
    });
	}

	var inlineSVG = function() {
		$('img.svg').each(function(){
	    var $img = $(this);
	    var imgID = $img.attr('id');
	    var imgClass = $img.attr('class');
	    var imgURL = $img.attr('src');

	    $.get(imgURL, function(data) {
	        // Get the SVG tag, ignore the rest
	        var $svg = jQuery(data).find('svg');

	        // Add replaced image's ID to the new SVG
	        if(typeof imgID !== 'undefined') {
	            $svg = $svg.attr('id', imgID);
	        }
	        // Add replaced image's classes to the new SVG
	        if(typeof imgClass !== 'undefined') {
	            $svg = $svg.attr('class', imgClass+' replaced-svg');
	        }

	        // Remove any invalid XML tags as per http://validator.w3.org
	        $svg = $svg.removeAttr('xmlns:a');

	        // Replace image with new SVG
	        $img.replaceWith($svg);

	    }, 'xml');

	});
	};

	// Loading page
	var loaderPage = function() {
		$(".probootstrap-loader").fadeOut("slow");
	};

	var goToTop = function() {

		$('.js-gotop').on('click', function(event){
			
			event.preventDefault();

			$('html, body').animate({
				scrollTop: $('html').offset().top
			}, 500, 'easeInOutExpo');
			
			return false;
		});

		$(window).scroll(function(){
			var $win = $(window);
			if ($win.scrollTop() > 200) {
				$('.js-top').addClass('active');
			} else {
				$('.js-top').removeClass('active');
			}

		});
	
	};

	var lazyload = function() {
		new LazyLoad({
			elements_selector: "[data-lazyload]",
			load_delay: 300
		});
	};
	/*----------------------------------------
		Document Ready 
	----------------------------------------*/
	$(document).ready(function(){
		menuHover();
		lazyload();
		backToTop();
		magnificPopupControl();
		mobileMenuControl();
		nextScroll();
		loaderPage();
		goToTop();
		inlineSVG();
	});
})();