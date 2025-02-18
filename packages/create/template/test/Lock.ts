import { time } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { contracts, getSigners, provider } from 'harsta/runtime'
import { initial } from 'harsta/tests'
import { describe, it } from 'vitest'

await initial()

describe('Lock', () => {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployOneYearLockFixture() {
    const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60
    const ONE_GWEI = 1_000_000_000

    const lockedAmount = ONE_GWEI
    const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await getSigners()

    const Lock = contracts.Lock.factory()
    const lock = await Lock.deploy(unlockTime, { value: lockedAmount })

    return { lock, unlockTime, lockedAmount, owner, otherAccount }
  }

  describe('Deployment', () => {
    it('Should set the right unlockTime', async () => {
      const { lock, unlockTime } = await deployOneYearLockFixture()

      expect(await lock.unlockTime()).to.equal(unlockTime)
    })

    it('Should set the right owner', async () => {
      const { lock, owner } = await deployOneYearLockFixture()

      expect(await lock.owner()).to.equal(await owner.getAddress())
    })

    it('Should receive and store the funds to lock', async () => {
      const { lock, lockedAmount } = await deployOneYearLockFixture()

      expect(await provider.getBalance(lock.target)).to.equal(lockedAmount)
    })
  })
})
