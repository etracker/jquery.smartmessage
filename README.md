# jquery.smartmessage.js
jquery.smartmessage.js ist eìn Plugin zum erstellen von SmartMessages (Message-Overlays/Popups) abhängig von Triggern 
(z.B. Exit-Intent) und anderen Vorausetzungen (Targeting) auszuspielen. Die Message kann über verschiedene Optionen nach den eigenen Wünschen gestaltet werden. Die Message verfügt standardmäßig über einen CSS-Only Close Button der überschrieben werden kann. Die Targeting/Tracking Funktionalität kann über die Optionen beliebig angepasst werden.
 
Benötigt wird jQuery 1.9+ oder 2.0+. Unterstützte Browser sind IE 8-11, Firefox, Chrome, Safari und Opera.


## Einbindung

Folgende Dateien müssen eingebunden werden. (Die jquery.etracker-smartmessage.js ist nur einzubinden, wenn die Etracker-Targeting-API und die etracker Zählung für die SmartMessage benötigt wird)

```html
...
<script src="jquery.min.js"></script>
<script src="jquery.smartmessage.min.js"></script>
</head>
```

## Beispiele

Live-Beispiele lassen sich unter [http://etracker.github.io/jquery.smartmessage/](http://etracker.github.io/jquery.smartmessage/ "Live-Beispiele") ausprobieren.


## API Reference


### Options
Die Options werden per Objekt bei der Initalisierung überreicht.

* id : string (default <code>smartMessage</code>)
  * Definiert die DOM-Id der SmartMessage. Ist der Container nicht im DOM vorhanden, so wird er angelegt und an den body angefügt.
* name : string (default <code>Smart Message</code>)
  * Definiert den Namen der Message und wird für das Tracking verwendet.
* debugMode : boolean (default <code>false</code>)
  * Ist der debugMode aktiviert, werden in der JS-Console einige Log-Informationen zum Ablauf/Initalisierung der Message ausgegeben. Die Recurrence-Time der Message wird auch nicht beachtet und die Message wird immer ausgegeben, sobald das Targeting/Trigger zutreffen.
* recurrenceTime : integer (default <code>14</code>)
  * Zeit in Tagen wie lange eine Message nicht nochmal angezeigt wird, wenn sie ausgelöst wurde.
* dataEventBinding : object
  * Über die Event-Bindings lassen sich Events an HTML-Elemente in der Message setzen. 
 Für das Binding wird an ein bestehndes HTML Tag folgender Code ergänzt.
 <code>data-smartmessage="test"</code> Über einen Eintrag in dem Objekt lässt sich eine Interaktion wie "click" an eine Funktion hinter "test" binden.
 Default Binding
* tracking : function (default: <code>function(eventType, configuration){}</code>)
  * Wird ein View, Click oder Close Event ausgeführt, wird auch die definierte tracking-Funktion aufgerufen und kann die Interaktionen der Message tracken. Wird die jquery.etracker-smartmessage.js verwendet, braucht diese Funktion nicht extra definiert werden.

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

#### trigger

* type : string (default <code>exitIntent</code>)
  * <code>exitIntent</code> Verlässt der Besucher mit der Maus den sichtbaren Bereich der Seite, wird die Message angezeigt.
  * <code>attentionGrabber</code> Sobald der Benutzer keine Interaktion auf der seite ausübt und in den timeout (default: 10 Sek) läuft, wird die Message angezeigt.
  * <code>greeter</code> Nach ablaufen eines timeout (default: 10 Sek), wird die Message angezeigt.
  * <code>none</code> Die Message wird direkt angezeigt. (Interessant für Targeting-Only)
* timeout : integer (default <code>10</code>)
  * Gibt die Zeit für den Greeter und AttentionGrabber-Trigger an, bis diese ausgelöst werden.

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

#### targeting

* config : object (default <code>{}</code>)
  * Key/Value Objekt zur Verwendung im targeting collector. (jquery.etracker-smartmessage.js benötigt diese Option)
* collector : function (default <code>function(callback){ callback({}); }</code>)
  * Die definierte Funktion ruft eine Callback-Funktion auf und übergibt an diese die geholten Daten von API's oder ähnlichem die zur Benutzung in der Condition zur Verfügung stehen sollen.
* condition : function (default <code>null</code>)
  * Wird diese Funktion definiert, ist Targeting aktiv für die Message. Als Parameter bekommt die Funktion die Daten aus der collector-Funktion.

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
#### message

* content : string (default <code>''</code>)
 * Dient zur alternativen Definierung des HTML Contents der Message, sofern nicht schon ein <code>div</code> Objekt im Dom mit der ID aus den options angelegt wurde.
* styles : object
  * Key-Value Objekt mit CSS Style Eigenschaften für die Message.
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
  * Positioniert den Message-Container immer in die Mitte der Seite über eine interne Hilfsfunktion. Auch bei Scrolling/Resizing bleibt die Message mittig.
* animation : function (default <code>function(obj){$(obj).show();}</code>)
  * Mit Hilfe der aufgerufenen Funktion kann der Einblendungseffekt bestimmt werden. Die Funktion wird für das Overlay und den Message-Container aufgerufen.
* closeButton : boolean (default <code>true</code>)
  * Positioniert den einen CloseButton (Pure-CSS) an den rechten oberen Bereich der Message. Wird auf den Close-Button gedrückt, schließt sich die Message und das Tracking für "close" wird aufgerufen. Über die CSS Klasse .jquerySmartMessage .closeButton lässt sich der Button umstylen/austauschen.
* overlay : boolean (default <code>true</code>)
  * Zeigt beim Anzeigen der Message ein Overlay an. (Seite wird verdunkelt)
* overlayOpacity : string (default <code>0.5</code>)
  * Deckkraft des Overlays.
* iframe : object
  * Wird die src Option im Object von iframe definiert, wird in der Message ein Iframe geladen mit der angegeben Seite. Die Größe des iframe lässt sich über die Optionen width und height anpassen.
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
  * Gibt die aktuelle Configuration zurück.
* object.closeMessage()
  * Schließt die Message.
* object.showMessage()
  * Zeigt die Message unabhängig von Trigger/Targeting an.
* object.trackClick()
  * Zählt über die definierte tracking Methode einen Klick.
* object.onShowMessage(callback)
  * Die definierte Callback-Funktion wird beim anzeigen der Message aufgerufen.
* object.onCloseMessage(callback)
  * Die definierte Callback-Funktion wird beim schließen der Message aufgerufen.
* object.onTargetingData(callback(data))
  * Beim erfolgreichen laden der Targeting-Daten vom Collector wird die Callback-Funktion mit den Daten als Parameter aufgerufen.
* object.onClickMessage(callback)
  * Beim Klick auf ein Element was mit <code>data-smartmessage="trackClick"</code> definiert wurde, wird die Callback-Funktion aufgerufen.

## Nutzung mit etracker
Sobald die jquery.etracker-smartmessage.js eingebunden ist, wird das targeting und tracking für etracker eingerichtet.
```html
...
<script src="jquery.min.js"></script>
<script src="jquery.smartmessage.js"></script>
<script src="jquery.etracker-smartmessage.js"></script>
</head>
```

### Konfiguration von Targeting

Um die Targeting-API-Daten von etracker in der SmartMessage verwenden zu können, muss das Config-Objekt unter targeting den korrekten Secure-Code erhalten.

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

#### etracker Targeting-API mit anderen API's verbinden

Möchte man gerne die Targeting-API und gleichzeitig andere API's anfragen ist dies über eine kleine Kapselung einfach zu lösen. Bei folgendem Beispiel wird abhängig vom Wetter des Users und mindestens zwei Besuchen die Message angezeigt.


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

