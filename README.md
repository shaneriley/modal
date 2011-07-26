# jQuery Modal Plugin

**Disclaimer**: This plugin is not meant to provide you with all the fancy-pants stuff people have come to expect from plugins like Lightbox. It is meant to be a simple means to either open an in-page container or create a new one and load it with content via Ajax. The plugin fades the modal and modal layer in and out at the specified duration and will trigger the close event based on clicking an anchor with class of close, clicking the modal layer, or pressing escape on the keyboard.

By default, it centers the modal horizontally in the viewport based on the width of the modal container. The modal is positioned 20 pixels from the top of the screen unless you pass in a different position. For example, to change the positioning to place it 40px from the top left of the screen, you would pass an options object with a position object that would look like this:
```$("a").modal({
  position: {
    left: 40,
    top: 40,
    marginLeft: 0
  }
});
```

Note that the marginLeft value is set to 0. This is important because the plugin will set the left margin to -(modal width / 2) to properly horizontally center it.

The plugin will determine if the modal fits within the window or not and set it to fixed or absolute positioning accordingly. If the modal height exceeds the viewport, it is absolutely positioned from the top of the current viewport rather than the top of the document to ensure the start of the modal is visible when it is opened.

To have the modal anchored to the triggered element, set the align_to_trigger property to one of three strings: top, middle, or bottom.

```$("a").modal({ align_to_trigger: "middle" });```

If set to middle or bottom and the modal is positioned outside of the visible area, the modal is positioned from the top of the screen plus any top value passed in the position object.

The modal and modal layer selectors are #modal and #modal_layer by default. Pass in values for modal and modal_layer to override these.

```$("a").modal({ modal: "#price_comparison", modal_layer: "#overlay" });```

If the modal element is not present on the page, a new element is created. It is a div by default. To use a different element, pass in a string representation of the element as the modal_container property.

```$("a").modal({ modal_container: "<section />" });```

You can specify additional classes to be added to the modal container with the modal_class property. The string format follows the jQuery convention for the addClass method.

```$("a").modal({ modal_class: "price new" });```

There are a number of callback points that can be used to perform operations at different points in the modal cycle. Callbacks can be called as beforeSend, beforeShow, ajaxCallback, and afterClose.

```$("a").modal({
  ajaxCallback: function() {}, // Called after Ajax request AND modal animation
  beforeSend: function() {}, // Called before Ajax request
  beforeShow: function() {}, // Called after Ajax request and before animation
  afterClose: function() {}, // Called after closing animation
});
```

Modal contents are loaded in via Ajax by default, using the href on the anchor that triggered it. To open a modal that already exists in the DOM, set the ajax property to false.

```$("a").modal({ ajax: false });```

If the modal contents are loaded via Ajax and you want to grab only a specific container from the return of the request, add a rel attribute with a CSS format selector to use to find the container element. This works exactly like jQuery's load method of pulling a page fragment from the return of the request.

```<a href="/contact" rel="form#contact">Contact us</a>```

If you are attaching the modal trigger to an element that did not exist on the page when the page was first rendered, you will need to set the bind_type property to "bind". By default, the event binding uses the live method.

```$("a").modal({ bind_type: "bind" });```
