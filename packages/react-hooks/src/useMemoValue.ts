// Copyright 2017-2023 @polkadot/react-hooks authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo, useRef } from 'react';

import { stringify } from '@polkadot/util';

interface State<T> {
  stringified: string;
  value: T;
}

/**
 * @internal
 *
 * Does a check between two values to determine if they are equivalent. For
 * non-array values it does a simple === compare, for arrays is checks the
 * lengths and the individual items. (This is limited to a depth)
 */
export function isDifferent (a: unknown, b: unknown, depth = -1): boolean {
  // increase the depth for arrays (we start at -1, so 0 is top-level)
  depth++;

  // check the actual value references for an exact match
  return a !== b
    // check if both are arrays with matching length
    ? depth < 2 && Array.isArray(a) && Array.isArray(b) && a.length === b.length
      // check for any differences inside the arrays (with depth)
      ? a.some((ai, i) => isDifferent(ai, b[i], depth))
      // not equal and not an array
      : true
    // straigh match, exact object found
    : false;
}

/**
 * @internal
 *
 * Checks the supplied value against the previous state, returning either the
 * previous state (if we have a match) or a new object for future compares.
 **/
export function getMemoValue <T> (ref: { current: State<T> | null }, value: T): T {
  let curr = ref.current;

  // check that either we have no previous or the value changed
  if (!curr || isDifferent(curr.value, value)) {
    const stringified = stringify({ value });

    // no previous or the stringified result is different
    if (!curr || curr.stringified !== stringified) {
      curr = { stringified, value };
    }
  }

  if (ref.current !== curr) {
    ref.current = curr;
  }

  return ref.current.value;
}

// NOTE: Generic, cannot be used in named hook
export function useMemoValue <T> (value: T): T {
  const ref = useRef<State<T> | null>(null);

  return useMemo(
    () => getMemoValue(ref, value),
    [ref, value]
  );
}
