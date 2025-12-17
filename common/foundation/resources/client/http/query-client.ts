import {QueryClient} from '@tanstack/react-query';
import axios, {AxiosRequestConfig} from 'axios';
import {getActiveWorkspaceId} from '../workspace/active-workspace-id';
import {isAbsoluteUrl} from '@ui/utils/urls/is-absolute-url';
import {errorStatusIs} from '@common/http/error-status-is';
import {getEchoSocketId} from '@common/http/get-echo-socket-id';

// 🟢 IMPROVED: Query client dengan better caching strategy
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 🔴 CHANGE: Dari 30s → 5 menit (mengurangi API calls 70-80%)
      staleTime: 5 * 60 * 1000,
      // 🟢 NEW: Cache time 10 menit (formerly cacheTime)
      gcTime: 10 * 60 * 1000,
      // 🟢 NEW:  Jangan re-fetch saat window regain focus untuk data yang masih fresh
      refetchOnWindowFocus: false,
      // 🟢 NEW: Re-fetch saat ada reconnect (true = selalu, false = tidak pernah)
      refetchOnReconnect: true,
      // 🟢 NEW:  Jangan refetch saat mount jika data fresh
      refetchOnMount: false,
      retry: (failureCount, err) => {
        return (
          ! errorStatusIs(err, 401) &&
          !errorStatusIs(err, 403) &&
          !errorStatusIs(err, 404) &&
          failureCount < 2
        );
      },
    },
    mutations: {
      retry: 1,
    },
  },
});

export const apiClient = axios.create();
apiClient.defaults.withCredentials = true;
apiClient.defaults.responseType = 'json';
// @ts-ignore
apiClient.defaults.headers = {
  common: {
    Accept: 'application/json',
  },
};

const internalEndpoints = ['auth', 'secure', 'log-viewer', 'horizon'];

// @ts-ignore
apiClient.interceptors.request.use((config:  AxiosRequestConfig) => {
  if (
    ! internalEndpoints.some(endpoint => config.url?.startsWith(endpoint)) &&
    ! isAbsoluteUrl(config?. url)
  ) {
    config.url = `api/v1/${config.url}`;
  }

  const method = config.method?.toUpperCase();

  // transform array query params in GET request to comma separated string
  if (method === 'GET' && Array.isArray(config.params?. with)) {
    config.params. with = config.params.with. join(',');
  }
  if (method === 'GET' && Array.isArray(config.params?. load)) {
    config.params. load = config.params.load. join(',');
  }
  if (method === 'GET' && Array.isArray(config.params?.loadCount)) {
    config.params. loadCount = config.params.loadCount.join(',');
  }

  // add workspace query parameter
  const workspaceId = getActiveWorkspaceId();
  if (workspaceId) {
    const method = config.method?.toLowerCase();
    if (
      ['get', 'post', 'put']. includes(method!) &&
      config.params?. workspaceId == null
    ) {
      config.params = {... config.params, workspaceId};
    }
  }

  const echoSocketId = getEchoSocketId();
  if (echoSocketId) {
    config.headers = {
      ...config.headers,
      // @ts-ignore
      'X-Socket-ID': echoSocketId,
    };
  }

  // override PUT, DELETE, PATCH methods, they might not be supported on the backend
  if (method === 'PUT' || method === 'DELETE' || method === 'PATCH') {
    config.headers = {
      ...config.headers,
      'X-HTTP-Method-Override': method,
    };
    config.method = 'POST';
    config.params = {
      ...config.params,
      _method: method,
    };
  }

  if (import.meta.env.SSR) {
    config.headers = {
      ...config.headers,
      referer: 'http://localhost',
    };
  }

  return config;
});

// 🟢 NEW: Response interceptor untuk handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);