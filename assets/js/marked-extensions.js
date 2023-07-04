/**
 * marked-extensions.js - markdown extensions for marked
 * Copyright (c) 2022, imuxin. (Apache Licensed)
 * https://github.com/imuxin/imuxin.github.io
 */

function real_path(cur_path, relative_path) {
  const base = "https://imuxin.github.io";
  const url = new URL(cur_path, base);
  const real_url = new URL(relative_path, url);
  return real_url.pathname;
}

function fix_inner_href(token) {
  if (token.type === 'link') {
    let href = token.href;
    // example: path = 'content/cloud-native/k0s-dual-stack'
    let path = location.hash.replace(/#([^#]*)(#.*)?/, '$1');

    switch (true) {
      case href.startsWith('http'): return

      // convert relative to absolute
      default:
        // href could be "xx.md" or "../xx.md" or "/xx/yy.md"
        href = real_path(path, href)
        href = "#" + href.substring(1);
        href = href.replace(".md", "");
        token.href = href;
    }
  }
}

const walkTokens = (token) => {
  fix_inner_href(token);
};

marked.use({ walkTokens });
