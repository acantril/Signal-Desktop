// Copyright 2020-2021 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

export async function handleStatusCode(status: number): Promise<void> {
  if (status === 499) {
    window.log.error('Got 499 from Signal Server. Build is expired.');
    await window.storage.put('remoteBuildExpiration', Date.now());
    window.reduxActions.expiration.hydrateExpirationStatus(true);
  }
}

export function translateError(error: Error): Error | undefined {
  const { code } = error;
  if (code === 200) {
    // Happens sometimes when we get no response. Might be nice to get 204 instead.
    return undefined;
  }
  let message: string;
  switch (code) {
    case -1:
      message =
        'Failed to connect to the server, please check your network connection.';
      break;
    case 413:
      message = 'Rate limit exceeded, please try again later.';
      break;
    case 403:
      message = 'Invalid code, please try again.';
      break;
    case 417:
      message = 'Number already registered.';
      break;
    case 401:
      message =
        'Invalid authentication, most likely someone re-registered and invalidated our registration.';
      break;
    case 404:
      message = 'Number is not registered.';
      break;
    default:
      message = 'The server rejected our query, please file a bug report.';
  }
  // eslint-disable-next-line no-param-reassign
  error.message = `${message} (original: ${error.message})`;
  return error;
}
