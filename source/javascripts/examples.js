$(function() {
  $("a.modal_in_page").modal({
    ajax: false,
    beforeClose: function($a) {
      var $f = $a.data("modal").$el.find("form"),
          $inputs = $f.find("input").not(":submit"),
          complete = true;
      $f.find("p").remove();
      $inputs.each(function(i) {
        if (!$inputs.eq(i).val()) { complete = false; }
      });
      !complete && $("<p />", { text: "Fill in all fields" }).prependTo($f);
      return complete;
    },
    selectors: {
      modal: "#modal_in_page"
    }
  });

  $("a.ajax_modal").modal({
    modal_container: "<article />",
    ajax_opts: {
      url: "/modal.html"
    },
    selectors: {
      modal: ".modal"
    },
    align_to_trigger: "middle",
    style: {
      top: 40
    }
  });

  $("#welcome").modal({
    ajax: false,
    selectors: {
      modal: "#welcome"
    }
  }).modal("open");

  $(document).keyup(function(e) {
    if (String.fromCharCode(e.which) !== "H") { return; }
    var $m = $("#welcome");
    $m.data("modal").beforeShow = function() { alert("Added a callback after initialization"); };
    $m.is(":hidden") && $m.modal("open");
  });

  $("input").keyup(function() {
    if (!/^modal$/i.test(this.value)) { return; }
    var $m = $.modal({
      $el: $("<article />", {
        "class": "modal",
        id: "standalone"
      }),
      ajax: false
    });
    $("<p />", { text: "This modal was created with the $.modal method.\
      The same options apply." }).appendTo($m);
    $m.modal("show");
  });
});
