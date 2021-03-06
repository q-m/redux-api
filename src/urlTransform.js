"use strict";
import omit from "./utils/omit";
import qs from "qs";
import { parse } from "url";

const rxClean = /(\(:[^\)]+\)|:[^\/]+)/g;

/**
 * Url modification
 * @param  {String} url     url template
 * @param  {Object} params  params for url template
 * @param  {Object} options transformation options, accepts +delimiter+, +arrayFormat+,
 *                          +qsStringifyOptions+ and +qsParseOptions+
 * @return {String}         result url
 */
export default function urlTransform(url, params, options) {
  if (!url) { return ""; }
  params || (params = {});
  options || (options = {});
  const qsCommonOptions = { arrayFormat: options.arrayFormat, delimiter: options.delimiter };
  const qsParseOptions = { ...qsCommonOptions, ...options.qsParseOptions };
  const qsStringifyOptions = { ...qsCommonOptions, ...options.qsStringifyOptions };
  const usedKeys = {};

  const urlWithParams = Object.keys(params).reduce((url, key)=> {
    const value = params[key];
    const rx = new RegExp(`(\\(:${key}\\)|:${key})`, "g");
    return url.replace(rx, ()=> {
      usedKeys[key] = value;
      return value;
    });
  }, url);


  if (!urlWithParams) { return urlWithParams; }
  const { protocol, host, path } = parse(urlWithParams);
  const cleanURL = (host) ?
    `${protocol}//${host}${path.replace(rxClean, "")}` :
    path.replace(rxClean, "");
  const usedKeysArray = Object.keys(usedKeys);
  if (usedKeysArray.length !== Object.keys(params).length) {
    const urlObject = cleanURL.split("?");
    const mergeParams = {
      ...(urlObject[1] && qs.parse(urlObject[1], qsParseOptions)),
      ...omit(params, usedKeysArray)
    };
    return `${urlObject[0]}?${qs.stringify(mergeParams, qsStringifyOptions)}`;
  }
  return cleanURL;
}
