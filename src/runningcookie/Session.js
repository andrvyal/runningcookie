export default class Session {
  static generateId() {
    const ADDON = '00000000000';

    let rand = String(Math.random()) + ADDON;
    let time = ADDON + String(new Date().getTime());

    return rand.slice(2, 12) + time.slice(time.length - 10, time.length);
  }
}
