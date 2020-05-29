/* eslint-disable no-console */
/* eslint-disable no-tabs */
/* eslint-disable func-names */
/* global _, Swiper, Muuri, SlimSelect, LazyLoad, AOS, Swiper, lottie,
   particlesJS, TurbolinksAnimate, Turbolinks */
/* eslint-env browser, jquery */

const EasterSekret = window.atob('ZWxlbmE=');
(() => {
  const Sorts = {
    DateDesc: 0, DateAsc: 1, AlfaAsc: 2, AlfaDesc: 3,
  };

  let $portfolioGrid; let $portfolioFilters; let
    portfolioCoords = [];

  let easterWord = '';

  /*----------------------------------------
	Back to top
----------------------------------------*/
  const backToTop = function () {
    $('.js-backtotop').on('click', (e) => {
      e.preventDefault();
      $('html, body').animate({
        scrollTop: $('body').offset().top,
      }, 700, 'easeInOutExpo');
    });
  };

  /*----------------------------------------
		Burger Menu
	----------------------------------------*/
  const mobileMenu = function () {
    $('.nav__menu').click((e) => {
      e.preventDefault();
      $('body').toggleClass('menu--open');
    });

    $('.content__backdrop').click(() => $('body').removeClass('menu--open'));
  };

  /*----------------------------------------
		Counter Animation
	----------------------------------------*/
  const counter = function () {
    $('.js-counter').countTo({
      formatter(value, options) {
        return value.toFixed(options.decimals);
      },
    });
  };

  /*----------------------------------------
		Hide Preload
	----------------------------------------*/
  const loaderPage = function () {
    $('#main__loader').fadeOut('slow');
  };

  /*----------------------------------------
		Go To Top
	----------------------------------------*/
  const goToTop = function () {
    $('.js-gotop').on('click', (e) => {
      e.preventDefault();

      $('html, body').animate({
        scrollTop: $('html').offset().top,
      }, 500, 'easeInOutExpo');
    });

    $(window).scroll(() => {
      const $win = $(window);
      if ($win.scrollTop() > 200) {
        $('.js-top').addClass('active');
      } else {
        $('.js-top').removeClass('active');
      }
    });
  };

  /*----------------------------------------
		Project Item hover effect
  ----------------------------------------*/
  const reduceFilter = (sel, acc, val) => (sel.includes(val) ? (acc + 1) : acc);
  const includesStr = (t0, t1) => (t1.toLocaleLowerCase().includes(t0.toLocaleLowerCase()));

  const projectItemHover = function () {
    portfolioCoords = [];

    // Hover Effect
    const $query = $('.project__item');

    $query.hover(function () {
      if ($(this).find('img.loaded').length === 0) { return false; }

      const $title = $(this).find('.meta__title');
      const $h2 = $title.children('h2');
      const idx = $query.index(this);

      let coords = portfolioCoords[idx];

      if (!coords) {
        const $content = $(this).find('.meta__content');
        coords = $title.position().top - $content.position().top - 8;
        portfolioCoords[idx] = coords;
      }

      $title.css('transform', `translateY(-${coords}px)`);
      $h2.css('transform', 'scale(1.8)');
      return true;
    }, function () {
      const $title = $(this).find('.meta__title');
      const $h2 = $title.children('h2');

      $title.css('transform', '');
      $h2.css('transform', '');
    });

    // Invalidate coords on resize
    $(window).resize(() => { portfolioCoords = []; });
  };

  const sortMuuri = function (instant) {
    switch (parseInt($portfolioFilters.filter.selected(), 10)) {
      case Sorts.DateDesc:
      default:
        $portfolioGrid.sort('date', { descending: true, layout: instant && 'instant' });
        break;
      case Sorts.DateAsc:
        $portfolioGrid.sort('date');
        break;
      case Sorts.AlfaAsc:
        $portfolioGrid.sort('name');
        break;
      case Sorts.AlfaDesc:
        $portfolioGrid.sort('name', { descending: true });
        break;
    }
  };

  const filterMuuri = function () {
    const selLang = $portfolioFilters.lang.selected();
    const selPlt = $portfolioFilters.plt.selected();
    const searchVal = $portfolioFilters.search.val();
    const filterLang = reduceFilter.bind(this, selLang);
    const filterPlt = reduceFilter.bind(this, selPlt);

    $portfolioGrid.filter((it) => {
      const $el = it.getElement();
      const lang = $el.dataset.lang.split(',');
      const plt = $el.dataset.plt.split(',');
      const hasName = !searchVal
				|| includesStr(searchVal, $el.querySelector('.meta__title h2').innerText);
      const hasLang = !selLang.length || lang.reduce(filterLang, selLang.includes(lang[0]));
      const hasPlt = !selPlt.length || plt.reduce(filterPlt, selPlt.includes(plt[0]));

      return (hasName && hasLang && hasPlt);
    });
  };

  /*----------------------------------------
		Portfolio Init, Sort and Filtering
	----------------------------------------*/
  const portfolioGrid = function () {
    const $node = $('#portfolio__grid');
    if ($node.length === 0) { return false; }

    // Initialize Muuri
    $portfolioGrid = new Muuri($node.get(0), {
      sortData: {
        date: (_it, el) => parseInt(el.dataset.date, 10),
        name: (_it, el) => el.querySelector('.meta__title h2').innerText.toUpperCase(),
      },
    });

    // Platform with Icons
    const data = $('#portfolio-plt option[value]').map(function () {
      return {
        innerHTML: `<i class="${this.dataset.icon}"></i> ${this.innerText}`,
        text: this.innerText,
        value: this.value,
      };
    });

    // Filters
    $portfolioFilters = {
      lang: new SlimSelect({
        select: '#portfolio-lang',
        onChange: filterMuuri,
      }),
      plt: new SlimSelect({
        select: '#portfolio-plt',
        data,
        onChange: filterMuuri,
      }),
      filter: new SlimSelect({
        select: '#portfolio-filter',
        showSearch: false,
        onChange: sortMuuri,
      }),
      search: $('#search-input'),
    };

    // Initial Sort;
    sortMuuri(true);

    // Search Bar
    $portfolioFilters.search.on('input', _.debounce(filterMuuri, 300));
    return true;
  };

  /*----------------------------------------
		Image Lazyload
	----------------------------------------*/
  const lazyload = function () {
    const opts = {
      elements_selector: '[data-lazyload]',
      load_delay: 300,
    };

    if ($portfolioGrid) {
      opts.callback_loaded = () => {
        $portfolioGrid.refreshItems();
        $portfolioGrid.layout();
      };
    }

    return new LazyLoad(opts);
  };

  /*----------------------------------------
		Bootstrap
	----------------------------------------*/
  const bsTooltips = function () {
    $('[data-toggle="tooltip"]').tooltip();
  };

  /*----------------------------------------
		Animate On Scroll
	----------------------------------------*/
  const initAos = function () {
    AOS.init({
      disableMutationObserver: true,
      once: true,
      duration: 650,
    });
  };

  /*----------------------------------------
		Swiper
	----------------------------------------*/
  const swiper = function () { /* eslint-disable no-new */
    new Swiper('.single__slideshow', {
      effect: 'fade',
      autoplay: {
        delay: 4500,
        disableOnInteraction: false,
      },
    });

    new Swiper('.skills__slideshow', {
      slidesPerView: 1.2,
      spaceBetween: 30,
      breakpoints: {
        640: {
          slidesPerView: 2.5,
        },
      },
      freeMode: true,
      scrollbar: {
        el: '.swiper-scrollbar',
        draggable: true,
        hide: true,
      },
    });
  };

  /*----------------------------------------
		FancyBox
	----------------------------------------*/
  const fancybox = function () {
    $('[data-fancybox="slideshow"]').fancybox({
      animationEffect: 'zoom',
      arrows: false,
      infobar: false,
      toolbar: false,
      hash: false,
    });
  };

  /*----------------------------------------
		Lottie
	----------------------------------------*/
  const enableLottie = function () {
    $('[data-lottie]').each(function () {
      lottie.loadAnimation({
        container: this,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: this.dataset.lottie,
      });

      $(this).removeAttr('data-lottie');
    });
  };

  /*----------------------------------------
		Particles
	----------------------------------------*/
  const particles = function () {
    if (!document.querySelector('#image__particles') || window.outerWidth <= 400) { return; }

    particlesJS('image__particles', {
      particles: {
        number: {
          value: 15,
        },
        color: {
          value: '#fafafa',
        },
        shape: {
          type: 'circle',
        },
        opacity: {
          value: 0.040,
          random: true,
        },
        size: {
          value: 200,
          random: true,
        },
        move: {
          enable: true,
          speed: 1.8,
          direction: 'none',
          out_mode: 'bounce',
          random: true,
        },
        line_linked: {
          enable: false,
        },
      },
      interactivity: {
        events: {
          onhover: {
            enable: false,
          },
          onclick: {
            enable: false,
          },
          resize: true,
        },
      },
    });
  };

  const resetEaster = () => { easterWord = ''; };

  const easter = function () { /* eslint-disable max-len */
    $('body').keypress((e) => {
      easterWord += e.key;
      if (easterWord.toLocaleLowerCase() === EasterSekret.toLocaleLowerCase()) {
        resetEaster();
        $('.section__image').addClass('easter');
        $('.image__content h1').html(atob('WW91J3JlIHRoZSBiZXN0PGJyPjxicj5TaGUncyB0aGUgYmVzdA=='));
        $('.image__content p').html(atob('WW91J3ZlIGZvdW5kIG15IGVhc3RlciBlZ2csIENvbmdyYXRzITxicj5FdmVuIHRoaXMgd2VicGFnZSB0dXJucyBoYXBweSB3aGVuIGxpc3RlbiBoZXIgbmFtZS4gQnR3LCBzaGUncyBhbHNvIGFuIGFtYXppbmcgZGVzaWduZXIuPGJyPjxicj5JZiB5b3UncmUgcmVhZGluZyB0aGlzLCB0aGFuayB1IGZvciBzbyBtdWNoISA6KQ=='));
      }
    });
  };

  const updateLangNodes = function (dict) {
    $('[data-l18n]').each(function () {
      const key = this.dataset.l18n;
      this.innerText = dict[key] || this.innerText;
    });

    $('[data-l18n-pkg]').each(function () {
      const $el = $(this);
      const key = $el.data('l18n-pkg');
      const pkgDict = dict.packages[key];

      $el.find('[data-l18n-pkg-prop]').each(function () {
        const prop = $(this).data('l18n-pkg-prop');
        let val = pkgDict;

        try {
          prop.split('[')
            .forEach((p) => { val = p.includes(']') ? val[p.slice(0, p.length - 1)] : val[p]; });
        } catch (_e) {
          console.error('L18n', `Invalid identifier: ${prop}`);
        }

        this.innerText = val || this.innerText;
      });
    });
  };

  const l18n = function () {
    const lang = window.sessionStorage.getItem('com.gk.portfolio.lang') || 'en';

    $('[data-l18n-lang]').click(function (e) {
      const sel = $(this).data('l18n-lang');
      e.preventDefault();
      window.sessionStorage.setItem('com.gk.portfolio.lang', sel);
      window.location.reload();
    });

    // Load the lang
    if (lang !== 'es') {
      fetch(`/lang/${lang}.json`)
        .then((res) => res.json())
        .then(updateLangNodes);
    }
  };

  /*----------------------------------------
		Document Ready
	----------------------------------------*/
  function init() {
    counter();
    portfolioGrid();
    projectItemHover();
    lazyload();
    bsTooltips();
    backToTop();
    mobileMenu();
    goToTop();
    swiper();
    fancybox();
    particles();
    initAos();
    enableLottie();
    resetEaster();
    l18n();
    TurbolinksAnimate.init();
  }

  function earlyInit() {
    Turbolinks.start();
    loaderPage();
    easter();
  }

  $(document).on('turbolinks:load', init);
  $(document).ready(earlyInit);
})();
