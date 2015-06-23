/*
** etracker smart messaging component
*/
(function($){
	$.extend({
		etrackerSmartMessage: function(options){
			var ret = {};
			var etrackerOptions = {
				'targeting' : {
					collector : function(dataCallback) {
						function getCoidCookie() {
					  		var value = "; " + document.cookie;
					  		var parts = value.split("; _et_coid=");
					  		if (parts.length == 2) return parts.pop().split(";").shift();
						}

						var apiHost = options.targeting.config.targetingAPIHost ? options.targeting.config.targetingAPIHost : '//ws.etracker.com';
						var url = apiHost+'/api/rest/v2/realtime/user?et='+options.targeting.config.secureCode;
						url += '&_et_coid='+getCoidCookie()+'&callback=?';

						$.getJSON(url, {}).done(function( targetingData ) {
							var formatedData = [];
							for(headerNum in targetingData['header'] || [])
							{
								formatedData[targetingData['header'][headerNum]] = targetingData['data'][headerNum];
							}

							dataCallback(formatedData);
						}).fail(function(){
							dataCallback({});
						});
					}					
				},
				tracking : function(actionType, configuration) {
					var etrackerSecureCode = $('#_etLoader').attr('data-secure-code');
					if(
						etrackerSecureCode != '' &&
						$.isFunction(window.et_cc_wrapper) &&
						(actionType == 'view' || actionType == 'click'))
					{
						var triggerNames = {
							'exitIntent' : 'STC_CC_ATTR_VALUE_TRIGGER_EXIT_INTENT',
							'greeter' : 'STC_CC_ATTR_VALUE_TRIGGER_GREETER',
							'attentionGrabber' : 'STC_CC_ATTR_VALUE_TRIGGER_ATTENTION_GRABBER'
						};
						window.cc_attributes = {
							'etcc_cmp' : [configuration.name, true],
							'etcc_cty' : ['STR_CC_PROJECT_TYPE_SMART_MESSAGING', true],
							'etcc_int' : [actionType, true],
							'etcc_trg' : [triggerNames[configuration.trigger.type] ? triggerNames[configuration.trigger.type] : 'none', true],
							'universe' : [6, true]
						};
						window.et_cc_wrapper(etrackerSecureCode);
					}
				}
			};

			ret.etrackerCollector = etrackerOptions.targeting.collector;
			ret.etrackerTracking = etrackerOptions.tracking;

			var config = $.extend(true, etrackerOptions, options);

			return $.extend(ret, $.smartMessage(config));
		}});
})(jQuery);
