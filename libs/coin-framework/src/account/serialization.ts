import { log } from "@ledgerhq/logs";
import { BigNumber } from "bignumber.js";
import type { Operation, OperationRaw, SubAccount } from "@ledgerhq/types-live";

export type ExtractExtraFn = (extra: Record<string, any>) => Record<string, any>;

export const toOperationRaw = (
  {
    date,
    value,
    fee,
    subOperations,
    internalOperations,
    nftOperations,
    extra,
    id,
    hash,
    type,
    senders,
    recipients,
    blockHeight,
    blockHash,
    transactionSequenceNumber,
    accountId,
    hasFailed,
    contract,
    operator,
    standard,
    tokenId,
    transactionRaw,
  }: Operation,
  preserveSubOperation?: boolean,
): OperationRaw => {
  // -- THIS CAN BE REMOVED ONCE THE DATE ERROR HAS BEEN FIGURED OUT
  if (date instanceof Date && isNaN(date as unknown as number)) {
    log("Ethereum Date Error", "Date is invalid while serializing", {
      date,
      value,
      fee,
      subOperations,
      internalOperations,
      nftOperations,
      id,
      hash,
      type,
      senders,
      recipients,
      blockHeight,
      blockHash,
      transactionSequenceNumber,
      accountId,
      hasFailed,
      contract,
      operator,
      standard,
      tokenId,
      transactionRaw,
    });
  }
  // -- THIS CAN BE REMOVED ONCE THE DATE ERROR HAS BEEN FIGURED OUT

  const copy: OperationRaw = {
    id,
    hash,
    type,
    senders,
    recipients,
    accountId,
    blockHash,
    blockHeight,
    extra,
    date: date.toISOString(),
    value: value.toFixed(),
    fee: fee.toString(),
    contract,
    operator,
    standard,
    tokenId,
  };

  if (transactionSequenceNumber !== undefined) {
    copy.transactionSequenceNumber = transactionSequenceNumber;
  }

  if (hasFailed !== undefined) {
    copy.hasFailed = hasFailed;
  }

  if (subOperations && preserveSubOperation) {
    copy.subOperations = subOperations.map((o: Operation) => toOperationRaw(o));
  }

  if (internalOperations) {
    copy.internalOperations = internalOperations.map((o: Operation) => toOperationRaw(o));
  }

  if (nftOperations && nftOperations.length > 0) {
    copy.nftOperations = nftOperations.map((o: Operation) => toOperationRaw(o));
  }

  if (transactionRaw !== undefined) {
    copy.transactionRaw = transactionRaw;
  }

  return copy;
};
export const inferSubOperations = (txHash: string, subAccounts: SubAccount[]): Operation[] => {
  const all: Operation[] = [];

  for (let i = 0; i < subAccounts.length; i++) {
    const ta = subAccounts[i];

    for (let j = 0; j < ta.operations.length; j++) {
      const op = ta.operations[j];

      if (op.hash === txHash) {
        all.push(op);
      }
    }

    for (let j = 0; j < ta.pendingOperations.length; j++) {
      const op = ta.pendingOperations[j];

      if (op.hash === txHash) {
        all.push(op);
      }
    }
  }

  return all;
};
export const fromOperationRaw = (
  {
    date,
    value,
    fee,
    extra,
    subOperations,
    internalOperations,
    nftOperations,
    id,
    hash,
    type,
    senders,
    recipients,
    blockHeight,
    blockHash,
    transactionSequenceNumber,
    hasFailed,
    contract,
    operator,
    standard,
    tokenId,
    transactionRaw,
  }: OperationRaw,
  accountId: string,
  subAccounts?: SubAccount[] | null | undefined,
): Operation => {
  const res: Operation = {
    id,
    hash,
    type,
    senders,
    recipients,
    accountId,
    blockHash,
    blockHeight,
    date: new Date(date),
    value: new BigNumber(value),
    fee: new BigNumber(fee),
    extra,
  };

  if (transactionSequenceNumber !== undefined) {
    res.transactionSequenceNumber = transactionSequenceNumber;
  }

  if (hasFailed !== undefined) {
    res.hasFailed = hasFailed;
  }

  if (transactionRaw !== undefined) {
    res.transactionRaw = transactionRaw;
  }

  if (contract !== undefined) {
    res.contract = contract;
  }

  if (operator !== undefined) {
    res.operator = operator;
  }

  if (standard !== undefined) {
    res.standard = standard;
  }

  if (tokenId !== undefined) {
    res.tokenId = tokenId;
  }

  if (subAccounts) {
    res.subOperations = inferSubOperations(hash, subAccounts);
  } else if (subOperations) {
    res.subOperations = subOperations.map((o: OperationRaw) => fromOperationRaw(o, o.accountId));
  }

  if (internalOperations) {
    res.internalOperations = internalOperations.map((o: OperationRaw) =>
      fromOperationRaw(o, o.accountId),
    );
  }

  if (nftOperations && nftOperations.length > 0) {
    res.nftOperations = nftOperations.map((o: OperationRaw) => fromOperationRaw(o, o.accountId));
  }

  return res;
};
