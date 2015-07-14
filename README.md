# jquery.smartmessage.js

jquery.smartmessage.js is a JQuery-Plugin in order to display Smart Messages (message overlays) dependent on display triggers like for example Exit-Intent. A message may be designed and positioned as wished via different options. The message box has a close button which can be deactivated by the options.

=======

## Integration

The following files have to be integrated. (jquery.etracker-smartmessage.js only has to be integrated if the etracker Targeting-API and the etracker counting are needed for the Smart Message)


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
  * <code>attentionGrabber</code> The message is displayed when the visitor does not interact with the page and runs into the timeout(default: 10 s).
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
 * Dient zur alternativen Definition des HTML-Contents der Message, sofern nicht schon ein <code>div</code> Objekt im DOM mit der ID aus den options angelegt wurde.
* styles : object
  * Key/Value Objekt mit CSS-Style-Eigenschaften für die Message.
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
  * Positioniert den Message-Container über eine interne Hilfsfunktion immer in der Mitte der Seite. Auch beim Scrolling/Resizing bleibt die Message mittig.
* animation : function (default <code>function(obj){$(obj).show();}</code>)
  * Mit Hilfe der aufgerufenen Funktion kann der Einblendungseffekt bestimmt werden. Die Funktion wird für das Overlay und den Message-Container aufgerufen.
* closeButton : boolean (default <code>true</code>)
  * Positioniert den einen Close-Button (Pure-CSS) oben rechts in der Message. Wird auf den Close-Button gedrückt, schließt sich die Message und das Tracking für "close" wird aufgerufen. Über die CSS Klasse .jquerySmartMessage .closeButton lässt sich der Button umgestalten/austauschen.
* overlay : boolean (default <code>true</code>)
  * Zeigt beim Anzeigen der Message ein Overlay an. (Seite wird verdunkelt)
* overlayOpacity : string (default <code>0.5</code>)
  * Deckkraft des Overlays.
* iframe : object
  * Wird die src-Option im Objekt von Iframe definiert, wird in der Message ein Iframe mit der angegebenen Seite geladen. Die Größe des Iframe lässt sich über die Optionen width und height anpassen.
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

### Methoden auf dem Objekt

* object.getConfiguration()
  * Gibt die aktuelle Konfiguration zurück.
* object.closeMessage()
  * Schließt die Message.
* object.showMessage()
  * Zeigt die Message unabhängig vom Trigger/Targeting an.
* object.trackClick()
  * Zählt über die definierte Tracking-Methode einen Klick.
* object.onShowMessage(callback)
  * Die definierte Callback-Funktion wird beim Anzeigen der Message aufgerufen.
* object.onCloseMessage(callback)
  * Die definierte Callback-Funktion wird beim Schließen der Message aufgerufen.
* object.onTargetingData(callback(data))
  * Beim erfolgreichen Laden der Targeting-Daten vom Collector wird die Callback-Funktion mit den Daten als Parameter aufgerufen.
* object.onClickMessage(callback)
  * Beim Klick auf ein Element, das mit <code>data-smartmessage="trackClick"</code> definiert wurde, wird die Callback-Funktion aufgerufen.

## Nutzung mit etracker
Sobald die jquery.etracker-smartmessage.js eingebunden ist, wird das Targeting und Tracking für etracker eingerichtet.
```html
...
<script src="jquery.min.js"></script>
<script src="jquery.smartmessage.js"></script>
<script src="jquery.etracker-smartmessage.js"></script>
</head>
```

### Konfiguration von Targeting

Um die Targeting-API-Daten von etracker in der Smart Message verwenden zu können, muss das Config-Objekt unter targeting den korrekten Secure Code (Account-Schlüssel 2) erhalten.

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

#### etracker Targeting-API mit anderen APIs verbinden

Wenn man gleichzeitig die Targeting-API und andere APIs anfragen möchte, ist dies über eine kleine Kapselung einfach zu lösen. In folgendem Beispiel wird die Message abhängig vom Wetter des Users bei mindestens zwei Besuchen angezeigt.


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

### etracker Tracking

Das Tracking der Messages erfolgt automatisch. Die Zählung fließt in die entsprechenden etracker Reports und kann dort ausgewertet werden. Über die Option <code>name</code> lässt sich der Name der Smart Message definieren und somit in den Reports einfach wiederfinden.

