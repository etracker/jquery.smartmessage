(function($){
	$.extend({
    	smartMessage: function(options) {
    		/*
    		** jquery smart messaging core
    		*/
			var defaultOptions = {
				'id' : 'smartMessage',
				'name' : 'Smart Message',
				'debugMode' : false,
				'recurrenceTime' : '14', // days
				'trigger' : {
					'type' : 'exitIntent',
					'options' : {}
				},
				'targeting' : {
					'config' : {},
					'collector' : function(callback){callback({});},
					'condition' : null
				},
				'tracking' : function(type, configuration) {},
				'message' : {
					'content' : '',
					'styles' : {
						'z-index' : '90001',
						'display' : 'none',
						'width'	  : '500px',
						'background-color' : '#fff',
						'padding' 		   : '10px',
						'border' 		   : '2px solid #ff710d',
						'border-radius' : '8px',
						'position' 		: 'absolute'
					},
					'autoPosition' : true,
					'animation' : function(obj) {
						$(obj).show();
					},
					'closeButton' : true,
					'overlay' : true,
					'overlayOpacity' : '0.5',
					'iframe' : {
							'src' : null,
							'width' : '500px',
							'height' : '400px'
					}		
				},
				'dataEventBinding' : {
					'click' : {
						'closeMessage' : function() {
							closeMessage();
						},
						'trackClick' : function() {
							trackClick();
						}
					}
				}
			};
			var opts = {}, 
			object = null, 
			collectorData = {}, 
			ret = {}, 
			templates = {
				'overlay' : '<div class="jquerySmartMessage overlay" style="top:0px;left:0px;position: fixed;width:100%;height:100%;background-color: #000;z-index:40001;display: none;">&nbsp;</div>',
				'closeButton' : '<a class="closeButton" data-smartMessage="closeMessage"></a>',
				'closeButtonCSS' : '.jquerySmartMessage .closeButton{background:#161616;border:2.73px solid #fff;-moz-user-select:none;box-shadow:0 0 6px #000,1.64px 1.64px 1.64px rgba(0,0,0,.3),-1.64px 1.64px 1.64px rgba(0,0,0,.3),1.64px -1.64px 1.64px rgba(0,0,0,.3),-1.64px -1.64px 1.64px rgba(0,0,0,.3);border-radius:24px;color:#fff;cursor:pointer;display:block;overflow:hidden;padding:24px 0 0;position:absolute;width:25px;height:0;top:-13px;right:-15px}.jquerySmartMessage .closeButton:before{content:"\\D7";display:block;font-family:"Helvetica Neue",Consolas,Verdana,Tahoma,Calibri,Helvetica,Menlo,"Droid Sans",sans-serif;font-size:24px;left:0;line-height:24px;position:absolute;text-align:center;top:-1.4px;width:27px}'
			};

			var init = function() {
				mergeConfig();	
				object = $('#'+opts.id);
				if(!object.get(0)) {
					object = $('<div id="'+opts.id+'" class="jquerySmartMessage" style="display: none;">'+opts.message.content+'</div>').prependTo(document.body);
				}

				if(recurrenceTimeBlock()) {
					return;
				}

				prepareMessage();
				prepareEventBinding();

				if(opts.targeting.collector && $.isFunction(opts.targeting.condition)) {
					log('get targeting data over collector and check condition');
					opts.targeting.collector(function(collectedData) {
						log('collector data is loaded');
						log(collectedData);
						collectorData = collectedData;
						object.trigger('dataCollected');
						if(opts.targeting.condition(collectedData))
						{
							log('targeting condition is true');
							trigger(opts.trigger.type, opts.trigger.options || {}, function(){
								showMessage();
							});	
						} else {
							log('targeting condition is false');
						}
					});
				} else {
					trigger(opts.trigger.type, opts.trigger.options || {}, function(){
						showMessage();
					});	
				}
			}

			var recurrenceTimeBlock = function() {
				if(cookie('_jquerySM_'+opts.id) && opts.recurrenceTime != -1) {
					if(opts.debugMode) {
						log('DebugMode: ignore recurrenceTime and cookie "_jquerySM_'+opts.id+'"');
					} else {
						return true;
					}
				}	
				return false;			
			}

			var trigger = function(triggerName, triggerOptions, callback) {
				var exitIntent = function(options) {
			        var position_y = -1;
			        var maxTime = 1 * 1000;
			        var time = 0;
			        var isVisible = false;

			        var timeCheck = function () {
			            time += (position_y > 10 || position_y < 0) ? 250 : 0;
			            if (time >= maxTime && position_y >= 0) {
			                $(document).off('mousemove');
			                $(document).on('mouseleave', function(e) {
								e.stopPropagation();
					            if (e.clientY < 0 && !isVisible) {
					                isVisible = true;
					                callback();
					                $(document).off('mouseleave');
					            }  	
			                });
			            } else {
			                setTimeout(timeCheck, 250);
			            }
			        };
			        timeCheck();

			        $(document).on('mouseenter', function() {
			        	time *= (position_y < 0) ? 0 : 1;
			            $(document).off('mouseenter');
			        });
			        $(document).on('mousemove', function(e) {
			            if (position_y < 0 && e.clientY < 10) {
			                time = 0;
			            }
			            position_y = e.clientY;			        	
			        });					
				}

				var greeter = function(options) {
					setTimeout(function () {
						log('"'+triggerName+'" is triggered');
                    	callback();
                    }, (options.timeout ? options.timeout : 10) * 1000);
				}

				var attentionGrabber = function(options) {
        			var time;
			        var resetTimer = function () {
			            clearTimeout(time);
			            time = setTimeout(function () {
			            	log('"'+triggerName+'" is triggered');
			                callback();
			                $(document).off('mousemove click keypress');
			            }, (options.timeout ? options.timeout : 10) * 1000);
			        };

        			$(document).on('mousemove click keypress', resetTimer);
				}

				log('start trigger "'+triggerName+'"');
				if(triggerName == 'exitIntent') {
					exitIntent(triggerOptions);
				} else if(triggerName == 'greeter') {
					greeter(triggerOptions);
				} else if(triggerName == 'attentionGrabber') {
					attentionGrabber(triggerOptions);
				} else {
					callback();
				}
			}

			var tracking = function(actionType) {
				if(opts.tracking) {
					opts.tracking(actionType, opts);
				}
			}

			var prepareMessage = function() {
				$(object).css(opts.message.styles);

				if(opts.message.iframe.src) {
					$(object).html('<iframe src="'+opts.message.iframe.src+'" scrolling="no" frameborder="0"></iframe>');
					$('iframe', $(object)).css({width: opts.message.iframe.width, height: opts.message.iframe.height});
					$(object).css({
						'width' : $('#'+opts.id+' iframe').width()+10,
						'height' : $('#'+opts.id+' iframe').height()+10
					});
				}

				if(opts.message.overlay) {
					$(templates.overlay).prependTo(document.body).css('opacity', opts.message.overlayOpacity).attr('id', opts.id+'-overlay');
				}

				if(opts.message.closeButton) {
					$('<style>'+templates.closeButtonCSS+'</style>').prependTo(document.head);
					$(templates.closeButton).appendTo(object);
				}
			}

			var prepareEventBinding = function() {
				$.each(opts.dataEventBinding, function(eventType) {
					$(object).bind(eventType, function(eventObject) {
						var targetObject = $(eventObject.target);
						if(targetObject.data('smartmessage'))  {
							if(opts.dataEventBinding[eventType][targetObject.data('smartmessage')]) {
								opts.dataEventBinding[eventType][targetObject.data('smartmessage')](opts);
							} else {
								log('unknown '+eventType+' event: '+targetObject.data('smartmessage'));
							}
						}
					});
				});
			}

			var showMessage = function() {
				log('show message');
				tracking('view');
				object.trigger('showMessage');
				if(opts.message.overlay) {
					opts.message.animation($(object).add($('#'+opts.id+'-overlay')));
				} else {
					opts.message.animation($(object));
				}

				if(opts.message.autoPosition) {
					centerElement(object);

					$(window).resize(function(){
						centerElement(object);
					});
					$(document).scroll(function(){
						centerElement(object);
					});
				}
				

				if(opts.recurrenceTime > 0)
				{
					cookie('_jquerySM_'+opts.id, true, opts.recurrenceTime);
				}
			}

			var closeMessage = function() {
				tracking('close');
				object.trigger('closeMessage');
				$(object).add($('#'+opts.id+'-overlay')).hide();
			}

			var trackClick = function() {
				tracking('click');
				object.trigger('clickMessage');
			}

			/*
			** Help Functions
			*/
			var mergeConfig = function() {
				opts = $.extend(true, defaultOptions, options);
				log('merge config');
				log(opts);
			}

			var log = function(logMessage) {
				if(opts.debugMode) {
					if(typeof logMessage === 'object' ) {
						console.log(logMessage);
						return;
					}

					var date = new Date();
					console.log(date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()+'.'+date.getMilliseconds()+' jquery smart message - '+ logMessage);
				}
			}

			var centerElement = function (obj) {
				obj.css("position","absolute");
				obj.css("top", Math.max(0, (($(window).height() - $(obj).outerHeight()) / 2) + 
				                                            $(window).scrollTop()) + "px");
				obj.css("left", Math.max(0, (($(window).width() - $(obj).outerWidth()) / 2) + 
				                                            $(window).scrollLeft()) + "px");
				return obj;
			}


			var cookie = function(name, value, days) {
				var get = function(c_name) {
				    if (document.cookie.length > 0) {
				        c_start = document.cookie.indexOf(c_name + "=");
				        if (c_start != -1) {
				            c_start = c_start + c_name.length + 1;
				            c_end = document.cookie.indexOf(";", c_start);
				            if (c_end == -1) {
				                c_end = document.cookie.length;
				            }
				            return unescape(document.cookie.substring(c_start, c_end));
				        }
				    }
				    return "";
				}

				var set = function(name, value, days) {
					var expires;
				    if (days) {
				        var date = new Date();
				        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
				        expires = "; expires=" + date.toGMTString();
				    }
				    else {
				        expires = "";
				    }
				    document.cookie = name + "=" + value + expires + "; path=/";
				}

				if(value && days)
				{
					log('set cookie "'+name+'" with value "'+value+'" for "'+days+'" days');
					return set(name, value, days);
				}

				log('get cookie value for "'+name+'"');

				return get(name);
			}

			$(window).ready(function(){
				init();
			});

			/*
			** public methods
			*/
			ret.getConfiguration = function() {
				return opts;
			}

			ret.closeMessage = function() {
				closeMessage();
			}

			ret.showMessage = function() {
				showMessage();
			}

			ret.trackClick = function() {
				trackClick();
			}

			ret.onCloseMessage = function(callback) {
				$(document).ready(function(){
					$('#'+opts.id).on('closeMessage', function() {
						callback();
					});
				});
			}

			ret.onShowMessage = function(callback) {
				$(document).ready(function(){
					$('#'+opts.id).on('showMessage', function() {
						callback();
					});
				});
			}

			ret.onTargetingData = function(callback) {
				$(document).ready(function(){
					$('#'+opts.id).on('dataCollected', function() {
						callback(collectorData);
					});
				});
			}

			ret.onClickMessage = function(callback) {
				$(document).ready(function(){
					$('#'+opts.id).on('clickMessage', function() {
						callback();
					});
				});
			}

		  	return ret;
		}
	});
})(jQuery);
