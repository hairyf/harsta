import { Wallet } from 'ethers'
import { contracts, signer } from 'harsta/runtime'
import { fixture, initial } from 'harsta/tests'
import { beforeEach, describe, expect, it } from 'vitest'

beforeEach(async () => {
  await initial()
  await fixture([
    'ERC20WithOwnable',
    'ERC20WithTransparent',
    'ERC20WithUUPS',
  ])
}, 5000000)

describe('erc20 transparent and erc20 uups', () => {
  it('mint to random account and', async () => {
    const account = Wallet.createRandom()

    const erc20 = contracts.ERC20WithTransparent.resolve('signer')
    await erc20.mint(account.address, 100).then(trans => trans.wait())

    const balance = await erc20.balanceOf(account.address)
    expect(balance).toBe(BigInt(100))
  })

  it('transfer to random account', async () => {
    const account = Wallet.createRandom()
    const owner = await signer.getAddress()

    const erc20 = contracts.ERC20WithUUPS.resolve('signer')

    await erc20.mint(owner, 100).then(trans => trans.wait())

    await erc20.transfer(account, 100).then(trans => trans.wait())

    const balance = await erc20.balanceOf(account.address)
    expect(balance).toBe(BigInt(100))
  })
})
