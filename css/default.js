/*
                  .
                 /'
                //
            .  //
            |\//7
           /' " \
          .   . .
          | (    \     '._
          |  '._  '    '. '
          /    \'-'_---. ) )
         .              :.'
         |               \
         | .    .   .     .
         ' .    |  |      |
          \^   /_-':     /
          / | |    '\  .'
         / /| |     \\  |
         \ \( )     // /
          \ | |    // /
           L! !   // / 
            [_]  L[_|  Again, sorry Teo
*/
var CONFIG = {};
var browser = Browser.name;
var scrolling = false;
var ua = navigator.userAgent;
var ipad = /iPad/i.test(ua) || /iPhone OS 3_1_2/i.test(ua) || /iPhone OS 3_2_2/i.test(ua);
window.addEvent('domready', function() {
	$$('.item').each(function(el) {
		new TogglePainting({
			wrapper: el,
			painting: el.getElement('.painting'),
			expander: el.getElement('.expand'),
			cursor: $(document.body).getElement('.cursor')
		});
	}.bind(this));	
	
	if($('header')) {
		
		new Scroller({
			header: $('header'),
			navigation: $('header').getElement('nav ul'),
			buttonTop: $('content').getElements('a.top'),
			buttons: $('header').getElements('nav a'),
			items: $('skaffa').getElements('h2.year')
		});
	}
	
	if($('painting')) {
		new Painting({
			wrapper: $(document.body).getElement('.wrapper'),
			header: $('header'),
			paintingWrapper: $('painting').getElement('.painting-wrapper'),
			infoButton: $(document.body).getElement('a.info'),
			info: $('painting').getElement('div.info'),
			carouselWrapper: $('carousel'),
			carousel: $('carousel').getElement('.carousel'),
			items: $('carousel').getElements('.slide'),
			buttons: $('carousel').getElements('a.btn'),
			thumbnails: $('carousel').getElements('.carousel li a'),
			title: $('painting').getElement('.info .title'),
			size: $(document.body).getElement('a.size')
		});
	}
	
	if($('footer')) {
		var awesomeHipsterUnicornStuffAtTheBottomOfTheWebsite = new HipsterFooter({
			button: $('footer').getElement('a.skaffa'),
			hipsterStuff: $('hipster')
		});
	}
	
	if($('nyangif')) {
		var nyanPage = new Nyan({
			wrapper: $('nyangif'),
			audio: $('nyan')
		});
	}
	
	$$('h3.title a').each(function(el) {
		el.addEvent('click', function(e) {
			e.stop();
			var scroller = new Fx.Scroll($(document.body), { duration: 500, link: 'cancel' });
			if(el.hasClass('inactive')) {
				scroller.start(0, $('painting').getElement('h3').getCoordinates().top);
				el.removeClass('inactive');
			} else {
				scroller.start(0, 0);
				el.addClass('inactive');		
			}
		}.bind(this));
	}.bind(this));
	
});



var Painting = new Class({
	options: {
		wrapper: null,
		header: null,
		paintingWrapper: null,
		infoButton: null,
		info: null,
		carouselWrapper: null,
		carousel: null,
		items: null,
		buttons: null,
		thumbnails: null,
		title: null,
		size: null
	},
	Implements: Options,
	
	initialize: function(options) {
		this.setOptions(options);
		
		this.options.fxInfo = new Fx.Scroll(this.options.wrapper, { duration: 500, link: 'cancel' });
		this.options.active = 0;
		this.options.slideActive = 0;
		this.options.loading = true;
		this.options.resized = false;
		
		// fuck you bastard IE, you are a complete retard!
		if(browser == 'ie') {
			this.options.carousel = $('carousel').getElement('.fuckyouIE');
		}
		
		window.addEvent('resize', function() {
			this.setDimensions();
		}.bind(this)).fireEvent('resize');
		
		this.loadImage();
		this.initCarousel();
		
		this.setArrows();
		
		this.setNavPos();
		
		this.spyScroll();		
		
		this.addEvents();
		
	},
	
	setArrows: function() {
		if(this.options.items.length <= 4) {
			this.options.buttons.setStyle('display', 'none');	
		}
	},
	
	setDimensions: function() {
		this.options.pageDimensions = $(document.body).getSize();
		this.options.headerDimensions = this.options.header.getSize();
		this.options.paintingWrapper.setStyles({'width': this.options.pageDimensions.x, 'height': this.options.pageDimensions.y - this.options.headerDimensions.y});
		if(!this.options.loading) {
			this.initImage();
		}
	},
	
	initImage: function() {
		this.options.paintingDimensions = this.options.painting.getSize();
		this.options.ratio = this.options.pageDimensions.x / this.options.paintingDimensions.x;
		this.options.painting.setStyles({'width': this.options.pageDimensions.x, 'height': this.options.paintingDimensions.y * this.options.ratio});
		this.options.paintingWrapper.setStyle('height', 'auto');
		this.options.fxPainting = new Fx.Tween.CSS3(this.options.painting, { duration: 300, transition: 'quint:in' });
		this.options.fxPainting.start('opacity', 1);
		(function() {
			this.resizeImage();
		}.delay(500, this));
	},
	
	loadImage: function() {
		this.options.loader = new Element('img', {'src': 'inc/images/loader.gif', 'class': 'loader'}).inject(this.options.paintingWrapper, 'inside');
		this.options.painting = Asset.image(this.options.paintingWrapper.get('rel'), {
			id: 'image',
			onLoad: function() {
				this.options.loading = false;
				this.options.loader.destroy();
				this.options.painting.inject(this.options.paintingWrapper, 'inside').setStyle('opacity', 0);
				this.initImage();
			}.bind(this)
		});
	},
	
	initCarousel: function() {
		this.options.fxSlide = new Fx.Scroll(this.options.carousel);
		this.options.items.each(function(el, i) {
			if(i > 0) {
				el.setStyle('display', 'none');	
			}
		}.bind(this));
	},
	
	addEvents: function() {
		
		this.options.thumbnails.each(function(el, i) {
			el.addEvent('click', function(e) {
				e.stop();
				this.resetYoutube(this.options.active);
				this.options.active = i;
				this.setActive();
			}.bind(this));
		}.bind(this));
		
		this.options.buttons.each(function(el, i) {
			el.addEvent('click', function(e) {
				e.stop();
				if(el.hasClass('previous')) {
					--this.options.slideActive;
					if(this.options.slideActive < 0) {
						this.options.slideActive = this.options.thumbnails.length - 4;
					}
				} else if(el.hasClass('next')) {
					++this.options.slideActive;
					if(this.options.slideActive > this.options.thumbnails.length - 4) {
						this.options.slideActive = 0;
					}
				}
				this.slide();
			}.bind(this));
		}.bind(this));
		
		this.options.size.addEvent('click', function(e) {
			e.stop();
			this.resizeImage();
		}.bind(this));
		
		this.options.painting.addEvent('click', function(e) {
			this.resizeImage();
		}.bind(this));
	},
	
	resizeImage: function() {
		if(!ipad) {
			this.options.tweenPainting = new Fx.Morph(this.options.painting, {'duration': 450, 'transition': 'quint:in:out'});
			if(!this.options.resized) {		
				this.options.size.addClass('sized');
				this.options.realWidth = this.options.pageDimensions.x;
				this.options.realHeight = this.options.paintingDimensions.y * this.options.ratio;
				
				var height = this.options.pageDimensions.y - 320;
				var ratio = this.options.paintingDimensions.y / height;
				var width = this.options.paintingDimensions.x / ratio;
				var margin = (this.options.pageDimensions.x - width) / 2;
				this.options.tweenPainting.start({
					'width': width,
					'height': height,
					'margin-top': 20,
					'margin-bottom': 20
					//'margin-left': margin
				});
				this.options.resized = true;
			} else {
				this.options.size.removeClass('sized');
				this.options.tweenPainting.start({
					'width': this.options.realWidth,
					'height': this.options.realHeight,
					'margin-top': 0,
					'margin-bottom': 0
					//'margin-left': 0
				});
				this.options.resized = false;
			}
		} else {
			$('header').getElement('.size').getParent('li').dispose();	
		}
	},
	
	setActive: function() {
		this.options.items.setStyle('display', 'none');
		this.options.items[this.options.active].setStyle('display', 'block');
		this.options.thumbnails.removeClass('active');
		this.options.thumbnails[this.options.active].addClass('active');
	},
	
	slide: function() {
		this.options.fxSlide.toElement(this.options.thumbnails[this.options.slideActive]);
	},
	
	resetYoutube: function(active) {
		if(this.options.items[active].hasClass('youtubePlayer')) {
			var html = this.options.items[active].get('html');
			this.options.items[active].set('html', '');
			this.options.items[active].set('html', html);	
		}
	},
	
	setNavPos: function() {
		return false;
		var pos;
		if(browser == 'ie') {
			this.options.buttons.each(function(el, i) {
				//pos.push(el.getPosition($$('.info')[0]));
			}.bind(this));
		}
	},
	
	spyScroll: function() {	
		$(document.window).addEvent('scroll', function(e) {
			if($(document.window).getScroll().y > 50) {
				$$('h3.title a').removeClass('inactive');	
			} else {
				$$('h3.title a').addClass('inactive');	
			}
		}.bind(this));
	}
});



var TogglePainting = new Class({
	options: {
		wrapper: null,
		painting: null,
		expander: null,
		paintingDimensions: 750,
		blockDimensions: 125,
		cursor: null
	},
	Implements: Options,
	
	initialize: function(options) {
		this.setOptions(options);
		
		this.options.rotation = ['neg-1','neg-2','neg-3', 'pos-1','pos-2','pos-3'];
		this.options.periodicalTween;
		
		this.options.cursor.setStyle('display', 'none');
		
		this.preloadImage();
	},
	
	preloadImage: function() {
		this.options.painting = Asset.image(this.options.painting.get('data-image'), {
			onLoad: function() {
				this.options.wrapper.getElement('.painting img.loader').dispose();
				this.options.painting.inject(this.options.wrapper.getElement('.painting'), 'inside');
				this.createBlocks();
				this.addEvents();
			}.bind(this)
		});
	},
	
	createBlocks: function() {
		if(!ipad) {
			var numberOfBlocks = this.options.paintingDimensions / this.options.blockDimensions,
				numberOfBlocks = numberOfBlocks * numberOfBlocks,
				leftPos = -250,
				topPos = -250,
				bgLeft = 0,
				bgTop = 0;
			for (i = 1; i <= numberOfBlocks; i++) {
				if(i != 15 && i != 16 && i != 21 && i != 22) {
					var block = new Element('div', {'class': 'block'}).inject(this.options.expander, 'inside').setStyle('opacity', 0).addClass(this.options.rotation[Number.random(0, 5)]);
					var mask = new Element('img', {'src': 'inc/images/mask.png'}).inject(block, 'inside');
					
					block.style.width = this.options.blockDimensions + 'px';
					block.style.height = this.options.blockDimensions + 'px';
					block.style.left = leftPos + Number.random(-3, 3) + 'px';
					block.style.top = topPos + Number.random(-3, 3) + 'px';
					block.style.backgroundImage = 'url('+ this.options.painting.get('src') +')';
					block.style.backgroundPosition = bgLeft + 'px ' + bgTop + 'px';
				}
				leftPos += this.options.blockDimensions;
				bgLeft -= this.options.blockDimensions;
				
				if(i % 6 == 0) {
					leftPos = -250;
					topPos += this.options.blockDimensions;
					bgLeft = 0;
					bgTop -= this.options.blockDimensions;
				}
			}
			
			this.options.blocks = this.options.expander.getElements('.block');
			this.options.numbers = this.randomNumber();
		}
	},
	
	addEvents: function() {		
		this.options.expander.addEvents({
			'mouseenter': function(e) {
				if(!scrolling && !ipad) {
					this.options.wrapper.setStyle('z-index', 2);
					this.toggleBlocks();
				}
			}.bind(this),
			'mouseout': function(e) {
				if(!ipad) {
					this.options.wrapper.setStyle('z-index', 1);
					clearInterval(this.options.periodicalTween);
					
					(function() {
						this.options.blocks.each(function(el) {
							el.setStyles({'opacity': 0, 'display': 'none'});
						}.bind(this));
					}.delay(100, this));
					
					this.options.expander.removeClass('cursored');
					this.options.cursor.setStyle('display', 'none');
				}
			}.bind(this),
			'mousemove': function(e) {
				if (browser != 'ie' && !ipad){
					this.options.expander.addClass('cursored');
					this.options.cursor.setStyles({
						'display': 'block',
						'left': e.page.x,
						'top': e.page.y
					});
				}
			}.bind(this)
		});
	},
	
	toggleBlocks: function() {
		var count = 0;
		this.options.periodicalTween = (function() {
			var fadeBlock = new Fx.Tween.CSS3(this.options.blocks[this.options.numbers[count]], { duration: 100, transition: 'quint:in' });
			this.options.blocks[this.options.numbers[count]].setStyle('display', 'block');
			fadeBlock.start('opacity', 1);
			count++;
			if(count == this.options.numbers.length) {
				clearInterval(this.options.periodicalTween);
			}
		}.bind(this)).periodical(5);
	},
	
	randomNumber: function() {
		var numbers = [];
		for (i = 0; i <= this.options.blocks.length - 1; i++) {
			numbers.push(i);
		}
		numbers.shuffle();
		return numbers;
	}
});



var Scroller = new Class({
	options: {
		header: null,
		navigation: null,
		buttons: null,
		buttonTop: null,
		items: null,
		coords: []
	},
	Implements: Options,
	
	initialize: function(options) {
		this.setOptions(options);
		
		if($('about')) {
			this.options.about = $('about');
			var size = this.options.about.getElement('div').measure(function(){
				return this.getSize();
			});
			this.options.aboutHeight = size.y;
			this.options.fxAbout = new Fx.Tween(this.options.about, { 'duration': 250, 'transition': 'quint:in:out', 'link': 'cancel' });
		}
		
		this.options.fxScroll = new Fx.Scroll($(document.body), {
			'duration': 500,
			'transition': Fx.Transitions.Quad.easeOut,
			'link': 'cancel',
			onComplete: function() {
				scrolling = false;
			}.bind(this)
		});

		if(browser === 'ie') {
			this.options.navWidth = 0;
			this.setNavigationDimensions();
		}

		this.setCoords();
		this.addEvents();
	},
	
	setNavigationDimensions: function() {
		(function() {				  
			this.options.buttons.each(function(el) {
				if(!el.hasClass('nav')) {
					this.options.navWidth += el.getSize().x + 10;
				}
			}.bind(this));
			this.options.navigation.setStyle('width', this.options.navWidth);
		}.delay(100, this));
	},
	
	setCoords: function() {
		this.options.items.each(function(el, i) {
			this.options.coords.push(el.getCoordinates().top - 50);
		}.bind(this));
		//this.options.coords.reverse();
	},
	
	addEvents: function() {
		this.options.buttons.each(function(el, i) {
			el.addEvent('click', function(e) {
				if(el.hasClass('link') || el.hasClass('nav')) {
					return;	
				}
				if(el.hasClass('btn-scrollbottom')) {
					e.stop();
					this.options.fxScroll.start(0, $('painting').getElement('h3').getCoordinates().top);
					$('painting').getElement('.info .title a').removeClass('inactive');
				} else if(el.hasClass('info')) {
					e.stop();
					this.toggleHeight();
				} else if(!el.hasClass('home') && !el.hasClass('size')) {
					e.stop();
					scrolling = true;
					this.options.fxScroll.start(0, this.options.coords[i]);	
					this.options.fxAbout.start('height', 0);
				}
			}.bind(this));
		}.bind(this));
		
		this.options.buttonTop.each(function(el, i) {
			el.addEvent('click', function(e) {
				e.stop();		
				this.options.fxScroll.start(0, 0);	
			}.bind(this));
		}.bind(this));
	},
	
	toggleHeight: function() {
		if(this.options.about.getSize().y == 0) {
			this.options.fxAbout.start('height', this.options.aboutHeight);
		} else {
			this.options.fxAbout.start('height', 0);
		}
	}
});



var HipsterFooter = new Class({
	options: {
		button: null,
		hipsterStuff: null
	},
	Implements: Options,
	
	initialize: function(options) {
		this.setOptions(options);
		this.addEvents();
	},
	
	addEvents: function() {
		this.options.button.addEvents({
			'click': function(e) {
				//e.stop();
			}.bind(this),
			'mouseenter': function(e) {
				this.fancyRainbowAndUnicorn('show');
				$('nyan').play();
			}.bind(this),
			'mouseleave': function(e) {
				this.fancyRainbowAndUnicorn('hide');
				$('nyan').pause();
				$('nyan').currentTime = 0;
			}.bind(this)
		});
	},
	
	fancyRainbowAndUnicorn: function(method) {
		this.options.tweenHipsterStuff = new Fx.Tween(this.options.hipsterStuff, { duration: 1000, transition: 'quint:in:out' });
		if(method === 'show') {
			this.options.hipsterStuff.setStyle('display', 'block');
			this.options.tweenHipsterStuff.start('width', ($(document.body).getSize().x / 2) + 200);
		} else if(method === 'hide') {
			this.options.hipsterStuff.setStyles({'display': 'none', 'width': 0});
			this.options.tweenHipsterStuff.start('width', 0);
		}
	}
});



var Nyan = new Class({
	options: {
		wrapper: null,
		audio: null
	},
	Implements: Options,
	
	initialize: function(options) {
		this.setOptions(options);
		this.tweenNyan();
	},
	
	tweenNyan: function() {
		this.options.fxNyan = new Fx.Tween(this.options.wrapper, { duration: 1000, transition: 'quint:in:out' });
		this.options.fxNyan.start('width', ($(document.body).getSize().x / 2) + 200);
		this.options.audio.play();
	}
});


// Element Implements
Element.implement(
{
	hasEvent: function(eventType,fn)
	{
		var myEvents = this.retrieve('events');
		return myEvents && myEvents[eventType] && (fn == undefined || myEvents[eventType].keys.contains(fn));
	},
	show: function()
	{
		this.setStyle('display','block');
	},
	inline: function()
	{
		this.setStyle('display','inline');
	},
	hide: function()
	{
		this.setStyle('display','none');
	}
});