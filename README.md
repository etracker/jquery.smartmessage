# jquery.smartmessage.js

jquery.smartmessage.js ist ein JQuery-Plugin, um Smart Messages (Message-Overlays) abhängig von Anzeige-Triggern (z.B. Exit-Intent) anzuzeigen. Eine Message kann über verschiedene Optionen beliebig gestaltet und positioniert werden. Die Messagebox hat einen Close-Button, der über die Optionen deaktiviert werden kann.

=======

## Einbindung

Folgende Dateien müssen eingebunden werden. (Die jquery.etracker-smartmessage.js ist nur einzubinden, wenn die etracker-Targeting-API und die etracker Zählung für die Smart Message benötigt werden).


```html
...
<script src="jquery.min.js"></script>
<script src="jquery.smartmessage.min.js"></script>
</head>
```

## API-Referenz


### Optionen
Die Optionen werden per Objekt bei der Initialisierung übergeben.

* id : string (default <code>smartMessage</code>)
  * Definiert die DOM-Id der Smart Message. Ist der Container nicht im DOM vorhanden, so wird er angelegt und an den body angefügt.
* name : string (default <code>Smart Message</code>)
  * Definiert den Namen der Message und wird für das Tracking verwendet.
* debugMode : boolean (default <code>false</code>)
  * Ist der debugMode aktiviert, werden in der JS-Console einige Log-Informationen zum Ablaufen/Initalisieren der Message ausgegeben. Die Recurrence-Time der Message wird nicht beachtet und die Message wird immer ausgegeben, sobald das Targeting und/oder der Trigger zutreffen.
* recurrenceTime : integer (default <code>14</code>)
  * Zeigt an, wie viele Tage eine Message nicht nochmal angezeigt wird, wenn sie ausgelöst wurde.
* dataEventBinding : object
  * Über die Event-Bindings lassen sich Events mit HTML-Elementen in der Message verknüpfen. 
 Für das Binding wird an ein bestehendes HTML-Tag folgender Code angehängt.
 <code>data-smartmessage="test"</code> Über einen Eintrag in dem Objekt lässt sich eine Interaktion wie "Click" an eine Funktion hinter "test" anbinden.
 Default Binding
* tracking : function (default: <code>function(eventType, configuration){}</code>)
  * Wenn ein View, Click oder Close Event ausgeführt wird, wird auch die definierte Tracking-Funktion aufgerufen, die die Interaktionen der Message trackt. Wird die jquery.etracker-smartmessage.js verwendet, braucht diese Funktion nicht extra definiert werden.

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
  * <code>exitIntent</code> Die Message wird angezeigt, sobald der Besucher den sichtbaren Bereich der Seite mit der Maus verlässt.
  * <code>attentionGrabber</code> Die Message wird angezeigt, wenn der Benutzer nicht mit der Seite interagiert und in den Timeout läuft (default: 10 Sek).
  * <code>greeter</code> Nach ablaufen eines Timeout (default: 10 Sek), wird die Message angezeigt.
  * <code>none</code> Die Message wird direkt angezeigt. (Interessant für Targeting-Only)
* timeout : integer (default <code>10</code>)
  * Gibt an, wie viele Sekunden es dauert, bis die Trigger Greeter und Attention-Grabber ausgelöst werden.

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
  * Key/Value Objekt zur Verwendung im Targeting Collector. (jquery.etracker-smartmessage.js benötigt diese Option)
* collector : function (default <code>function(callback){ callback({}); }</code>)
  * Die definierte Funktion ruft eine Callback-Funktion auf und übergibt ihr die Daten, die z.B. von APIs geholt wurden und die zur Benutzung in der Condition zur Verfügung stehen sollen.
* condition : function (default <code>null</code>)
  * Wird diese Funktion definiert, ist Targeting aktiv für die Message. Die Funktionsparameter kommen aus den Daten der collector-Funktion.

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

