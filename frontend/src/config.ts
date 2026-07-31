/** API base path. Use a full URL only when the frontend and API are hosted separately. */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
export const ALGORAND_NETWORK = import.meta.env.VITE_ALGORAND_NETWORK || 'testnet'
export const PERA_CHAIN_ID = ALGORAND_NETWORK === 'mainnet' ? 416001 : 416002
