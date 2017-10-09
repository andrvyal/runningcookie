const DEFAULT_PATH = '/';

class Cookies {
  get EXPIRED() {
    return new Date(Date.now() - 1);
  }

  get FALSE() {
    return '';
  }

  get TRUE() {
    return '1';
  }

  get(name) {
    let matches = document.cookie.match(new RegExp('(?:^|; )' + encodeURIComponent(name) + '=([^;]*)'));

    return matches ? decodeURIComponent(matches[1]) : undefined;
  }

  set(name, value, {domain, expires, path = DEFAULT_PATH} = {}) {
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

export default new Cookies();
