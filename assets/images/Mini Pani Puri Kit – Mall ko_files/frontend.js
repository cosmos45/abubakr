var dtFaqFrontend = {

	dtInit : function() {

		// Tabs

			jQuery( '.dtfq-tabs' ).tabs();


		// Accordion

			jQuery( '.dtfq-accordion' ).accordion({
				active: 0,
				header: '> div > .dtfq-accordion-title',
				heightStyle: 'content',
				icons: {
					'header': 'dtfq-accordion-switcher-icon',
					'activeHeader': 'dtfq-accordion-switcher-icon'
				}
			});


		// Toggle

			jQuery( '.dtfq-toggle-group .dtfq-toggle-title' ).on( 'click', function () {
				jQuery(this).toggleClass('active');
				jQuery(this).next('.dtfq-toggle-content').slideToggle();
			});

	},

	dtProductContent : function() {

		jQuery('.dtfq-faq-content').each(function () {

			var this_item = jQuery(this);
			var reference_id_or_class = this_item.data('reference-id-or-class');

			if(jQuery(reference_id_or_class).length > 0) {
				var item_position = this_item.data('item-position');
				if(item_position == 'before') {
					jQuery(this_item).insertBefore( jQuery(reference_id_or_class) );
				} else {
					jQuery(this_item).insertAfter( jQuery(reference_id_or_class) );
				}
			} else {
				jQuery(this_item).hide();
			}

		});

	},

	dtInitSearch : function() {

		// Search

			jQuery(document).on('keypress', '.dtfq-search-field', function(e){
				if(e.which == 13){
					dtFaqFrontend.dtFaqSearch(jQuery(this));
				}
			});

			jQuery(document).on('click', '.fas.fa-search', function(e){
				dtFaqFrontend.dtFaqSearch(jQuery(this).parents('.dtfq-search-field-holder').find('.dtfq-search-field'));
			});

	},

	dtFaqSearch : function(this_item) {

		var search_value = this_item.val();
		var output_container = this_item.parents('.dtfq-search-field-holder').next('.dtfq-search-output-container').val();
		var module_attr = this_item.parents('.dtfq-search-field-holder').next('.dtfq-search-output-container').next('.dtfq-search-module-attr').val();

		jQuery.ajax({
			type: "POST",
			url: dtfqfrontendobject.ajaxurl,
			dataType: "HTML",
			crossOrigin: true,
			data:
			{
				action      : 'dtfq_perform_search',
				search_value: search_value,
				module_attr : module_attr
			},
			beforeSend: function(){
				this_item.parents('.dtfq-search-field-holder').find('.fas.fa-search').removeClass( 'fas fa-search' ).addClass('fa fa-spinner fa-spin');
			},
			success: function (response) {
				this_item.parents('.dtfq-search-field-container').next(output_container).html(response);
				dtFaqFrontend.dtInit();
			},
			complete: function(){
				this_item.parents('.dtfq-search-field-holder').find('.fa.fa-spinner.fa-spin').removeClass( 'fa fa-spinner fa-spin' ).addClass('fas fa-search');
			}
		});

	}

};

jQuery.noConflict();
jQuery(document).ready(function() {
	dtFaqFrontend.dtInit();
	dtFaqFrontend.dtProductContent();
	dtFaqFrontend.dtInitSearch();
});