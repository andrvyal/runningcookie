const ADDON = '00000000000';

export default class Session {
  static generateId() {
    let rand = String(Math.random()) + ADDON;
    let time = ADDON + String(Date.now());

    return rand.slice(2, 12) + time.slice(time.length - 10, time.length);
  }
}
