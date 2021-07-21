/* eslint-disable consistent-return */
// @ts-nocheck
/**
 * Makes a HTTP GET request to retrieve JSON data from a post of the specified subreddit.
 *
 * @param {Object} options - Function options.
 * @param {string} options.subreddit - The target subreddit to retrieve the post from.
 * @param {string?} [options.sort] - The sorting option to search for data.
 * @returns {Promise<object>} Promise that resolves to a JSON object value.
 */

export default async function redditFetch({
  subreddit,
  sort = 'top',
  nextPage
}) {
  return new Promise((resolve, reject) => {
    if (!subreddit)
      return reject(new Error('Missing required argument "subreddit"'));

    // SUBREDDIT
    if (typeof subreddit !== 'string')
      return reject(
        new TypeError(`Expected type "string" but got "${typeof subreddit}"`)
      );

    // SORT
    if (sort && typeof sort !== 'string')
      return reject(
        new TypeError(`Expected type "string" but got "${typeof sort}"`)
      );


    let targetURL = `https://www.reddit.com/${subreddit.toLowerCase()}.json?sort=${sort.toLowerCase()}&t=week`;

    if (nextPage) {
      targetURL = `${targetURL}&after=${nextPage}`
    }

    // @ts-ignore: No, this expression is in fact callable.
    fetch(targetURL)
      .then(res => res.json())
      .then(body => {
        resolve(body.data);
      })
      .catch(e => {
        console.log('Errror', e);
      });
  });
};
