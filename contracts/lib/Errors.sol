//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

library Errors {
    error AddressUnauthorised();
    error InvalidContent();
    error EmptyString();
    error AddressNotFound();
    error KeyNotUnique();
    error KeyNotFound();
    error InsufficientStake();
    error InsufficientBalance();
    error WithdrawalFailed();
}
