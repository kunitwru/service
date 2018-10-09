
  'use strict';
    
 	      jQuery(document).ready(function($) {
            
            $(".logo_validation").owlCarousel({
                items: 6,
                animateOut: 'fadeOut',
                loop: true,
                margin: 30,
                nav:false,
                dots:false,
                autoplay: true,
                responsive : {
                    1200 : {
                         items: 6,
                    },
                   768 : {
                         items: 4,
                    },
                    480 : {
                        items: 3,
                    },
                    0 : {
                        items: 1,
                    }
                },

            });


            $(".textimonial-carousel").owlCarousel({
                items: 1,
                loop: true,
                nav: true,
                navText:['<i class="fas fa-long-arrow-alt-left"></i>','<i class="fas fa-long-arrow-alt-right"></i>'],
                dots:false,
                margin: 0,
                autoplay: true,
                responsive : {
                    1200 : {
                        items: 1,
                    },
                    768 : {
                        items: 1,
                    },
                    480 : {
                        items: 1,
                    },
                    0 : {
                        items: 1,
                    }
                },
            });



            $(".video-play").magnificPopup({
                  type: 'video'
                });


            $("#menu").slicknav({
                prependTo: ".mobile-menu-wrap"
            });

            $(".mobile-menu-show").on('click', function(){
                $(".mobile-menu .menu").toggleClass('active'); 
            });

            
            $('html').smoothScroll(500);
             $("#header").sticky({ topSpacing: 0 });
    
  });


              
