$(function() {
  $("a.modal_in_page").modal({
    ajax: false,
    selectors: {
      modal: "#modal_in_page"
    }
  });

  $("a.ajax_modal").modal({
    selectors: {
      modal: ".modal"
    },
    align_to_trigger: "middle",
    style: {
      top: 40
    }
  });
});
