/**
 * PP-A6: Single choke point for private-promise ownership checks.
 *
 * The `visibility` field on a promise (PP-A1) was stored but never enforced -
 * anyone could fetch a private self-promise, its outcomes, or its self-trust
 * score by id. This is the one place that decides whether a requesting user
 * is allowed to see a given promise's data.
 *
 * This is a deliberate stand-in for real auth. Once Epic 6 (auth) and RLS
 * land, this function (and the requestingUserId plumbing that feeds it)
 * gets replaced, not this call site's callers.
 *
 * @param {object|null} promise
 * @param {string} requestingUserId
 * @returns {boolean} true if the requesting user may access this promise.
 */
const canAccessPromise = (promise, requestingUserId) => {
  if (!promise) {
    return false;
  }
  if (promise.visibility !== "private") {
    return true;
  }
  return promise.promiserId === requestingUserId;
};

module.exports = { canAccessPromise };