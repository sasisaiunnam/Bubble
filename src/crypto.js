import sodium from 'libsodium-wrappers';

let isSodiumReady = false;

/**
 * Initializes the sodium library. Must be called and awaited before any other
 * crypto function is used.
 */
export const initSodium = async () => {
  if (isSodiumReady) return;
  await sodium.ready;
  isSodiumReady = true;
  console.log('Sodium (cryptography library) initialized.');
};

/**
 * Generates a new public/private key pair for end-to-end encryption.
 * @returns {{publicKey: Uint8Array, privateKey: Uint8Array}}
 */
export const generateKeys = () => {
  if (!isSodiumReady) throw new Error('Sodium not ready. Call initSodium() first.');
  // Uses crypto_box_keypair for asymmetric encryption
  const { publicKey, privateKey } = sodium.crypto_box_keypair();
  return { publicKey, privateKey };
};

/**
 * A helper to convert a Uint8Array to a Base64 string for easy storage/transmission.
 * @param {Uint8Array} uint8Array The array to convert.
 * @returns {string} The Base64 encoded string.
 */
export const toBase64 = (uint8Array) => {
  if (!isSodiumReady) throw new Error('Sodium not ready.');
  return sodium.to_base64(uint8Array, sodium.base64_variants.ORIGINAL);
};