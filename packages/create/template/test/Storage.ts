import { contracts } from 'harsta/runtime'
import { fixture } from 'harsta/tests'

describe('Storage', () => {
  beforeEach(async () => {
    await fixture(['Storage'])
  })
  it('setStorage', async () => {

  })
  it('getStorage', async () => {
    const storage = contracts.Storage.resolve()
    const result = await storage.getStorage('store-1', ['avatar'])
    expect(result[0].length).equal(0)
    expect(result[1].length).equal(0)
  })
  it('setItem', async () => {})
  it('getItem', async () => {})
  it('size', async () => {})
  it('has', async () => {})
})
