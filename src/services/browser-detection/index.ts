/** msCrypto is a prefixed version of the window.crypto object
 *  and only implemented in IE 11
 * */
interface WindowIE11 extends Window {
  msCrypto?: Crypto;
}

export const BrowserDetectionService = {
  isIE11(): boolean {
    return !!(window as WindowIE11).msCrypto;
  },
};
