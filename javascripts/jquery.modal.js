/*
  Modal Plugin by Shane Riley
  Calling:
  $("a").modal();
  Options:
  {
    ajax: true, // Whether to load the modal from the href or if it already exists in page
    duration: 500, // Fade in/out speed, in milliseconds
    style: {}, // An object containing CSS properties for styling, i.e.: top, left, marginLeft
    modal_layer: "#modal_layer", // id selector for modal layer (full-page overlay)
    modal_container: "<div />", // HTML element used to construct modal
    modal: "#modal" // id selector for modal container
    modal_class: "user new" // Classes to be added to modal, separated by spaces
    ajaxCallback: function() // Called after Ajax request AND modal animation
    beforeSend: function() // Called before Ajax request
    beforeShow: function() // Called after Ajax request and before animation
    afterClose: function() // Called after closing animation
    bind_type: "live" // Method used to bind click event ("live" or "bind")
    align_to_trigger: "top" // Vertical alignment relative to trigger element. ("top", "middle", "bottom")
  };
  To load a specific part of a request into an Ajax modal, add a rel attribute with the
  css selector needed to access the parent element that you want to create a modal from.
  #modal_layer is always a div.
*/
(function($) {
  var modal = {
    ajax: true,
    duration: 500,
    center_modal: true,
    style: {},
    selectors: {
      modal_layer: "#modal_layer",
      modal: "#modal",
      context: null
    },
    ajaxCallback: null,
    beforeSend: null,
    beforeShow: null,
    afterClose: null,
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
        if (top < 0) { top = this._parent.position.top || 0; }
        $modal.css("top", top);
      }
    },
    escBind: function() {
      var m = this;
      $(document).bind("keyup." + m.name + ".escBind", function(e) {
        if (e.keyCode === 27 && m.$el.is(":visible")) {
          m.close();
          $(document).unbind(e);
        }
      });
    },
    createModalElements: function() {
      var m = this,
          id = m.selectors.modal.match(/#[a-z0-9\-_]+/i).pop(),
          klass = m.selectors.modal.match(/\.[a-z0-9\-_]+/i).pop();
      m.$el = $("<div />", {
        id: id,
        "class": klass
      });
      id = m.selectors.modal_layer.match(/#[a-z0-9\-_]+/i).pop();
      klass = m.selectors.modal_layer.match(/\.[a-z0-9\-_]+/i).pop();
      m.$overlay = $("<div />", {
        id: id,
        "class": klass
      });
    },
    position: function() {
      this.$el.css($.extend({
        left: "50%",
        marginLeft: -(this.$el.outerWidth() / 2)
      }, this.style));
    },
    animate: function() {
      var m = this;
      if (m.$el.innerHeight() > window.innerHeight) {
        m.$el.css({
          position: "absolute",
          top: m.style.top || window.pageYOffset + 20
        });
      }
      else {
        m.$el.css({
          position: "fixed",
          top: m.style.top || 20
        });
      }
      if (m.align_to_trigger && m.align_to_trigger in align_modal) {
        m.$el.css("position", "absolute");
        align_modal[opts.align_to_trigger]();
      }
      if (typeof opts.beforeShow === "function") { opts.beforeShow.apply($a); }
      if (!$modal_layer.data("original_opacity")) {
        $modal_layer.data("original_opacity", $modal_layer.css("opacity"));
      }
      $modal_layer.show().css({opacity: 0}).animate({opacity: $modal_layer.data("original_opacity")}, opts.duration);
      $modal.show().css({opacity: 0}).animate({opacity: 1}, opts.duration, function() {
        if (typeof opts.ajaxCallback === "function") {
          opts.ajaxCallback.apply($a);
        }
      });
      $(opts.modal_layer + ", " + opts.modal + " a.close").live("click", function() {
        close($modal, $modal_layer);
        return false;
      });
      $modal.trigger("modal_open");
    },
    init: function() {
      var m = this;
      var clickHandler = function(e) {
        m.show.call(this, e);
      };

      !m.$el.length && m.createModalElements();
      $.each(m, function(o) { $.isPlainObject(o) && (o._parent = m); });
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
        var plugin_instance = $.extend(true, { $trigger: $els.eq(i) }, modal, opts);
        $els.eq(i).data(modal.name, plugin_instance);
        plugin_instance.init();
      });
    }
    else {
      $.error('Method ' +  method + ' does not exist on jQuery.' + modal.name);
    }
    return $els;
  };

  $.fn.modal = function(options) {
    function open() {
      $a = $(this);
      if (typeof opts.beforeSend === "function") {
        opts.beforeSend($a);
      }
      configureModal.apply(this);
      positionModal();
      animateModal();
      return false;
    }
    function animateModal() {
    }
    function close() {
      for (var i = 0; i < arguments.length; i++) {
        arguments[i].fadeOut(opts.duration, function() {
          if (typeof opts.afterClose === "function") {
            opts.afterClose();
          }
          if (opts.modal_class) { $modal.removeClass(opts.modal_class); }
        });
      }
    }
    function create() {
      $modal = $(opts.modal);
      $modal_layer = $(opts.modal_layer);
      $a = $(this);
      if (typeof opts.beforeSend === "function") {
        opts.beforeSend();
      }
      configureModal.apply(this);
      positionModal();
      escBind();
      $modal.empty();
      var url = $a.attr("rel") ? $a.attr("href") + " " + $a.attr("rel") : $a.attr("href");
      if (/.+\.(png|jpg|jpeg|gif)(\?.+)?$/i.test(url)) {
        var img = new Image();
        img.src = url;
        img.onload = function() {
          if (img.width > $modal.width()) { img.width = $modal.width(); }
          $modal.html(img).css({
            width: img.width,
            left: "50%",
            marginLeft: -(img.width / 2)
          });
          animateModal();
        };
      } else {
        $modal.load(url, animateModal);
      }
      return false;
    }
  };
})(jQuery);
