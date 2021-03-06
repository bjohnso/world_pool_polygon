import { expect } from "chai";
import { ethers } from "hardhat";

export const poolCreate = (): void => {
  context("#create", async function () {
    before(async function () {
      this.name = "Lorem Ipsum";
      this.description = "lorem ipsum";
      this.minStake = 1050975209;
    });

    it("Should fail to create pool due to EmptyString", async function () {
      const tx = this.worldPool
        .connect(this.signers.poolAdmin)
        .createPool("", this.description, this.minStake);

      await expect(tx).to.be.revertedWith("EmptyString");
    });

    it("Should create pool", async function () {
      const tx = this.worldPool
        .connect(this.signers.poolAdmin)
        .createPool(this.name, this.description, this.minStake);

      await expect(tx).to.be.emit(this.worldPool, "CreatePool");
    });
  });
};

export const poolUpdate = (): void => {
  context("#update", async function () {
    before(async function () {
      this.name = "Lorem Ipsum";
      this.description = "lorem ipsum";
      this.minStake = 1050975209;

      this.newName = "Dolar Sit Amet";
      this.newDescription = "dolar sit amet";
      this.newMinStake = this.minStake * 2;
    });

    beforeEach(async function () {
      const tx = await this.worldPool
        .connect(this.signers.poolAdmin)
        .createPool(this.name, this.description, this.minStake);

      const receipt = await tx.wait();

      this.poolId = receipt.events[0].args[0];
      this.poolOwner = receipt.events[0].args[1];
    });

    it("Should fail to update pool due to EmptyString", async function () {
      const tx = this.worldPool
        .connect(this.signers.poolAdmin)
        .updatePool(this.poolId, "", this.newDescription, this.newMinStake);

      await expect(tx).to.be.revertedWith("EmptyString");
    });

    it("Should fail to update pool due to KeyNotFound", async function () {
      const unknownKey = ethers.utils.formatBytes32String("notFoundKey");

      const tx = this.worldPool
        .connect(this.signers.poolAdmin)
        .updatePool(
          unknownKey,
          this.newName,
          this.newDescription,
          this.newMinStake
        );

      await expect(tx).to.be.revertedWith("KeyNotFound");
    });

    it("Should fail to update pool due to AddressUnauthorised", async function () {
      const tx = this.worldPool
        .connect(this.signers.unauthorised)
        .updatePool(
          this.poolId,
          this.newName,
          this.newDescription,
          this.newMinStake
        );

      await expect(tx).to.be.revertedWith("AddressUnauthorised");
    });

    it("Should update pool", async function () {
      const tx = this.worldPool
        .connect(this.signers.poolAdmin)
        .updatePool(
          this.poolId,
          this.newName,
          this.newDescription,
          this.newMinStake
        );

      await expect(tx).to.be.emit(this.worldPool, "UpdatePool");
    });
  });
};

export const poolDelete = (): void => {
  context("#delete", async function () {
    before(async function () {
      this.name = "Lorem Ipsum";
      this.description = "lorem ipsum";
      this.minStake = 1050975209;
    });

    beforeEach(async function () {
      const tx = await this.worldPool
        .connect(this.signers.poolAdmin)
        .createPool(this.name, this.description, this.minStake);

      const receipt = await tx.wait();

      this.poolId = receipt.events[0].args[0];
      this.poolOwner = receipt.events[0].args[1];
    });

    it("Should fail to delete pool due to KeyNotFound", async function () {
      const unknownKey = ethers.utils.formatBytes32String("notFoundKey");

      const tx = this.worldPool
        .connect(this.signers.poolAdmin)
        .deletePool(unknownKey);

      await expect(tx).to.be.revertedWith("KeyNotFound");
    });

    it("Should fail to delete pool due to AddressUnauthorised", async function () {
      const tx = this.worldPool
        .connect(this.signers.unauthorised)
        .deletePool(this.poolId);

      await expect(tx).to.be.revertedWith("AddressUnauthorised");
    });

    it("Should delete pool", async function () {
      const tx = this.worldPool
        .connect(this.signers.poolAdmin)
        .deletePool(this.poolId);

      await expect(tx).to.be.emit(this.worldPool, "DeletePool");
    });
  });
};

export const escrowCreate = (): void => {
  context("#create", async function () {
    before(async function () {
      this.name = "Lorem Ipsum";
      this.description = "lorem ipsum";
      this.minStake = 1050975209;
    });

    beforeEach(async function () {
      const worldPoolTx = await this.worldPool
        .connect(this.signers.poolAdmin)
        .createPool(this.name, this.description, this.minStake);

      const worldPoolEmissions = await worldPoolTx.wait();

      this.poolId = worldPoolEmissions.events[0].args[0];
    });

    it("Should fail to create escrow due to KeyNotFound", async function () {
      const unknownKey = ethers.utils.formatBytes32String("notFoundKey");

      const tx = this.worldPool
        .connect(this.signers.user)
        .createEscrow(unknownKey, { value: this.minStake });
      await expect(tx).to.be.revertedWith("KeyNotFound");
    });

    it("Should fail to create escrow due to InsufficientStake", async function () {
      const tx = this.worldPool
        .connect(this.signers.user)
        .createEscrow(this.poolId, { value: 1 });
      await expect(tx).to.be.revertedWith("InsufficientStake");
    });

    it("Should create escrow", async function () {
      const tx = this.worldPool
        .connect(this.signers.user)
        .createEscrow(this.poolId, { value: this.minStake });

      await expect(tx).to.be.emit(this.worldPool, "CreateEscrow");
    });
  });
};

export const escrowDeposit = (): void => {
  context("#deposit", async function () {
    before(async function () {
      this.name = "Lorem Ipsum";
      this.description = "lorem ipsum";
      this.minStake = 1050975209;
    });

    beforeEach(async function () {
      const worldPoolTx = await this.worldPool
        .connect(this.signers.poolAdmin)
        .createPool(this.name, this.description, this.minStake);

      const worldPoolReceipt = await worldPoolTx.wait();

      this.poolId = worldPoolReceipt.events[0].args[0];

      const escrowCreateTx = await this.worldPool
        .connect(this.signers.user)
        .createEscrow(this.poolId, { value: this.minStake });

      const escrowCreateEmission = await escrowCreateTx.wait();

      this.escrowId = escrowCreateEmission.events[0].args[0];
    });

    it("Should fail to deposit into escrow due to KeyNotFound", async function () {
      const unknownKey = ethers.utils.formatBytes32String("notFoundKey");

      const tx = this.worldPool
        .connect(this.signers.user)
        .depositEscrow(unknownKey, { value: 1 });

      await expect(tx).to.be.revertedWith("KeyNotFound");
    });

    it("Should fail to deposit into escrow due to AddressUnauthorised", async function () {
      const tx = this.worldPool
        .connect(this.signers.unauthorised)
        .depositEscrow(this.escrowId, { value: 1 });

      await expect(tx).to.be.revertedWith("AddressUnauthorised");
    });

    it("Should deposit into escrow", async function () {
      const tx = this.worldPool
        .connect(this.signers.user)
        .depositEscrow(this.escrowId, { value: 1 });

      await expect(tx).to.be.emit(this.worldPool, "DepositEscrow");
    });
  });
};

export const escrowWithdraw = (): void => {
  context("#withdraw", async function () {
    before(async function () {
      this.name = "Lorem Ipsum";
      this.description = "lorem ipsum";
      this.minStake = 1050975209;
    });

    beforeEach(async function () {
      const worldPoolTx = await this.worldPool
        .connect(this.signers.poolAdmin)
        .createPool(this.name, this.description, this.minStake);

      const worldPoolReceipt = await worldPoolTx.wait();

      this.poolId = worldPoolReceipt.events[0].args[0];

      const escrowCreateTx = await this.worldPool
        .connect(this.signers.user)
        .createEscrow(this.poolId, { value: this.minStake });

      const escrowCreateEmission = await escrowCreateTx.wait();

      this.escrowId = escrowCreateEmission.events[0].args[0];
      this.escrowBalance = escrowCreateEmission.events[0].args[3];
    });

    it("Should fail to withdraw from escrow due to KeyNotFound", async function () {
      const unknownKey = ethers.utils.formatBytes32String("notFoundKey");

      const tx = this.worldPool
        .connect(this.signers.user)
        .withdrawEscrow(unknownKey, this.escrowBalance);

      await expect(tx).to.be.revertedWith("KeyNotFound");
    });

    it("Should fail to withdraw from escrow due to InsufficientBalance", async function () {
      const tx = this.worldPool
        .connect(this.signers.user)
        .withdrawEscrow(this.escrowId, this.escrowBalance + 1);

      await expect(tx).to.be.revertedWith("InsufficientBalance");
    });

    it("Should fail to withdraw from escrow due to AddressUnauthorised", async function () {
      const tx = this.worldPool
        .connect(this.signers.unauthorised)
        .withdrawEscrow(this.escrowId, this.escrowBalance);

      await expect(tx).to.be.revertedWith("AddressUnauthorised");
    });

    it("Should withdraw from escrow", async function () {
      const tx = this.worldPool
        .connect(this.signers.user)
        .withdrawEscrow(this.escrowId, this.escrowBalance);

      await expect(tx).to.be.emit(this.worldPool, "WithdrawEscrow");
    });
  });
};

// export const escrowContractInit = (): void => {
//   context("#contractInit", async function () {
//     it("Should fail to init world pool contract address due to UnauthorisedAddress", async function () {
//       const tx = this.escrow
//         .connect(this.signers.unauthorised)
//         .initWorldPoolContract(this.worldPool.address);
//
//       await expect(tx).to.be.reverted;
//     });
//
//     it("Should init world pool contract address", async function () {
//       const tx = this.escrow
//         .connect(this.signers.deployer)
//         .initWorldPoolContract(this.worldPool.address);
//
//       await expect(tx).to.be.emit(this.escrow, "InitWorldPoolContract");
//     });
//   });
// };
