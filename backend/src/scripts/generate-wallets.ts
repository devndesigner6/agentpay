import algosdk from 'algosdk'

console.log('Generating accounts...')

const cheap = algosdk.generateAccount()
const balanced = algosdk.generateAccount()
const premium = algosdk.generateAccount()

console.log('\n--- CHEAP AI PROVIDER ---')
console.log(`Address: ${cheap.addr}`)
console.log(`Mnemonic: ${algosdk.secretKeyToMnemonic(cheap.sk)}`)

console.log('\n--- BALANCED AI PROVIDER ---')
console.log(`Address: ${balanced.addr}`)
console.log(`Mnemonic: ${algosdk.secretKeyToMnemonic(balanced.sk)}`)

console.log('\n--- PREMIUM AI PROVIDER ---')
console.log(`Address: ${premium.addr}`)
console.log(`Mnemonic: ${algosdk.secretKeyToMnemonic(premium.sk)}`)
