import Cookies from './Cookies';
import EventObject from 'tinyutils/src/EventObject';
import Session from './Session';

const CHECK_INTERVAL = 100;
const DESKTOP = !/Android|iPhone|iPad|iPod|IEMobile|webOS|BlackBerry|Opera Mini/i.test(navigator.userAgent);
const DESKTOP_LIFETIME = 5000;
const DESKTOP_INTERVAL = DESKTOP_LIFETIME / 10;
const ERROR_ALREADY_STOPPED = 'This session has already been stopped';
const ERROR_ANOTHER_SESSION = 'Another session is running';
const PRIVATE = new WeakMap();

export default class RunningCookie {
  static is(name) {
    return Boolean(Cookies.get(name));
  }

  constructor(name, {overwrite = false} = {}) {
    if (!overwrite) {
      let cookie = Cookies.get(name);
      if (cookie) {
        throw new Error(ERROR_ANOTHER_SESSION);
      }
    }

    let checkInterval;
    let cookieInterval;
    let eventObject = new EventObject();
    let sessionId = Session.generateId();
    let status = {
      interrupted: false,
      stopped: false
    };

    let clearCookie = () => {
      Cookies.set(name, Cookies.FALSE, {
        expires: Cookies.EXPIRED
      });
    };

    let clearIntervals = () => {
      if (checkInterval) {
        clearInterval(checkInterval);
        checkInterval = null;
      }

      if (cookieInterval) {
        clearInterval(cookieInterval);
        cookieInterval = null;
      }

      status.stopped = true;
    };

    let setCookie = () => {
      Cookies.set(name, sessionId, DESKTOP ? {
        expires: new Date(Date.now() + DESKTOP_LIFETIME)
      } : {});
    };

    PRIVATE.set(this, {
      clearCookie,
      clearIntervals,
      eventObject,
      name,
      sessionId,
      status
    });

    setCookie();
    if (DESKTOP) {
      cookieInterval = setInterval(setCookie, DESKTOP_INTERVAL);
    }

    checkInterval = setInterval(() => {
      let cookie = Cookies.get(name);
      if (cookie !== sessionId) {
        status.interrupted = true;
        clearIntervals();

        eventObject.trigger('interrupt');
      }
    }, CHECK_INTERVAL);

    window.addEventListener('unload', () => {
      clearIntervals();

      let cookie = Cookies.get(name);
      if (cookie === sessionId) {
        clearCookie();
      }
    });
  }

  get interrupted() {
    let {status} = PRIVATE.get(this);

    return status.interrupted;
  }

  off(name, handler) {
    let {eventObject} = PRIVATE.get(this);

    eventObject.off(name, handler);
  }

  on(name, handler) {
    let {eventObject} = PRIVATE.get(this);

    eventObject.on(name, handler);
  }

  stop() {
    let {clearCookie, clearIntervals, name, sessionId, status} = PRIVATE.get(this);

    if (status.stopped) {
      throw new Error(ERROR_ALREADY_STOPPED);
    }

    clearIntervals();

    let cookie = Cookies.get(name);
    if (cookie === sessionId) {
      clearCookie();
    } else if (cookie) {
      throw new Error(ERROR_ANOTHER_SESSION);
    }
  }

  get stopped() {
    let {status} = PRIVATE.get(this);

    return status.stopped;
  }
}
