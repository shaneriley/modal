#
# Modal Plugin by Shane Riley
# Calling:
# $("a").modal();
# Options:
# {
#   name: "modal", // Plugin name. Used for attaching a jQuery method and namespacing event bindings.
#   ajax: true, // Whether to load the modal from the href or if it already exists in page
#   duration: 500, // Fade in/out speed, in milliseconds
#   style: {}, // An object containing CSS properties for styling, i.e.: top, left, marginLeft
#   selectors: {
#     modal_layer: "#modal_layer", // Selector for modal overlay
#     modal: "#modal", // Selector for modal element
#     context: null // Optional context to bind events to
#   },
#   ajaxCallback: function() // Called after Ajax request AND modal animation
#   beforeSend: function() // Called before Ajax request
#   beforeShow: function() // Called after Ajax request and before animation
#   afterClose: function() // Called after closing animation
#   align_to_trigger: "top" // Vertical alignment relative to trigger element. ("top", "middle", "bottom")
# };
# To load a specific part of a request into an Ajax modal, add a rel attribute with the
# css selector needed to access the parent element that you want to create a modal from.
# #modal_layer is always a div.
# Any method can be called or modified from outside the plugin by reading the modal
# data object from the trigger or modal element. You can also call it by traversing
# to the trigger element and passing a string of the method name to call, i.e.:
# $("a").modal("animate");
#
(($) ->
  modal =
    name: "modal"
    ajax: true
    duration: 500
    center_modal: true
    style: {}
    selectors:
      modal_layer: "#modal_layer"
      modal: "#modal"
      context: null
    modal_container: "<div />"
    ajaxCallback: $.noop
    beforeSend: $.noop
    beforeShow: $.noop
    afterClose: $.noop
    align_to_trigger: null
    alignModal:
      top: () -> @._parent.$el.css "top", @._parent.$trigger.offset().top
      bottom: () ->
        top = @._parent.$trigger.offset().top - @._parent.$el.innerHeight()
        top = @._parent.position.top or 0 if top < 0
        $modal.css "top", top
      middle: () ->
        top = @._parent.$trigger.offset().top - @._parent.$el.innerHeight() / 2
        top = @._parent.style.top or 0 if top < 0
        @._parent.$el.css "top", top
    escBind: () ->
      m = @
      $(document).bind "keyup.#{m.name}.escBind", (e) ->
        if e.keyCode is 27 and m.$el.is ":visible"
          m.close()
          $(document).unbind e
    createModalElements: () ->
      m = @
      id = m.selectors.modal.match /#([a-z0-9\-_]+)/i
      klass = m.selectors.modal.match /\.([a-z0-9\-_]+)/i
      popAttributes = () ->
        id = if id and id.length then id.pop() else ""
        klass = if klass and klass.length then klass.pop() else ""

      popAttributes()
      unless m.ajax
        m.$el = $ (if id then "#" + id else "") + (if klass then "." + klass else "")
      unless m.$el.length
        m.$el = $ m.modal_container,
          id: id
          "class": klass
        .appendTo document.body
      m.$el.data modal.name, m
      id = m.selectors.modal_layer.match /#([a-z0-9\-_]+)/i
      klass = m.selectors.modal_layer.match /\.([a-z0-9\-_]+)/i
      popAttributes()
      m.$overlay = $ (if id then "#" + id else "") + (if klass then "." + klass else "")
      unless m.$overlay.length
        m.$overlay = $ "<div />",
          id: id
          "class": klass
        .appendTo document.body
    position: () ->
      m = @
      m.$el.css $.extend
        left: "50%"
        marginLeft: -(m.$el.outerWidth() / 2)
      , m.style
      m.center_modal and m.verticalCenter()
    verticalCenter: () ->
      if @.$el.outerHeight() - 40 > $(window).height()
        @.center_modal = false
        return
      @.$el.show().css
        top: ($(window).height() - @.$el.outerHeight()) / 2
        display: "none"
    animate: () ->
      m = if $.isPlainObject @ then @ else $(@).data modal.name
      if m.$el.innerHeight() > window.innerHeight
        m.$el.css
          position: "absolute"
        unless m.center_modal
          m.$el.css
            top: m.style.top or window.pageYOffset + 20
      else
        m.$el.css
          position: "fixed"
        unless m.center_modal
          m.$el.css
            top: m.style.top or 20
      if m.align_to_trigger and m.align_to_trigger in m.alignModal
        m.$el.css "position", "absolute"
        m.alignModal[m.align_to_trigger]()
      m.beforeShow()
      unless m.$overlay.data "original_opacity"
        m.$overlay.data "original_opacity", m.$overlay.css "opacity"
      m.$overlay.show().css(opacity: 0)
        .animate({ opacity: m.$overlay.data("original_opacity") }, m.duration)
      m.$el.show().css({ opacity: 0 }).animate({ opacity: 1 }, m.duration, m.ajaxCallback)
      $els = m.$overlay.add(m.$el.find(".close")).off("." + modal.name)
      $els.on("click.#{modal.name}.close", m.close).data modal.name, m
    show: (e) ->
      e.preventDefault()
      m = $(@).data(modal.name)
      if m.ajax then m.loadContent() else m.open()
    open: (e) ->
      e and "preventDefault" in e and e.preventDefault()
      m = if $.isPlainObject @ then @ else $(@).data modal.name
      m.beforeSend m.$trigger
      m.createModalElements()
      m.position()
      m.animate()
    close: (e) ->
      m = if $.isPlainObject @ then @ else $(@).data modal.name
      m.$el.add(m.$overlay).fadeOut(m.duration, m.afterClose)
      e and "preventDefault" in e and e.preventDefault()
    loadContent: () ->
      m = @
      m.beforeSend()
      m.createModalElements()
      m.$el.empty()
      url = if m.$trigger.attr "rel" then "#{m.$trigger.attr "href"} #{m.$trigger.attr "rel"}"  else m.$trigger.attr "href"
      if /.+\.(png|jpg|jpeg|gif)(\?.+)?$/i.test url
        img = new Image()
        img.src = url
        img.onload = () ->
          if img.width > m.$el.width() then img.width = m.$el.width()
          m.$el.html(img).css
            width: img.width
            left: "50%"
            marginLeft: -(img.width / 2)
          m.position()
          m.animate()
      else
        m.$el.load url, () ->
          m.position()
          m.animate()
    init: () ->
      m = @
      clickHandler = (e) ->
        m.show.call @, e

      m.createModalElements()
      !m.$el.length and m.createModalElements()
      $.each m, (o) -> $.isPlainObject(m[o]) and (m[o]._parent = m)
      if m.selectors.context
        $(m.selectors.context).on "click.#{m.name}.show", m.$trigger, m.data, clickHandler
      else
        m.$trigger.on "click.#{m.name}.show", null, m.data, clickHandler
      m.escBind()

  $.fn[modal.name] = (opts) ->
    $els = @
    method = if $.isPlainObject opts or !opts then "" else opts
    if method && modal[method]
      modal[method].apply $els, Array.prototype.slice.call arguments, 1
    else if !method
      $els.each (i) ->
        plugin_instance = $.extend true,
          $trigger: $els.eq(i)
          $el: $()
        , modal, opts
        $els.eq(i).data modal.name, plugin_instance
        plugin_instance.init()
    else
      $.error "Method #{method} does not exist on jQuery.#{modal.name}"
    $els
)(jQuery)
