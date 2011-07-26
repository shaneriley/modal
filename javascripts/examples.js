$(function() {
  $("a.modal_in_page").modal({
    ajax: false,
    modal: "#modal_in_page"
  });
  $("a.modal").modal({
    modal_class: "modal",
    modal_container: "<article />",
    align_to_trigger: "middle",
    position: {
      top: 40
    }
  });
});
