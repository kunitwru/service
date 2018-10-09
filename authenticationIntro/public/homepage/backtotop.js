$(document).ready(function() {

                $.apScrollTop({
                    'onInit': function(evt) {
                    }
                });
	
                $.apScrollTop().on('apstInit', function(evt) {
                });

                $.apScrollTop().on('apstToggle', function(evt, details) {
                });

                $.apScrollTop().on('apstCssClassesUpdated', function(evt) {
                });

                $.apScrollTop().on('apstPositionUpdated', function(evt) {
                });

                $.apScrollTop().on('apstEnabled', function(evt) {
                });

                $.apScrollTop().on('apstDisabled', function(evt) {
                });

                $.apScrollTop().on('apstBeforeScrollTo', function(evt, details) {

                    
                });

                $.apScrollTop().on('apstScrolledTo', function(evt, details) {
                   
                });

                $.apScrollTop().on('apstDestroy', function(evt, details) {
                    
                });



            $('#option-enabled').on('change', function() {
                var enabled = $(this).is(':checked');
                $.apScrollTop('option', 'enabled', enabled);
            });

            $('#option-visibility-trigger').on('change', function() {
                var value = $(this).val();
                if (value == 'custom-function') {
                    $.apScrollTop('option', 'visibilityTrigger', function(currentYPos) {
                        var imagePosition = $('#image-for-custom-function').offset();
                        return (currentYPos > imagePosition.top);
                    });
                }
                else {
                    $.apScrollTop('option', 'visibilityTrigger', parseInt(value));
                }
            });

            $('#option-visibility-fade-speed').on('change', function() {
                var value = parseInt($(this).val());
                $.apScrollTop('option', 'visibilityFadeSpeed', value);
            });

            $('#option-scroll-speed').on('change', function() {
                var value = parseInt($(this).val());
                $.apScrollTop('option', 'scrollSpeed', value);
            });

            $('#option-position').on('change', function() {
                var value = $(this).val();
                $.apScrollTop('option', 'position', value);
            });
    
    });