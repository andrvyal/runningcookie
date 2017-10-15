import Cookies from './Cookies';
import EventObject from 'tinyutils/src/EventObject';
import Session from './Session';

const CHECK_DELAY_DEFAULT = 500;
const DESKTOP = !/Android|iPhone|iPad|iPod|IEMobile|webOS|BlackBerry|Opera Mini/i.test(navigator.userAgent);
const DESKTOP_LIFETIME = 2000;
const DESKTOP_UPDATE_DELAY = DESKTOP_LIFETIME / 10;
const ERRORS = Object.freeze({
  ALREADY_INTERRUPTED: 'This session has already been interrupted',
  ALREADY_STOPPED: 'This session has already been stopped',
  COOKIE_NOT_AVAILABLE: 'This cookie is not available'
});
const PRIVATE = new WeakMap();

export default class RunningCookie {
  static get ERRORS() {
    return ERRORS;
  }

  static isFree(name) {
    return !Cookies.get(name);
  }

  constructor(name) {
    let cookie = Cookies.get(name);
    if (cookie) {
      throw new Error(ERRORS.COOKIE_NOT_AVAILABLE);
    }

    let checkInterval;
    let eventObject = new EventObject();
    let sessionId = Session.generateId();
    let status = {
      interrupted: false,
      stopped: false
    };
    let updateInterval;

    let checkStatus = () => {
      if (status.stopped) {
        return;
      }

      let cookie = Cookies.get(name);
      if (cookie !== sessionId) {
        status.interrupted = true;
        clearIntervals();

        setTimeout(() => {
          eventObject.trigger('interrupt');
        });
      }
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

      if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
      }

      status.stopped = true;
    };

    let setCookie = () => {
      Cookies.set(name, sessionId, DESKTOP ? {
        expires: new Date(Date.now() + DESKTOP_LIFETIME)
      } : {});
    };

    let stop = () => {
      clearIntervals();
      clearCookie();
    };

    PRIVATE.set(this, {
      checkStatus,
      eventObject,
      name,
      sessionId,
      status,
      stop
    });

    setCookie();
    checkInterval = setInterval(checkStatus, CHECK_DELAY_DEFAULT);

    if (DESKTOP) {
      updateInterval = setInterval(() => {
        checkStatus();

        if (!status.stopped) {
          setCookie();
        }
      }, DESKTOP_UPDATE_DELAY);
    }

    window.addEventListener('unload', () => {
      checkStatus();

      if (!status.stopped) {
        stop();
      }
    });
  }

  get interrupted() {
    let {checkStatus, status} = PRIVATE.get(this);

    checkStatus();

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
    let {checkStatus, status, stop} = PRIVATE.get(this);

    checkStatus();

    if (status.stopped) {
      throw new Error(status.interrupted ? ERRORS.ALREADY_INTERRUPTED : ERRORS.ALREADY_STOPPED);
    } else {
      stop();
    }
  }

  get stopped() {
    let {checkStatus, status} = PRIVATE.get(this);

    checkStatus();

    return status.stopped;
  }
}
