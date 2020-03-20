(function() {
	'use strict';
	
	const Sorts = {DateDesc: 0, DateAsc: 1, AlfaAsc: 2, AlfaDesc: 3};

	let $portfolioGrid, $portfolioFilters, portfolioCoords = [];

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

	const portfolioGrid = function() {
		var $node = $('#portfolio-grid');
		if($node.length == 0) return false;

		// Initialize Muuri
		$portfolioGrid = new Muuri($node.get(0), {
			sortData: {
				date: (_it, el) => parseInt(el.dataset.date),
				name: (_it, el) => el.querySelector('.meta--title h2').innerText.toUpperCase()
			}
		});
		
		// Platform with Icons
		const data = $('#portfolio-plt option[value]').map(function() {
			return {
				innerHTML: `<i class="${this.dataset.icon}"></i> ${this.innerText}`,
				text: this.innerText,
				value: this.value
			};
		});

		// Filters
		$portfolioFilters = {
			lang: new SlimSelect({
				select: '#portfolio-lang',
				onChange: filterMuuri
			}),
			plt: new SlimSelect({
				select: '#portfolio-plt', 
				data,
				onChange: filterMuuri
			}),
			filter: new SlimSelect({
				select: '#portfolio-filter',
				showSearch: false,
				onChange: sortMuuri
			}),
			search: $('#search-input')
		};

		// Initial Sort;
		sortMuuri(true);
		
		// Hover Effect
		$('.portfolio-item').hover(function() {
			if($(this).find('img.loaded').length == 0) return false;

			const $title = $(this).find('.meta--title'),
					$h2 = $title.children('h2'),
					idx = $(this).index();
			
			let coords = portfolioCoords[idx];

			if(!coords) {
				const $content = $(this).find('.meta--content');
				coords = $title.position().top - $content.position().top - 8;
				portfolioCoords[idx] = coords;
			}
			
			$title.css('transform', `translateY(-${coords}px)`);
			$h2.css('transform', 'scale(1.8)');
		}, function() {
			const $title = $(this).find('.meta--title'),
				  $h2 = $title.children('h2');

			$title.css('transform', '');
			$h2.css('transform', '');
		});

		// Invalidate coords on resize
		$(window).resize(() => (portfolioCoords = []));

		// Search Bar
		$portfolioFilters.search.on('input', _.debounce(filterMuuri, 300));
	};

	const sortMuuri = function(instant) {
		switch(parseInt($portfolioFilters.filter.selected())) {
			case Sorts.DateDesc:
				$portfolioGrid.sort('date', {descending: true, layout: instant && 'instant'});
				break;
			case Sorts.DateAsc:
				$portfolioGrid.sort('date');
				break;
			case Sorts.AlfaAsc:
				$portfolioGrid.sort('name');
				break;
			case Sorts.AlfaDesc:
				$portfolioGrid.sort('name', {descending: true});
				break;
		}
	};

	const filterMuuri = function() {
		const selLang = $portfolioFilters.lang.selected(),
			  selPlt = $portfolioFilters.plt.selected(),
			  searchVal = $portfolioFilters.search.val(),
			  filterLang = reduceFilter.bind(this, selLang),
			  filterPlt = reduceFilter.bind(this, selPlt);

		$portfolioGrid.filter(it => {
			const $el = it.getElement(),
				  lang = $el.dataset.lang.split(','),
				  plt = $el.dataset.plt.split(','),
				  hasName = !searchVal || includesStr(searchVal, $el.querySelector(".meta--title h2").innerText),
				  hasLang = !selLang.length || lang.reduce(filterLang, selLang.includes(lang[0])),
				  hasPlt = !selPlt.length || plt.reduce(filterPlt, selPlt.includes(plt[0]));
			
			return (hasName && hasLang && hasPlt);
		});
	};

	const reduceFilter = (sel, acc, val) =>  (sel.includes(val) ? ++acc : acc);
	const includesStr = (t0, t1) => (t1.toLocaleLowerCase().includes(t0.toLocaleLowerCase()));

	const lazyload = function() {
		const opts = {
			elements_selector: "[data-lazyload]",
			load_delay: 300
		};

		if($portfolioGrid)
			opts.callback_loaded = () => {
				$portfolioGrid.refreshItems();
				$portfolioGrid.layout();
			};

		new LazyLoad(opts);
	};

	var bsTooltips = function() {
		$('[data-toggle="tooltip"]').tooltip();
	};

	var initAos = function() {
		AOS.init({ 
			disableMutationObserver: true,
			once: true,
			duration: 650
		});
	};

	/*----------------------------------------
		Document Ready 
	----------------------------------------*/
	$(document).ready(function(){
		menuHover();
		portfolioGrid();
		lazyload();
		bsTooltips();
		initAos();
		backToTop();
		magnificPopupControl();
		mobileMenuControl();
		nextScroll();
		loaderPage();
		goToTop();
		inlineSVG();
	});
})();