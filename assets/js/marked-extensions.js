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

const ALERT_STYLES = {
  info: {
    class: 'info',
    icon: '<svg viewBox="0 0 16 16" fill="none" preserveAspectRatio="xMidYMid meet" class="icon_abDxV" style="vertical-align: middle;"><g clip-path="url(#InfoCircle_svg__clip0_1373_8677)" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 1.6a6.4 6.4 0 100 12.8A6.4 6.4 0 008 1.6zM.4 8a7.6 7.6 0 1115.2 0A7.6 7.6 0 01.4 8z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M5.4 7a.6.6 0 01.6-.6h2a.6.6 0 01.6.6v3.9H10a.6.6 0 010 1.2H6a.6.6 0 110-1.2h1.4V7.6H6a.6.6 0 01-.6-.6z"></path><path d="M8 3.6a.9.9 0 100 1.8.9.9 0 000-1.8z"></path></g><defs><clipPath id="InfoCircle_svg__clip0_1373_8677"><path fill="#fff" d="M0 0h16v16H0z"></path></clipPath></defs></svg>'
  },
  success: {
    class: 'success',
    icon: '<svg viewBox="0 0 16 16" fill="none" preserveAspectRatio="xMidYMid meet" class="icon_abDxV" style="vertical-align: middle;"><g clip-path="url(#CheckCircle_svg__clip0_1372_9763)" fill="currentColor"><path d="M11.966 5.778a.6.6 0 10-.932-.756l-4.101 5.047-1.981-2.264a.6.6 0 00-.904.79l2.294 2.622a.8.8 0 001.223-.023l4.4-5.416z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M8 .4a7.6 7.6 0 100 15.2A7.6 7.6 0 008 .4zM1.6 8a6.4 6.4 0 1112.8 0A6.4 6.4 0 011.6 8z"></path></g><defs><clipPath id="CheckCircle_svg__clip0_1372_9763"><path fill="#fff" d="M0 0h16v16H0z"></path></clipPath></defs></svg>'
  },
  warning: {
    class: 'warning',
    icon: '<svg viewBox="0 0 16 16" fill="none" preserveAspectRatio="xMidYMid meet" class="icon_abDxV" style="vertical-align: middle;"><g clip-path="url(#Warning_svg__clip0_1373_8672)" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 1.6a6.4 6.4 0 100 12.8A6.4 6.4 0 008 1.6zM.4 8a7.6 7.6 0 1115.2 0A7.6 7.6 0 01.4 8z"></path><path d="M8 12.4a.9.9 0 110-1.8.9.9 0 010 1.8zM7.25 4.24c0-.27.187-.49.417-.49h.666c.23 0 .417.22.417.49v2.247c0 .462.049 1.05-.043 1.499L8.5 9c-.103.681-.898.68-1 0l-.207-1.014c-.091-.45-.043-1.037-.043-1.5V4.24z"></path></g><defs><clipPath id="Warning_svg__clip0_1373_8672"><path fill="#fff" d="M0 0h16v16H0z"></path></clipPath></defs></svg>'
  },
  danger: {
    class: 'danger',
    icon: '<svg viewBox="0 0 16 16" fill="none" preserveAspectRatio="xMidYMid meet" class="icon_abDxV" style="vertical-align: middle;"><g clip-path="url(#Alert_svg__clip0_1373_8670)" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.47 2.387a2.895 2.895 0 015.06 0l4.679 8.272c1.107 1.958-.267 4.441-2.53 4.441H3.32c-2.263 0-3.637-2.483-2.53-4.44l4.68-8.273zm4.015.591a1.695 1.695 0 00-2.97 0l-4.68 8.272c-.674 1.194.182 2.65 1.486 2.65h9.358c1.304 0 2.16-1.456 1.485-2.65L9.485 2.978z"></path><path d="M8 12.95a.9.9 0 110-1.8.9.9 0 010 1.8zM7.25 4.79c0-.27.187-.49.417-.49h.666c.23 0 .417.22.417.49v2.247c0 .462.049 1.05-.043 1.499L8.5 9.55c-.103.681-.898.68-1 0l-.207-1.014c-.091-.45-.043-1.037-.043-1.5V4.79z"></path></g><defs><clipPath id="Alert_svg__clip0_1373_8670"><path fill="#fff" d="M0 0h16v16H0z"></path></clipPath></defs></svg>'
  },
};



/**
* @param {String} style
* @param {Object} pluginConfig
* @return {String} HTML for an alert icon
*/
function makeIcon(style, pluginConfig) {
  return `<div class="hints-icon">${pluginConfig[style].icon}</div>`;
}

/**
* @param {String} html
* @return {String} HTML wrapped in a hint container
*/
function wrapInContainer(html) {
  return '<div class="hints-container">' + html + '</div>';
}

const hint = {
  name: "hint",
  level: "block",
  start(src) { return src.match(/{% endhint %}/)?.index; },
  tokenizer(src, tokens) {
    const rule = /^{% hint style="([a-z]+)" %}\n(.*)?(\n{% endhint %})/;
    const match = rule.exec(src);
    if (match) {
      const token = {
        type: 'hint',
        raw: match[0],
        style: match[1].trim(),
        text: match[2].trim(),
        tokens: []
      };
      this.lexer.inline(token.text, token.tokens);
      return token;
    }
  },
  renderer(token) {
    return '<div class="hints alert-' + ALERT_STYLES[token.style].class + '">'
      + makeIcon(token.style, ALERT_STYLES)
      + wrapInContainer(`${this.parser.parseInline(token.tokens)} `)
      + '</div>';
  }
};

const walkTokens = (token) => {
  fix_inner_href(token);
};

marked.use({ extensions: [hint] });
marked.use({ walkTokens });
