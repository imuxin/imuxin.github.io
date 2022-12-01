/**
 * marked-extensions.js - markdown extensions for marked
 * Copyright (c) 2022, imuxin. (Apache Licensed)
 * https://github.com/imuxin/imuxin.github.io
 */

function fix_inner_href(token) {
  if (token.type === 'link') {
    let href = token.href;
    if (href.startsWith('/')) {
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
