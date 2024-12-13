import { URLExt } from '@jupyterlab/coreutils';
import { ServerConnection } from '@jupyterlab/services';
import { JSONObject } from '@lumino/coreutils';
import { UUID } from '@lumino/coreutils';

/**
 * This namespace contains the interface definitions and methods required
 * for the low-level interaction with the functionality provided by
 * package mosaik_docker_jl on the server.
 */
export namespace MosaikDockerAPI {
  /**
   * Return type for low-level server API calls.
   */
  export interface IRequestResponse {
    code: number;
    message?: any;
    error?: string;
  }

  /**
   * Return type for low-level results from executing code on the server.
   */
  export interface IExecuteResponse {
    status: string;
    error?: string;
  }

  /**
   * Send an HTTP request to the server (mosaik_docker_jl backend).
   * The request will be parsed there and the appropriate API will be called (blocking).
   * The results from this API call are then returned (asynchronously).
   * @param endPoint - request endpoints (as defined by the mosaik_docker_jl backend)
   *
   * @param method - HTTP method
   * @param request - payload of HTTP request
   * @returns Low-level API response
   */
  export async function sendRequest(
    endPoint: string,
    method = 'GET',
    request: Record<string, any> | null = null
  ): Promise<IRequestResponse> {
    // Construct complete request.
    let fullRequest: RequestInit;
    if (request === null) {
      fullRequest = {
        method: method
      };
    } else {
      fullRequest = {
        method: method,
        body: JSON.stringify(request)
      };
    }

    // Retrieve server connection settings.
    const settings = ServerConnection.makeSettings();

    // Specify URL for communicating with the mosaik_docker_jl backend.
    const requestUrl = URLExt.join(
      settings.baseUrl,
      'mosaik_docker_jl', // API Namespace
      endPoint
    );

    // Send request to server.
    let response: Response;
    try {
      response = await ServerConnection.makeRequest(
        requestUrl,
        fullRequest,
        settings
      );
    } catch (error) {
      return Promise.reject(new ServerConnection.NetworkError(TypeError(String(error))));
    }

    // Retrieve low-level API response.
    let data: IRequestResponse;
    try {
      data = await response.json();
    } catch (error) {
      return Promise.reject({ error, response });
    }

    if (!response.ok) {
      return Promise.reject(new ServerConnection.ResponseError(response));
    }

    return Promise.resolve(data);
  }

  /**
   * Make an asynchronous request to the server (using callbacks).
   *
   * @param endPoint - request endpoints (as defined by the demo_app backend)
   * @param onMsg - data can be sent back from the websocket to the frontend asynchronously via this callback function
   * @param onClose - this callback function is executed when the websocket closes
   * @returns execution status
   */
  export async function sendRequestWithCallbacks(
    endPoint: string,
    args: JSONObject,
    onMsg: (msg: MessageEvent) => void | PromiseLike<void>,
    onClose: (msg: CloseEvent) => void | PromiseLike<void>
  ): Promise<IExecuteResponse> {

    try {
      // Create new websocket.
      let ws = await Private._createWebSocket(endPoint, onMsg, onClose);

      // Send a request to the websocket as soon as it is open.
      await ws.send(JSON.stringify(args));
    } catch (error) {
      return Promise.reject({ status: 'error', error: error });
    }

    return Promise.resolve({ status: 'ok' });
  }
}

/**
 * A namespace for private methods.
 */
namespace Private {
  /**
   * Create a new websocket.
   *
   * @param endPoint - request endpoints (as defined by the demo_app backend)
   * @param onMsg - data can be sent back from the websocket to the frontend asynchronously via this callback function
   * @param onClose - this callback function is executed when the websocket closes
   * @returns returns the websocket instance as soon as it opens
   */
  export async function _createWebSocket(
    endPoint: string,
    onMsg: (msg: MessageEvent) => void | PromiseLike<void>,
    onClose: (msg: CloseEvent) => void | PromiseLike<void>
  ): Promise<WebSocket> {
    // Retrieve server connection settings.
    const settings = ServerConnection.makeSettings();

    // Create a unique endpoint with the help of a (random) UUID.
    let url = URLExt.join(
      settings.wsUrl,
      'mosaik_docker_jl', // API Namespace
      endPoint,
      UUID.uuid4()
    );

    // If token authentication is in use.
    const token = settings.token;
    if (settings.appendToken && token !== '') {
      url = url + `&token=${encodeURIComponent(token)}`;
    }

    // Return the websocket as a promise, which resolves as soon as the websocket opens.
    return new Promise(
      (resolve, reject) => {
        // Create new websocket.
        let ws = new settings.WebSocket(url);

        // Ensure incoming binary messages are not blobs.
        ws.binaryType = 'arraybuffer';

        // Set callbacks.
        ws.onmessage = onMsg;
        ws.onclose = onClose;
        ws.onopen = () => {
          // Resolve the promise as soon as the websocket opens.
          resolve(ws);
        };
    });
  }
}
