import Cookies from './Cookies';
import Session from './Session';

const DEFAULT_NAME = 'running-cookie';
const DESKTOP = !/Android|iPhone|iPad|iPod|IEMobile|webOS|BlackBerry|Opera Mini/i.test(navigator.userAgent);
const DESKTOP_LIFETIME = 5000;
const DESKTOP_INTERVAL = DESKTOP_LIFETIME / 10;
const ERROR_ANOTHER_SESSION = 'Cookie has been created in another window';
const SESSION_ID = Session.generateId();

let running = Object.create(null);

class RunningCookie {
  get DEFAULT_NAME() {
    return DEFAULT_NAME;
  }

  is(name = DEFAULT_NAME) {
    return Boolean(Cookies.get(name));
  }

  start(name = DEFAULT_NAME) {
    let cookie = Cookies.get(name);
    if (cookie) {
      if (cookie === SESSION_ID) {
        return;
      } else {
        throw new Error(ERROR_ANOTHER_SESSION);
      }
    }

    let setCookie = () => {
      Cookies.set(name, SESSION_ID, DESKTOP ? {
        expires: new Date(Date.now() + DESKTOP_LIFETIME)
      } : {});
    };

    setCookie();
    if (DESKTOP) {
      running[name] = setInterval(setCookie, DESKTOP_INTERVAL);
    }

    window.addEventListener('unload', () => {
      this.stop(name);
    });
  }

  stop(name = DEFAULT_NAME) {
    let cookie = Cookies.get(name);
    if (cookie !== SESSION_ID) {
      throw new Error(ERROR_ANOTHER_SESSION);
    }

    if (running[name]) {
      clearInterval(running[name]);
      delete running[name];
    }

    Cookies.set(name, Cookies.FALSE, {
      expires: Cookies.EXPIRED
    });
  }
}

export default new RunningCookie();
