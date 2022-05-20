var app = {
  // page element ids
  content_id: "#content",
  sidebar_id: "#sidebar",
  edit_id: "#edit",
  back_to_top_id: "#back_to_top",
  theme_id: "#theme",
  loading_id: "#loading",
  error_id: "#error",

  // display elements
  edit_button: false,
  save_progress: true, // 保存阅读进度

  // initialize function
  run: initialize
};

/**
 * common functions
 */

function max(array) {
  var temp = array[0];
  array.slice(1).forEach(function (ele) {
    if (ele > temp) {
      temp = ele;
    }
  });
  return temp;
}

function min(array) {
  var temp = array[0];
  array.slice(1).forEach(function (ele) {
    if (ele < temp) {
      temp = ele;
    }
  });
  return temp;
}

function lessThan(array, sth) {
  var temp = [];
  array.forEach(function (ele) {
    if (ele < sth) {
      temp.push(ele);
    }
  });
  return temp;
}

function greaterThan(array, sth) {
  var temp = [];
  array.forEach(function (ele) {
    if (ele > sth) {
      temp.push(ele);
    }
  });
  return temp;
}

function toTitleCase(s) {
    return s.replace(/\w[^\s-]*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function capitalize(s)
{
    return s[0].toUpperCase() + s.slice(1);
}

/**
* 获取当前hash
*
* @param {string} hash 要解析的hash，默认取当前页面的hash，如： nav#类目 => {nav:nav, anchor:类目}
* @description 分导航和页面锚点
* @return {Object} {nav:导航, anchor:页面锚点}
*/
var getHash = function (hash) {
  hash = hash || window.location.hash.substr(1);

  if (!hash) {
    return {
      nav: '',
      anchor: ''
    }
  }

  hash = hash.split('#');
  return {
    nav: hash[0],
    anchor: decodeURIComponent(hash[1] || '')
  }
};

function initialize() {
  // initialize buttons

  if (app.edit_button) {
    init_edit_button();
  }

  // page router
  router();
  $(window).on('hashchange', router);
}

function goTop(e) {
  if(e) e.preventDefault();
  $('html, body').animate({
    scrollTop: 0
  }, 200);
  history.pushState(null, null, '#' + location.hash.split('#')[1]);
  }

function goSection(sectionId, caseInsensive = false) {
  var target = $('#' + sectionId);
  if (target.length == 0 && caseInsensive) {
    var options = [toTitleCase(sectionId), capitalize(sectionId), sectionId.toLowerCase(), sectionId.toUpperCase()]
    options.every(option => {
      if ($('#' + option).length != 0) {
        target = $('#' + option);
        return false;
      }
      return true;
    });
  }
  $('html, body').animate({
    scrollTop: (target.offset().top)
  }, 300);
}

function init_edit_button() {
  if (app.base_url === null) {
    alert("Error! You didn't set 'base_url' when calling app.run()!");
  } else {
    $(app.edit_id).show();
    $(app.edit_id).on("click", function() {
      var hash = location.hash.replace("#", "/");
      if (/#.*$/.test(hash)) {
        hash = hash.replace(/#.*$/, '');
      }
      if (hash === "") {
        hash = "/" + app.index.replace(".md", "");
      }

      window.open(app.base_url + hash + ".md");
      // open is better than redirecting, as the previous page history
      // with redirect is a bit messed up
    });
  }
}

function replace_symbols(text) {
  // replace symbols with underscore
  return text
    .replace(/, /g, ',')
    .replace(/[&\!\/\\#,.+=$~%'":*?<>{}\ \]\[]/g, "-")
    .replace(/[()]/g, '');
}

function li_create_linkage(li_tag, header_level) {
  // add custom id and class attributes
  html_safe_tag = replace_symbols(li_tag.text());
  li_tag.attr('data-src', html_safe_tag);
  li_tag.attr("class", "link");

  // add click listener - on click scroll to relevant header section
  li_tag.click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    // scroll to relevant section
    var header = $(
      app.content_id + " h" + header_level + "." + li_tag.attr('data-src')
    );
    $('html, body').animate({
      scrollTop: header.offset().top
    }, 200);

    // highlight the relevant section
    original_color = header.css("color");
    header.animate({ color: "#25ba39", }, 800, function() {
      // revert back to orig color
      $(this).animate({color: original_color}, 1500);
    });
    history.pushState(null, null, '#' + location.hash.split('#')[1] + '#' + li_tag.attr('data-src'));
  });
}

function create_page_anchors() {
  // create page anchors by matching li's to headers
  // if there is a match, create click listeners
  // and scroll to relevant sections

  // go through header level 1 to 3
  for (var i = 2; i <= 4; i++) {
    // parse all headers
    var headers = [];
    $('#content h' + i).map(function() {
      var content = $(this).text();
      headers.push(content);
      $(this).addClass(replace_symbols(content));
      this.id = replace_symbols(content);
      $(this).hover(function () {
        $(this).html(content +
          ' <a href="#' + location.hash.split('#')[1] +
          '#' +
          replace_symbols(content) +
          '" class="section-link">§</a> <a href="#' +
          location.hash.split('#')[1] + '" onclick="goTop()">⇧</a>');
      }, function () {
        $(this).html(content);
      });
      $(this).on('click', 'a.section-link', function(event) {
        event.preventDefault();
        history.pushState(null, null, '#' + location.hash.split('#')[1] + '#' + replace_symbols(content));
        goSection(replace_symbols(content));
      });
    });

    if (location.hash === "") { // skip home page content-toc
      return
    }
    (function () {
      if ((i === 2) && headers.length !== 0) {
        var ul_tag = $('<ol></ol>')
          .insertAfter('#content h1')
          .addClass('content-toc')
          .attr('id', 'content-toc');

        for (var j = 0; j < headers.length; j++) {
          var li_tag = $('<li></li>').html('<a href="#' + location.hash.split('#')[1] + '#' + headers[j] + '">' + headers[j] + '</a>');
          ul_tag.append(li_tag);
          li_create_linkage(li_tag, i);
        }
      }
    })();

  }
}

/**
 *
 * @param {array} header_maps
 */
function generate_content_toc(header_maps) {
  var levels_map = {};
  var topHeaders = [];
  header_maps.forEach(function (header) {
    greaterThan(Object.keys(levels_map), header.headerLevel).forEach(function (level) {
      delete levels_map[level];
    });
    levels_map[header.headerLevel] = header;
    header.children = [];
    var preLevel = "h" + (parseInt(header.headerLevel.slice(1)) - 1)
    if (Object.keys(levels_map).includes(preLevel)) {
      levels_map[preLevel].children.push(header);
    } else {
      topHeaders.push(header);
    }
  });
  return topHeaders
}

/**
 *
 * @param {array} header_maps
 */
function generate_content_toc2(header_maps) {
  if (header_maps.length === 0) {
    return
  }
  var levels_map = {};
  var toc = $('<ol></ol>')
    .insertAfter('#content h1')
    .addClass('content-toc')
    .attr('id', 'content-toc');

  header_maps.forEach(function (header) {
    var li_tag = $('<li></li>').html('<a href="#' + location.hash.split('#')[1] + '#' + header.content + '">' + header.content + '</a>');
    var curLevelNumber = parseInt(header.headerLevel.slice(1));
    li_create_linkage(li_tag, curLevelNumber);
    header.li = li_tag;

    greaterThan(Object.keys(levels_map), header.headerLevel).forEach(function (level) {
      delete levels_map[level];
    });

    levels_map[header.headerLevel] = header;
    header.children = [];
    var preHeaderLevel = "h" + (curLevelNumber - 1);
    if (Object.keys(levels_map).includes(preHeaderLevel)) {
      if (levels_map[preHeaderLevel].ol === undefined) {
        levels_map[preHeaderLevel].ol = $('<ol></ol>')
          .addClass('content-toc');
        levels_map[preHeaderLevel].li.append(levels_map[preHeaderLevel].ol);
      }
      levels_map[preHeaderLevel].ol.append(li_tag);
    } else {
      toc.append(li_tag);
    }
  });
  return toc;
}

function create_page_anchors2() {
  // create page anchors by matching li's to headers
  // if there is a match, create click listeners
  // and scroll to relevant sections

  // go through header level 2 to 3
  header_maps = []
  $('#content h2,h3').map(function () {
    var content = $(this).text();
    var ele = this.localName;
    header_maps.push(
      {
        content,
        headerLevel: ele,
      });
    $(this).addClass(replace_symbols(content));
    this.id = replace_symbols(content);
    $(this).hover(function () {
      $(this).html(content +
        ' <a href="#' + location.hash.split('#')[1] +
        '#' +
        replace_symbols(content) +
        '" class="section-link">§</a> <a href="#' +
        location.hash.split('#')[1] + '" onclick="goTop()">⇧</a>');
    }, function () {
      $(this).html(content);
    });
    $(this).on('click', 'a.section-link', function(event) {
      event.preventDefault();
      history.pushState(null, null, '#' + location.hash.split('#')[1] + '#' + replace_symbols(content));
      goSection(replace_symbols(content));
    });
  });
  if (location.hash === "") { // skip home page content-toc
    return
  }
  generate_content_toc2(header_maps);
}

function native_jump() {
  $('a').map(function () {
    var href = $(this).attr("href");
    if (href === undefined || href.startsWith('http')) {
      return
    }
    if (href.split("#").length != 3) {
      return
    }
    var [_, _hash, _id] = href.split("#");
    if (_id == "" || _hash != location.hash.split('#')[1]) {
      return
    }
    $(this).on('click', function(event) {
      event.preventDefault();
      history.pushState(null, null, '#' + location.hash.split('#')[1] + '#' + replace_symbols(_id));
      goSection(replace_symbols(_id), true);
    });
  });
}

function normalize_paths() {
  // images
  $(app.content_id + " img").map(function() {
    var src = $(this).attr("src").replace("./", "");
    if ($(this).attr("src").slice(0, 4) !== "http") {
      var pathname = location.pathname.substr(0, location.pathname.length - 1);
      var url = location.hash.replace("#", "");

      // split and extract base dir
      url = url.split("/");
      var base_dir = url.slice(0, url.length - 1).join("/");
      // normalize the path (i.e. make it absolute)
      $(this).attr("src", pathname + base_dir + "/" + src);
    }
  });
}

function wrap_table() {
  $("table").wrap("<div class='table-container'></div>");
}

function wrap_pre() {
  $("pre").wrap("<div class='pre-container'></div>");
  $(".pre-container").prepend(`
    <div class='menu-button close'></div>
    <div class='menu-button minimise'></div>
    <div class='menu-button maximise'></div>
  `);
}

function wrap_img() {
  $("img").attr("data-zoomable", true);
  $("img").wrap(`<div class='img-container'></div>`);
  mediumZoom('[data-zoomable]');
}

function wrap_blockquote_signature() {
  $("blockquote em.sig").parent().addClass("text-align-right");
}

function wrap_external_link() {
  $("a").map(function () {
    var href = $(this).attr("href");
    if (href != undefined && href.startsWith("http") && !href.includes("imuxin.github.io")) {
      $(this).addClass("external");
    }
  });
}

function show_error() {
  console.log("SHOW ERORR!");
  $(app.error_id).show();
}

function show_loading() {
  $(app.loading_id).show();
  $(app.content_id).html('');  // clear content

  // infinite loop until clearInterval() is called on loading
  var loading = setInterval(function() {
      $(app.loading_id).fadeIn(1000).fadeOut(1000);
  }, 2000);

  return loading;
}

function router() {
  var path = location.hash.replace(/#([^#]*)(#.*)?/, './$1');
  var hashArr = location.hash.split('#');
  var sectionId;
  if (hashArr.length > 2 && !(/^comment-/.test(hashArr[2]))) {
    sectionId = hashArr[2];
  }

  if (app.save_progress && store.get('menu-progress') !== location.hash) {
    store.set('menu-progress', location.hash);
    store.set('page-progress', 0);
  }

  // default page if hash is empty
  if (location.pathname === "/index.html") {
    path = location.pathname.replace("index.html", app.index);
    location.replace(location.href.split("/index.html")[0])
    return
  } else if (path === "") {
    path = location.pathname + app.index;
    normalize_paths();
  } else {
    path = path + ".md";
  }

  // 取消scroll事件的监听函数
  // 防止改变下面的变量perc的值
  $(window).off('scroll');

  // otherwise get the markdown and render it
  var loading = show_loading();

  $.get(path, function(data) {
    $(app.error_id).hide();
    $(app.content_id).html(marked(data));

    if ($(app.content_id + " h1").text() === app.document_title) {
      document.title = app.document_title;
    } else {
      document.title = $(app.content_id + " h1").text() + " - " + app.document_title;
    }
    normalize_paths();
    native_jump(); // must before create_page_anchors function
    create_page_anchors2();
    wrap_table();
    wrap_pre();
    wrap_img();
    wrap_blockquote_signature();
    wrap_external_link();

    // 完成代码高亮
    $('#content code').map(function() {
      Prism.highlightElement(this);
    });

    var perc = app.save_progress ? store.get('page-progress') || 0 : 0;
    if (sectionId) {
      var target = $('#' + decodeURI(sectionId));
      if (target.length == 0) {
        $('html, body').animate({
          scrollTop: 0
        }, 300);
      } else {
        $('html, body').animate({
          scrollTop: (target.offset().top)
        }, 300);
      }

    } else {
      if (location.hash !== '' || Boolean(perc)) {
        if (Boolean(perc)) {
          $('html, body').animate({
            scrollTop: ($('body').height()-$(window).height())*perc
          }, 200);
        }
      }
    }

    // wait all resource ready (like image downloading)
    function progressIndicator() {
      var $w = $(window);
      var $prog2 = $('.progress-indicator-2');
      var wh = $w.height();
      var h = $('body').height();
      var sHeight = h - wh;
      $w.on('scroll', function() {
        window.requestAnimationFrame(function(){
          var perc = Math.max(0, Math.min(1, $w.scrollTop() / sHeight));
          updateProgress(perc);
        });
      });

      function updateProgress(perc) {
        $prog2.css({width: perc * 100 + '%'});
        app.save_progress && store.set('page-progress', perc);
      }
    }
    (function() {
      // When we begin, assume no images are loaded.
      var imagesLoaded = 0
      // Count the total number of images on the page when the page has loaded.
      var totalImages = $("img").length
      if (totalImages === 0) {
        progressIndicator();
      }
      $("img").on("load", function (event) {
        imagesLoaded++
        if (imagesLoaded == totalImages) {
          progressIndicator();
        }
      });
    })();
  }).fail(function() {
    show_error();
  }).always(function() {
    clearInterval(loading);
    $(app.loading_id).hide();
  });
}
