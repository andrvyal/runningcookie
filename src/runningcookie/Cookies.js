const DEFAULT_PATH = '/';

export default class Cookies {
  static get EXPIRED() {
    return new Date(Date.now() - 1);
  }

  static get FALSE() {
    return '';
  }

  static get TRUE() {
    return '1';
  }

  static get(name) {
    let matches = document.cookie.match(new RegExp('(?:^|; )' + encodeURIComponent(name) + '=([^;]*)'));

    return matches ? decodeURIComponent(matches[1]) : undefined;
  }

  static set(name, value, {domain, expires, path = DEFAULT_PATH} = {}) {
    let cookie = name + '=' + encodeURIComponent(value);

    cookie += ';path=' + path;
    if (domain) {
      cookie += ';domain=' + domain;
    }
    if (expires) {
      cookie += ';expires=' + expires.toUTCString();
    }

    document.cookie = cookie;
  }
}
