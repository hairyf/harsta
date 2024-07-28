import { deployments, ethers } from 'hardhat'
import { expect } from 'chai'

describe('storage contract', () => {
  beforeEach(async () => {
    await deployments.fixture(['Storage'])
  })
  it('setStorage', async () => {

  })
  it('getStorage', async () => {
    const Storage = await deployments.get('Storage')
    const storage = await ethers.getContractAt('Storage', Storage.address)
    const result = await storage.getStorage('store-1', ['avatar'])
    expect(result[0].length).equal(0)
    expect(result[1].length).equal(0)
  })
  it('setItem', async () => {})
  it('getItem', async () => {})
  it('size', async () => {})
  it('has', async () => {})
})
