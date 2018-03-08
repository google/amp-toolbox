/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const {URL} = require('url');
const punycode = require('punycode');
const mime = require('mime-types');

/**
 * Translates canonical URLs into AMP Cache URLs, according to the specification available at
 * https://developers.google.com/amp/cache/overview.
 */
class AmpUrl {

  /**
   * Translates the canonicalUrl to the AMP Cache equivalent, for a given AMP Cache.
   * @param {string} updateCacheApiDomainSuffix the AMP Cache domain suffix
   * @param {string} canonicalUrl the canonical URL
   */
  cacheUrl(updateCacheApiDomainSuffix, canonicalUrl) {
    const url = new URL(canonicalUrl);
    const originalHostname = url.hostname;
    let unicodeHostname = punycode.toUnicode(originalHostname);
    unicodeHostname = unicodeHostname.replace(/-/g, '--');
    unicodeHostname = unicodeHostname.replace(/\./g, '-');

    let pathSegment = this._getResourcePath(url.pathname);
    pathSegment += url.protocol === 'https:' ? '/s/' : '/';

    url.protocol = 'https';
    url.hostname = punycode.toASCII(unicodeHostname) + '.' + updateCacheApiDomainSuffix;
    url.pathname = pathSegment + originalHostname + url.pathname;
    return url.toString();
  }

  /**
   * Returns the AMP Cache path, based on the mime type of the file that is being loaded.
   * @param {string} pathname the pathname on the canonical url.
   */
  _getResourcePath(pathname) {
    const mimetype = mime.lookup(pathname);
    if (!mimetype) {
      return '/c';
    }

    if (mimetype.indexOf('image/') === 0) {
      return '/i';
    }

    if (mimetype.indexOf('font') >= 0) {
      return '/r';
    }

    // Default to document
    return '/c';
  }
}

/** @module AmpUrl */
module.exports = AmpUrl;
