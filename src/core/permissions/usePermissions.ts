import { useState, useCallback } from 'react';
import { PermissionHook, PermissionRequest, PermissionResult } from './types';
import { permissions } from './permissions';

/**
 * Hook for managing permissions in Vibing AI apps
 *
 * @returns PermissionHook object with functions to request, check, and manage permissions
 *
 * @example
 * ```tsx
 * const { request, check } = usePermissions();
 *
 * const handleAccessData = async () => {
 *   const result = await request({
 *     type: 'memory',
 *     access: ['read', 'write'],
 *     scope: 'conversation',
 *     purpose: 'Store conversation history'
 *   });
 *
 *   if (result.granted) {
 *     // Access memory
 *   } else {
 *     // Handle permission denied
 *   }
 * };
 *
 * // Check if permission already exists
 * const hasPermission = await check('memory', ['read'], 'conversation');
 * ```
 */
export function usePermissions(): PermissionHook {
  const [_pendingRequests, setPendingRequests] = useState<PermissionRequest[]>([]);

  /**
   * Request a single permission
   */
  const request = useCallback(async (request: PermissionRequest): Promise<PermissionResult> => {
    setPendingRequests(prev => [...prev, request]);

    try {
      const result = await permissions.request(request);
      return result;
    } catch (_error) {
      return {
        granted: false,
        request,
      };
    } finally {
      setPendingRequests(prev => prev.filter(req => req !== request));
    }
  }, []);

  /**
   * Check if a permission exists
   */
  const check = useCallback(
    async (type: string, access: string[], scope?: string): Promise<boolean> => {
      return permissions.check(type, access, scope);
    },
    []
  );

  /**
   * Request multiple permissions at once
   */
  const requestAll = useCallback(
    async (requests: PermissionRequest[]): Promise<PermissionResult[]> => {
      setPendingRequests(prev => [...prev, ...requests]);

      try {
        const results = await Promise.all(requests.map(req => permissions.request(req)));

        return results;
      } catch (_error) {
        // If batch request fails, return denied for all
        return requests.map(request => ({
          granted: false,
          request,
        }));
      } finally {
        setPendingRequests(prev => prev.filter(req => !requests.includes(req)));
      }
    },
    []
  );

  /**
   * Revoke a previously granted permission
   */
  const revoke = useCallback(
    async (type: string, access?: string[], scope?: string): Promise<void> => {
      return permissions.revoke(type, access, scope);
    },
    []
  );

  return {
    request,
    check,
    requestAll,
    revoke,
  };
}
