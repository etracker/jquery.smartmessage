# jquery.smartmessage.js

jquery.smartmessage.js is a JQuery-Plugin in order to display Smart Messages (message overlays) dependent on display triggers like for example Exit-Intent. A message may be designed and positioned as wished via different options. The message box has a close button which can be deactivated by the options.

=======

## Integration

The following files have to be integrated. (jquery.etracker-smartmessage.js only has to be integrated if the etracker Targeting API and the etracker counting are needed for the Smart Message)


```html
...
<script src="jquery.min.js"></script>
<script src="jquery.smartmessage.min.js"></script>
</head>
```

## API reference


### Options
The options are transferred during initialisation via object.

* id : string (default <code>smartMessage</code>)
  * Defines the DOM Id of the Smart Message. If the container does not exist in the DOM, it will be created and added to the body.
* name : string (default <code>Smart Message</code>)
  * Defines the message name and is used for the tracking.
* debugMode : boolean (default <code>false</code>)
  * If the debugMode is activated, the output of the JS console contains some log information regarding the processing/initialisation of the message. The recurrence time of the message is ignored and the message will always be delivered as soon as the targeting and/or the trigger apply.
* recurrenceTime : integer (default <code>14</code>)
  * Indicates how many days a message will not be displayed for a second time once it has been triggered.
* dataEventBinding : object
  * The event binding allows to link events to HTML elements in the message. 
 The following code is added to an existing HTML tag for the binding.
 <code>data-smartmessage="test"</code> Via an entry in the object an interaction like "click" can be attached to a function behind "test".
 Default Binding
* tracking : function (default: <code>function(eventType, configuration){}</code>)
  * When a View, Click or Close event is executed the defined tracking function that tracks the message interactions is also called. If the jquery.etracker-smartmessage.js is used it is not necessary to define this function.

```js
var options = {
    'id': 'example', // DOM ID
    'name' : "test message",
    'debugMode' : true,
    'recurrenceTime' : 5,
    'tracking' : function(event, config) {
      // google event tracking
      _gaq.push(['_trackEvent', 'Smart Messaging', config.name, eventName]);
    },
    'dataEventBinding' : {
      'click' : {
        'test' : function() {
          alert('test click');
        }
      }
    },
    'message' : {
      'content' : '<a href="#" data-smartmessage="test">Test Klick</a>'
    }
}
var smartMessage = $.smartMessage(options);
```

#### Trigger

* type : string (default <code>exitIntent</code>)
  * <code>exitIntent</code> The message is displayed as soon as the visitor leaves the visible page area with the mouse.
  * <code>attentionGrabber</code> The message is displayed when the visitor does not interact with the page and runs into the timeout (default: 10 s).
  * <code>greeter</code> The message is displayed after expiration of a timeout (default: 10 s).
  * <code>none</code> The message is displayed directly. (Interesting for Targeting-Only)
* timeout : integer (default <code>10</code>)
  * Indicates how many seconds it lasts until Greeter and Attention Grabber are triggered.

```js
var testMessage = $.smartMessage({
  'message' : {
    'content' : 'Welcome to my page.'
  },
  'trigger' : {
    'type' : 'greeter',
    'options' : {
      'timeout' : 10,
    }
  }
});
```

#### Targeting

* config : object (default <code>{}</code>)
  * Key/Value object to be used in the Targeting Collector. (jquery.etracker-smartmessage.js needs this option)
* collector : function (default <code>function(callback){ callback({}); }</code>)
  * The defined function calls a callback function and transfers the data (got from APIs for example) that shall be available to be used in the condition.
* condition : function (default <code>null</code>)
  * When this function is defined targeting for the message is active. The function parameters come from the data of the collector function.

```js
var testMessage = $.smartMessage({
  'message' : {
    'content' : 'It is not raining at your place.'
  },
  'targeting' : {
    'condition' : function(targetingData) {
        return targetingData.weather != 'Rain';
    },
    'collector' : function(callback) {
      $.getJSON("http://www.telize.com/geoip", function(ipdata) {
        $.getJSON("http://api.openweathermap.org/data/2.5/weather?q="+ipdata.city+','+ipdata.country_code, 
        function(weatherData) {
          callback({'weather' : weatherData.weather[0].main});
        });
      });
    }
  }
});
```
#### Message

* content : string (default <code>''</code>)
 * Serves to define the HTML content alternatively unless a <code>div</code> object has already been created in the DOM with the ID from the options. 
* styles : object
  * Key/Value object with css style properties for the message.
  Default:
  ```css
  'z-index'           : '90001',
  'display'           : 'none',
  'width'             : '500px',
  'background-color'  : '#fff',
  'padding'         : '10px',
  'border'        : '2px solid #ff710d',
  'border-radius'     : '8px',
  'position'        : 'absolute'
  ```
* autoPosition : boolean (default <code>true</code>)
  * Positions the message container via an internal subsidiary function always in the middle of the page. Even during scrolling/resizing the message remains in the centre.
* animation : function (default <code>function(obj){$(obj).show();}</code>)
  * With the help of the called function you can determine how the message will slide in. The function is called for the overlay and the message container.
* closeButton : boolean (default <code>true</code>)
  * Positions a Close button (pure css) in the upper right corner of the message. When the Close button is clicked the message is closed and the tracking for "close" is called. Via the css class .jquerySmartMessage .closeButton the button can be edited/exchanged.
* overlay : boolean (default <code>true</code>)
  * Shows an overlay when the message is displayed. (Page is blacked out)
* overlayOpacity : string (default <code>0.5</code>)
  * Opacity of the overlays.
* iframe : object
  * If the src option is defined within the object of iframe an iframe with the indicated page is loaded in the message. The iframe size can be edited via the options width and height.
  ```js
  'iframe' : {
    'src' : 'http://github.com',
    'width' : '500px',
    'height' : '400px'
  }  
  ```

```js
var testMessage = $.smartMessage({
  'debugMode' : true,
  'message' : {
    'content' : 'Sliding in Yeahhhh.',
    'overlay' : false,
    'autoPosition' : false,
    'styles' : {
      'top' : '10px',
      'left' : '0px',
      'display' : 'block',
      'border-radius' : '0px 5px 5px 0px',
      'border-left' : 'none',
      'margin-left' : '-550px'
    },
    'closeButton' : false,
    'animation': function(obj) {
      $(obj).animate({"margin-left": '+=550'}, 1000);
    }
  }
});
```

### Methods on the object

* object.getConfiguration()
  * Returns the current configuration.
* object.closeMessage()
  * Closes the message.
* object.showMessage()
  * Shows the message regardless of the trigger/targeting.
* object.trackClick()
  * Counts a click via the defined tracking method.
* object.onShowMessage(callback)
  * The defined callback function is called when the message is shown.
* object.onCloseMessage(callback)
  * The defined callback function is called when the message is closed.
* object.onTargetingData(callback(data))
  * When the targeting data are successfully loaded from the collector the callback function is called with the data as parameters.
* object.onClickMessage(callback)
  * The callback function is called when clicking on an element that is defined with <code>data-smartmessage="trackClick"</code>.

## Use with etracker
As soon as jquery.etracker-smartmessage.js is integrated the targeting and tracking for etracker is set up.
```html
...
<script src="jquery.min.js"></script>
<script src="jquery.smartmessage.js"></script>
<script src="jquery.etracker-smartmessage.js"></script>
</head>
```

### Configure the targeting

In order to be able to use the targeting API data from etracker in the Smart Message the config object under targeting needs the correct secure code (account key 2).

```js
// example
...
'targeting' : {
    'config' : {
        'secureCode' : 'FvZgay2SaHf8iVpHdFEyFCUB3NDirFUJnpHCGPWKI0='
    },
    'condition' : function(targetingData) {
        return targetingData.visits > 3;
    }
}
...
```

#### Combine the etracker Targeting API with other APIs

If you want to request data from the Targeting API and other APIs at the same time this can easily be done by a small encapsulation. In the following example the message is shown with at least two visits depending on the weather on the location of the user.


```js
// example
...
'targeting' : {
    'config' : {
        'secureCode' : 'FvZgay2SaHf8iVpHdFEyFCUB3NDirFUJnpHCGPWKI0='
    },
    'condition' : function(targetingData) {
        return targetingData.visits >= 2 && targetingData.weather.main != 'Rain';
    },
    'collector' : function(callback) {
    smartMessage.etrackerCollector(function(data){
      $.getJSON("http://www.telize.com/geoip", function(ipdata) {
        $.getJSON("http://api.openweathermap.org/data/2.5/weather?q="+ipdata.city+','+ipdata.country_code, 
        function(weatherData) {
          callback($.extend(data, {'locationCity' : ipdata.city, 'weather' : weatherData.weather[0]}));
        });
      });
    });        
    }
}
...
```

### etracker tracking

Tracking of the messages is done automatically. The counting flows into the corresponding etracker reports where it can be evaluated. The option <code>name</code> allows to define the name of the Smart Message so that it can be easily found in the reports.

