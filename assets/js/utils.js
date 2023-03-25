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

/**
 * 字符串格式化成标题，每个单词的首字母大写
 * @param {string} s
 * @returns
 */
function toTitleCase(s) {
  console.log(s);
  return s.replace(/\w[^\s-]*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

/**
 * 首字母大写
 */
function capitalize(s) {
  return s[0].toUpperCase() + s.slice(1);
}


function uuidv4() {
  return crypto.randomUUID();
  // 以下是旧的实现
  //
  // return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
  //   (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  // );
}

function utf8_to_b64(str) {
  return window.btoa(unescape(encodeURIComponent(str)));
}

function b64_to_utf8(str) {
  return decodeURIComponent(escape(window.atob(str)));
}