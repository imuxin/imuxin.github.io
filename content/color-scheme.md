# Color Scheme

<script>
var schemes = [
  {
    "name": "Monokai",
    "colors": [
      "#ff6188",
      "#fc9867",
      "#ffd866",
      "#a9dc76",
      "#78dce8",
      "#fcfcfa",
      "#ab9df2",
    ],
    "background": "#2d2a2e",
  },
  {
    "name": "Bulma",
    "colors": [
      "#f14668",
      "#f26522",
      "#ffe08a",
      "#48c78e",
      "#485fc7",
      "#abf47c",
    ],
    "background": "#fff",
  },
]

schemes.slice().reverse().forEach((item) => {
  var display = $("<div></div>").
    css("display", "flex")

  item.colors.forEach((color) => {
    var ele = $('<div></div>').
      css("height", "50px").
      css("line-height", "50px").
      css("flex", 1).
      css("text-align", "center").
      css("background", item.background).
      css("color", color).
      text("███");
    display.append(ele);
  });

  var scheme = $("<div></div>").
    css("display", "flex")
  item.colors.forEach((color) => {
    var ele = $('<div></div>').
      css("height", "50px").
      css("line-height", "50px").
      css("flex", 1).
      css("text-align", "center").
      css("background", color).
      css("color", item.background).
      text(color);
    scheme.append(ele);
  });

  $("h1").after(display);
  $("h1").after(scheme);
  $("h1").after(`<h2>${item["name"]}</h2>`);
});
</script>
