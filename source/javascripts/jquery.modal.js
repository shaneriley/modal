/*
  Modal Plugin by Shane Riley
  Calling:
  $("a").modal();
  Options:
  {
    name: "modal", // Plugin name. Used for attaching a jQuery method and namespacing event bindings.
    ajax: true, // Whether to load the modal from the href or if it already exists in page
    duration: 500, // Fade in/out speed, in milliseconds
    context: "section#main", // A selector representing the container the modal should be written to.
                             // Default is document.body
    style: {}, // An object containing CSS properties for styling, i.e.: top, left, marginLeft
    selectors: {
      modal_layer: "#modal_layer", // Selector for modal overlay
      modal: "#modal", // Selector for modal element
      context: null // Optional context to bind events to
    },
    ajaxCallback: function() // Called after Ajax request AND modal animation
    beforeSend: function() // Called before Ajax request
    beforeShow: function() // Called after Ajax request and before animation
    beforeClose: function() // Called before closing animation. If return is false, close does not fire
    afterClose: function() // Called after closing animation
    align_to_trigger: "top" // Vertical alignment relative to trigger element. ("top", "middle", "bottom")
  };
  To load a specific part of a request into an Ajax modal, add a rel attribute with the
  css selector needed to access the parent element that you want to create a modal from.
  #modal_layer is always a div.
  Any method can be called or modified from outside the plugin by reading the modal
  data object from the trigger or modal element. You can also call it by traversing
  to the trigger element and passing a string of the method name to call, i.e.:
  $("a").modal("animate");
*/
(function($) {
  var modal = {
    name: "modal",
    ajax: true,
    duration: 500,
    context: "",
    center_modal: true,
    close_keys: [27],
    style: {},
    selectors: {
      modal_layer: "#modal_layer",
      modal: "#modal",
      context: null
    },
    modal_container: "<div />",
    ajaxCallback: $.noop,
    beforeSend: $.noop,
    beforeShow: $.noop,
    beforeClose: $.noop,
    afterClose: $.noop,
    align_to_trigger: null,
    alignModal: {
      top: function() { this._parent.$el.css("top", this._parent.$trigger.offset().top); },
      bottom: function() {
        var top = this._parent.$trigger.offset().top - this._parent.$el.innerHeight();
        if (top < 0) { top = this._parent.position.top || 0; }
        $modal.css("top", top);
      },
      middle: function() {
        var top = this._parent.$trigger.offset().top - this._parent.$el.innerHeight() / 2;
        if (top < 0) { top = this._parent.style.top || 0; }
        this._parent.$el.css("top", top);
      }
    },
    escBind: function() {
      var m = this;
      $(document).bind("keyup." + m.name + ".escBind", function(e) {
        if ($.inArray(e.which, m.close_keys) !== -1 && m.$el.is(":visible")) {
          m.close();
          $(document).unbind(e);
        }
      });
    },
    createModalElements: function() {
      var m = this,
          id = m.selectors.modal.match(/#([a-z0-9\-_]+)/i),
          klass = m.selectors.modal.match(/\.([a-z0-9\-_]+)/i);
      var popAttributes = function() {
        id = id && id.length ? id.pop() : "";
        klass = klass && klass.length ? klass.pop() : "";
      };

      popAttributes();
      if (!m.ajax && !m.$el.length) {
        m.$el = $((id ? "#" + id : "") + (klass ? "." + klass : ""));
      }
      if (!m.$el.length) {
        m.$el = $(m.modal_container, {
          id: id,
          "class": klass
        }).appendTo(m.context || document.body);
      }
      else { m.$el.appendTo(m.context || document.body); }
      m.$el.data(modal.name, m);
      id = m.selectors.modal_layer.match(/#([a-z0-9\-_]+)/i);
      klass = m.selectors.modal_layer.match(/\.([a-z0-9\-_]+)/i);
      popAttributes();
      m.$overlay = $((id ? "#" + id : "") + (klass ? "." + klass : ""));
      if (!m.$overlay.length) {
        m.$overlay = $("<div />", {
          id: id,
          "class": klass
        }).appendTo(document.body);
      }
    },
    position: function() {
      var m = this;
      m.$el.css($.extend({
        left: "50%",
        marginLeft: -(m.$el.outerWidth() / 2)
      }, m.style));
      m.center_modal && m.verticalCenter();
    },
    verticalCenter: function() {
      if (this.$el.outerHeight() - 40 > $(window).height()) {
        this.center_modal = false;
        return;
      }
      this.$el.show().css({
        top: ($(window).height() - this.$el.outerHeight()) / 2,
        display: "none"
      });
    },
    animate: function() {
      var m = $.isPlainObject(this) ? this : $(this).data(modal.name),
          $els;
      if (m.$el.innerHeight() > window.innerHeight) {
        m.$el.css({
          position: "absolute"
        });
        if (!m.center_modal) {
          m.$el.css({
            top: m.style.top || window.pageYOffset + 20
          });
        }
      }
      else {
        m.$el.css({
          position: "fixed"
        });
        if (!m.center_modal) {
          m.$el.css({
            top: m.style.top || 20
          });
        }
      }
      if (m.align_to_trigger && m.align_to_trigger in m.alignModal) {
        m.$el.css("position", "absolute");
        m.alignModal[m.align_to_trigger]();
      }
      m.beforeShow();
      if (!m.$overlay.data("original_opacity")) {
        m.$overlay.data("original_opacity", m.$overlay.css("opacity"));
      }
      m.$overlay.show().css({opacity: 0})
        .animate({opacity: m.$overlay.data("original_opacity")}, m.duration);
      m.$el.show().css({opacity: 0}).animate({opacity: 1}, m.duration, m.ajaxCallback);
      $els = m.$overlay.add(m.$el.find(".close")).off("." + modal.name);
      $els.on("click." + modal.name + ".close", m.close).data(modal.name, m);
    },
    show: function(e) {
      e && "preventDefault" in e && e.preventDefault();
      var m = $(this).data(modal.name);
      m.ajax ? m.loadContent() : m.open();
    },
    open: function(e) {
      e && "preventDefault" in e && e.preventDefault();
      var m = $.isPlainObject(this) ? this : $(this).data(modal.name);
      m.beforeSend(m.$trigger);
      m.createModalElements();
      m.position();
      m.animate();
    },
    close: function(e) {
      var m = $.isPlainObject(this) ? this : $(this).data(modal.name);
      if (m.beforeClose(m.$trigger) !== false) {
        m.$el.add(m.$overlay).fadeOut(m.duration, m.afterClose);
      }
      e && "preventDefault" in e && e.preventDefault();
    },
    loadContent: function() {
      var m = this;
      m.beforeSend();
      m.createModalElements();
      m.$el.empty();
      var url = m.$trigger.attr("rel") ? m.$trigger.attr("href") + " " + m.$trigger.attr("rel") : m.$trigger.attr("href");
      if (/.+\.(png|jpg|jpeg|gif)(\?.+)?$/i.test(url)) {
        var img = new Image();
        img.src = url;
        img.onload = function() {
          if (img.width > m.$el.width()) { img.width = m.$el.width(); }
          m.$el.html(img).css({
            width: img.width,
            left: "50%",
            marginLeft: -(img.width / 2)
          });
          m.position();
          m.animate();
        };
      } else {
        m.$el.load(url, function() {
          m.position();
          m.animate();
        });
      }
    },
    singleton: function() {
      var m = this;
      m.createModalElements();
      return m.$el;
    },
    init: function() {
      var m = this;
      var clickHandler = function(e) {
        m.show.call(this, e);
      };

      m.createModalElements();
      !m.$el.length && m.createModalElements();
      $.each(m, function(o) { $.isPlainObject(m[o]) && (m[o]._parent = m); });
      if (m.selectors.context) {
        $(m.selectors.context).on("click." + m.name + ".show", m.$trigger, m.data, clickHandler);
      }
      else {
        m.$trigger.on("click." + m.name + ".show", null, m.data, clickHandler);
      }
      m.escBind();
    }
  };

  $.fn[modal.name] = function(opts) {
    var $els = this,
        method = $.isPlainObject(opts) || !opts ? "" : opts;
    if (method && modal[method]) {
      modal[method].apply($els, Array.prototype.slice.call(arguments, 1));
    }
    else if (!method) {
      $els.each(function(i) {
        var plugin_instance = $.extend(true, {
          $trigger: $els.eq(i),
          $el: $()
        }, modal, opts);
        $els.eq(i).data(modal.name, plugin_instance);
        plugin_instance.init();
      });
    }
    else {
      $.error('Method ' +  method + ' does not exist on jQuery.' + modal.name);
    }
    return $els;
  };

  $[modal.name] = function(opts) {
    var instance = $.extend(true, {}, modal, opts);
    return instance.singleton();
  };
})(jQuery);
