import { business } from '../data/site';

/** Turns the phone number inside a plain sentence into a tap-to-call link. Only for our own trusted text. */
export const withPhoneLinks = (text: string) =>
  text.replaceAll(business.phone, `<a href="${business.phoneHref}">${business.phone}</a>`);
