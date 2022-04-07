var CONFIG = {
  // your website's title
  document_title: "Muxin's Cottage",

  // index page
  index: "README.md",

  // sidebar file
  sidebar_file: "sidebar.md",

  // where the docs are actually stored on github - so you can edit
  base_url: "https://github.com/imuxin/cottage/edit/main",
};

// **************************
// DON'T EDIT FOLLOWING CODES
// **************************

addConfig(app, CONFIG);

function addConfig(obj, conf) {
  Object.keys(conf).forEach(function (key) {
    obj[key] = conf[key];
  });
}

app.run();