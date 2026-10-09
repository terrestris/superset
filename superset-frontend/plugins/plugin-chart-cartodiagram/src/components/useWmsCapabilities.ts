/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { useEffect, useMemo, useState } from 'react';
import {
  getWmsAvailableLayers,
  WmsCapabilitiesResult,
} from '../util/wmsCapabilitiesUtil';

/** Discover layers once per service, without waiting for a layer name. */
export default function useWmsCapabilities(
  url?: string,
  version?: string,
): WmsCapabilitiesResult {
  const serviceUrl = url?.trim() ?? '';
  const requestKey = JSON.stringify([serviceUrl, version]);
  const [result, setResult] = useState<
    WmsCapabilitiesResult & { key: string }
  >();
  useEffect(() => {
    if (!serviceUrl || !version) return undefined;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const layers = await getWmsAvailableLayers(
          serviceUrl,
          version,
          controller.signal,
        );
        if (!controller.signal.aborted)
          setResult({ key: requestKey, layers, error: false });
      } catch {
        if (!controller.signal.aborted)
          setResult({ key: requestKey, error: true });
      }
    }, 500);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [serviceUrl, version, requestKey]);
  return useMemo(
    () => (result?.key === requestKey ? result : { error: false }),
    [result, requestKey],
  );
}
