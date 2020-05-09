(function() {
	'use strict';
	
	const Sorts = {DateDesc: 0, DateAsc: 1, AlfaAsc: 2, AlfaDesc: 3};

	let $portfolioGrid, $portfolioFilters, portfolioCoords = [];

	/*----------------------------------------
		Back to top
	----------------------------------------*/
	const backToTop = function() {
		$('.js-backtotop').on('click', function(e){
			e.preventDefault();
			$('html, body').animate({
				scrollTop: $('body').offset().top
			}, 700, 'easeInOutExpo');
		});
	};

	/*----------------------------------------
		Burger Menu
	----------------------------------------*/
	const earlymobileMenuControl = function() {
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
	}
	
	const mobileMenuControl = function() {
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
	};

	/*----------------------------------------
		Counter Animation
	----------------------------------------*/
	const counter = function() {
		$('.js-counter').countTo({
			formatter: function (value, options) {
				return value.toFixed(options.decimals);
			}
		});
	};

	/*----------------------------------------
		Inline SVG
	----------------------------------------*/
	const inlineSVG = function() {
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

	/*----------------------------------------
		Hide Preload
	----------------------------------------*/
	const loaderPage = function() {
		$("#probootstrap-loader").fadeOut("slow");
	};

	/*----------------------------------------
		Go To Top
	----------------------------------------*/
	const goToTop = function() {
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

	/*----------------------------------------
		Portfolio Init, Sort and Filtering
	----------------------------------------*/
	const reduceFilter = (sel, acc, val) =>  (sel.includes(val) ? ++acc : acc);
	const includesStr = (t0, t1) => (t1.toLocaleLowerCase().includes(t0.toLocaleLowerCase()));

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

	/*----------------------------------------
		Image Lazyload
	----------------------------------------*/
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

		return new LazyLoad(opts);
	};

	/*----------------------------------------
		Bootstrap
	----------------------------------------*/
	const bsTooltips = function() {
		$('[data-toggle="tooltip"]').tooltip();
	};

	/*----------------------------------------
		Animate On Scroll
	----------------------------------------*/
	const initAos = function() {
		AOS.init({
			disableMutationObserver: true,
			once: true,
			duration: 650
		});
	};

	/*----------------------------------------
		Swiper
	----------------------------------------*/
	const swiper = function() {
		return new Swiper ('.single__slideshow', {
			effect: 'fade',
			autoplay: {
				delay: 4500,
				disableOnInteraction: false
			}
		});
	}

	/*----------------------------------------
		FancyBox
	----------------------------------------*/
	const fancybox = function() {
		$('[data-fancybox="slideshow"]').fancybox({
			animationEffect: "zoom",
			arrows: false,
			infobar: false,
			toolbar: false,
			hash: false
		});
	}

	/*----------------------------------------
		Document Ready 
	----------------------------------------*/
	function init() {
		counter();
		portfolioGrid();
		lazyload();
		bsTooltips();
		backToTop();
		mobileMenuControl();
		goToTop();
		inlineSVG();
		swiper();
		fancybox();
		initAos();
		TurbolinksAnimate.init();
	}

	function earlyInit() {
		Turbolinks.start();
		earlymobileMenuControl();
		loaderPage();
	}

	$(document).on('turbolinks:load', init);
	$(document).ready(earlyInit);
})();